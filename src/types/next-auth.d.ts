import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      organizations: Array<{
        id: string;
        name: string;
        slug: string;
        role: "OWNER" | "ADMIN" | "MEMBER";
      }>;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    organizations?: Array<{
      id: string;
      name: string;
      slug: string;
      role: "OWNER" | "ADMIN" | "MEMBER";
    }>;
  }
}
