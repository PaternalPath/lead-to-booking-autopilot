import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { Adapter } from "next-auth/adapters";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
    signUp: "/auth/signup",
    error: "/auth/error",
    newUser: "/onboarding",
  },
  providers: [
    // Email/Password authentication
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password required");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.passwordHash) {
          throw new Error("Invalid credentials");
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isValid) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),

    // Google OAuth (if configured)
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),

    // GitHub OAuth (if configured)
    ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
      ? [
          GitHubProvider({
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
          }),
        ]
      : []),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
      }

      // Fetch user's organizations on every JWT refresh
      if (token.userId) {
        const memberships = await prisma.organizationMember.findMany({
          where: { userId: token.userId as string },
          include: {
            organization: {
              select: { id: true, name: true, slug: true },
            },
          },
        });
        token.organizations = memberships.map((m) => ({
          id: m.organization.id,
          name: m.organization.name,
          slug: m.organization.slug,
          role: m.role,
        }));
      }

      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.userId as string;
        session.user.organizations = token.organizations as Array<{
          id: string;
          name: string;
          slug: string;
          role: string;
        }>;
      }
      return session;
    },
  },

  events: {
    async createUser({ user }) {
      // Create a personal organization for new users
      const displayName = user.name || user.email?.split("@")[0] || "User";
      const slug = `user-${user.id.substring(0, 8)}`;

      const org = await prisma.organization.create({
        data: {
          name: `${displayName}'s Workspace`,
          slug,
          members: {
            create: {
              userId: user.id,
              role: "OWNER",
            },
          },
        },
      });

      // Seed default templates for the new organization
      await seedOrganizationDefaults(org.id);
    },
  },
};

// Seed default templates and cadence for a new organization
async function seedOrganizationDefaults(organizationId: string) {
  // Default email templates
  const templates = [
    {
      channel: "email" as const,
      name: "Welcome Email",
      subject: "Thanks for reaching out!",
      body: `Hi {{firstName}},

Thank you for reaching out! I'm excited to help you plan your upcoming trip.

I'd love to learn more about what you're looking for. Could you share:
- Your preferred travel dates
- Number of travelers
- Any must-see destinations or experiences

Looking forward to creating something amazing for you!

Best regards`,
      tags: ["welcome", "new-lead"],
      isSystemTemplate: true,
    },
    {
      channel: "email" as const,
      name: "Follow-up Email",
      subject: "Following up on your travel plans",
      body: `Hi {{firstName}},

I wanted to follow up on our conversation about your travel plans.

Have you had a chance to think about the options we discussed? I'm happy to answer any questions or explore other alternatives.

Let me know how I can help!

Best regards`,
      tags: ["follow-up"],
      isSystemTemplate: true,
    },
    {
      channel: "sms" as const,
      name: "Quick Check-in",
      body: "Hi {{firstName}}! Just checking in on your travel plans. Any questions I can help with?",
      tags: ["follow-up", "quick"],
      isSystemTemplate: true,
    },
    {
      channel: "call" as const,
      name: "Discovery Call Script",
      body: `Discovery Call Agenda:

1. Introduction & rapport building
2. Understand travel goals and preferences
3. Discuss budget and timeline
4. Present initial recommendations
5. Address questions and concerns
6. Outline next steps

Key Questions:
- What inspired this trip?
- Have you traveled to similar destinations before?
- What's most important to you in this experience?`,
      tags: ["discovery", "script"],
      isSystemTemplate: true,
    },
  ];

  await prisma.template.createMany({
    data: templates.map((t) => ({
      ...t,
      organizationId,
    })),
  });

  // Default cadence policy
  await prisma.cadencePolicy.create({
    data: {
      organizationId,
      name: "Standard Follow-up Cadence",
      isDefault: true,
      rules: [
        { dayOffset: 0, channel: "email", taskTitle: "Send welcome email" },
        { dayOffset: 1, channel: "sms", taskTitle: "Quick SMS check-in" },
        { dayOffset: 3, channel: "call", taskTitle: "Discovery call" },
        { dayOffset: 7, channel: "email", taskTitle: "Follow-up email" },
        { dayOffset: 14, channel: "call", taskTitle: "Final follow-up call" },
      ],
    },
  });
}

// Password hashing utility
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}
