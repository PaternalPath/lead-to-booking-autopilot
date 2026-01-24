import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/lib/api/types";
import { MemberRole } from "@prisma/client";
import { addDays } from "date-fns";

const InviteMemberSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["ADMIN", "MEMBER"]).default("MEMBER"),
});

type RouteContext = { params: Promise<{ orgId: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json<ApiResponse<null>>(
        { error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
        { status: 401 }
      );
    }

    const { orgId } = await context.params;

    // Verify membership
    const membership = await prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId: session.user.id,
          organizationId: orgId,
        },
      },
    });

    if (!membership) {
      return NextResponse.json<ApiResponse<null>>(
        { error: { code: "FORBIDDEN", message: "Not a member of this organization" } },
        { status: 403 }
      );
    }

    const members = await prisma.organizationMember.findMany({
      where: { organizationId: orgId },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
      orderBy: [{ role: "asc" }, { joinedAt: "asc" }],
    });

    // Also get pending invitations if user is admin
    let invitations: Array<{
      id: string;
      email: string;
      role: MemberRole;
      expiresAt: Date;
    }> = [];

    if (membership.role !== "MEMBER") {
      invitations = await prisma.organizationInvitation.findMany({
        where: {
          organizationId: orgId,
          expiresAt: { gt: new Date() },
        },
        select: { id: true, email: true, role: true, expiresAt: true },
      });
    }

    return NextResponse.json<ApiResponse<{ members: typeof members; invitations: typeof invitations }>>({
      data: { members, invitations },
    });
  } catch (error) {
    console.error("Failed to fetch members:", error);
    return NextResponse.json<ApiResponse<null>>(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch members" } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json<ApiResponse<null>>(
        { error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
        { status: 401 }
      );
    }

    const { orgId } = await context.params;

    // Verify admin role
    const membership = await prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId: session.user.id,
          organizationId: orgId,
        },
      },
    });

    if (!membership || membership.role === "MEMBER") {
      return NextResponse.json<ApiResponse<null>>(
        { error: { code: "FORBIDDEN", message: "Admin access required" } },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = InviteMemberSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json<ApiResponse<null>>(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid invitation data",
            details: validation.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const { email, role } = validation.data;

    // Check if user already exists and is already a member
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      const existingMembership = await prisma.organizationMember.findUnique({
        where: {
          userId_organizationId: {
            userId: existingUser.id,
            organizationId: orgId,
          },
        },
      });

      if (existingMembership) {
        return NextResponse.json<ApiResponse<null>>(
          {
            error: {
              code: "CONFLICT",
              message: "User is already a member of this organization",
            },
          },
          { status: 409 }
        );
      }

      // Add existing user directly
      const newMembership = await prisma.organizationMember.create({
        data: {
          userId: existingUser.id,
          organizationId: orgId,
          role: role as MemberRole,
        },
        include: {
          user: {
            select: { id: true, name: true, email: true, image: true },
          },
        },
      });

      return NextResponse.json<ApiResponse<typeof newMembership>>(
        { data: newMembership },
        { status: 201 }
      );
    }

    // Check for existing invitation
    const existingInvitation = await prisma.organizationInvitation.findUnique({
      where: {
        email_organizationId: {
          email,
          organizationId: orgId,
        },
      },
    });

    if (existingInvitation) {
      // Update existing invitation
      const invitation = await prisma.organizationInvitation.update({
        where: { id: existingInvitation.id },
        data: {
          role: role as MemberRole,
          expiresAt: addDays(new Date(), 7),
        },
      });

      return NextResponse.json<ApiResponse<typeof invitation>>({
        data: invitation,
      });
    }

    // Create new invitation
    const invitation = await prisma.organizationInvitation.create({
      data: {
        email,
        organizationId: orgId,
        role: role as MemberRole,
        expiresAt: addDays(new Date(), 7),
      },
    });

    // In production, you would send an email here
    console.log(`Invitation created for ${email} to organization ${orgId}`);

    return NextResponse.json<ApiResponse<typeof invitation>>(
      { data: invitation },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to invite member:", error);
    return NextResponse.json<ApiResponse<null>>(
      { error: { code: "INTERNAL_ERROR", message: "Failed to invite member" } },
      { status: 500 }
    );
  }
}
