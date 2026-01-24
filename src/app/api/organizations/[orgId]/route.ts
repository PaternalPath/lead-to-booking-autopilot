import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/lib/api/types";

const OrganizationUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  logo: z.string().url().optional().nullable(),
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

    const organization = await prisma.organization.findUnique({
      where: { id: orgId },
      include: {
        _count: {
          select: { members: true, leads: true, tasks: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, image: true },
            },
          },
        },
      },
    });

    if (!organization) {
      return NextResponse.json<ApiResponse<null>>(
        { error: { code: "NOT_FOUND", message: "Organization not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<typeof organization>>({
      data: organization,
    });
  } catch (error) {
    console.error("Failed to fetch organization:", error);
    return NextResponse.json<ApiResponse<null>>(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch organization" } },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json<ApiResponse<null>>(
        { error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
        { status: 401 }
      );
    }

    const { orgId } = await context.params;

    // Verify membership and admin role
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
    const validation = OrganizationUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json<ApiResponse<null>>(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid organization data",
            details: validation.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const organization = await prisma.organization.update({
      where: { id: orgId },
      data: validation.data,
    });

    return NextResponse.json<ApiResponse<typeof organization>>({
      data: organization,
    });
  } catch (error) {
    console.error("Failed to update organization:", error);
    return NextResponse.json<ApiResponse<null>>(
      { error: { code: "INTERNAL_ERROR", message: "Failed to update organization" } },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json<ApiResponse<null>>(
        { error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
        { status: 401 }
      );
    }

    const { orgId } = await context.params;

    // Only OWNER can delete organization
    const membership = await prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId: session.user.id,
          organizationId: orgId,
        },
      },
    });

    if (!membership || membership.role !== "OWNER") {
      return NextResponse.json<ApiResponse<null>>(
        { error: { code: "FORBIDDEN", message: "Only the owner can delete this organization" } },
        { status: 403 }
      );
    }

    // Count user's other organizations
    const otherOrgs = await prisma.organizationMember.count({
      where: {
        userId: session.user.id,
        organizationId: { not: orgId },
      },
    });

    if (otherOrgs === 0) {
      return NextResponse.json<ApiResponse<null>>(
        {
          error: {
            code: "BAD_REQUEST",
            message: "Cannot delete your only organization",
          },
        },
        { status: 400 }
      );
    }

    await prisma.organization.delete({
      where: { id: orgId },
    });

    return NextResponse.json<ApiResponse<void>>({ data: undefined });
  } catch (error) {
    console.error("Failed to delete organization:", error);
    return NextResponse.json<ApiResponse<null>>(
      { error: { code: "INTERNAL_ERROR", message: "Failed to delete organization" } },
      { status: 500 }
    );
  }
}
