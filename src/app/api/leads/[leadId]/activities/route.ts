import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/lib/api/types";
import { ActivityType } from "@prisma/client";

const ActivityCreateSchema = z.object({
  type: z.enum(["note", "call", "email", "sms", "status_change"]),
  body: z.string().min(1, "Activity body is required"),
});

type RouteContext = { params: Promise<{ leadId: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json<ApiResponse<null>>(
        { error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
        { status: 401 }
      );
    }

    const { leadId } = await context.params;
    const organizationId = request.headers.get("x-organization-id");

    if (!organizationId) {
      return NextResponse.json<ApiResponse<null>>(
        { error: { code: "BAD_REQUEST", message: "Organization ID required" } },
        { status: 400 }
      );
    }

    // Verify lead exists and belongs to organization
    const lead = await prisma.lead.findFirst({
      where: {
        id: leadId,
        organizationId,
      },
    });

    if (!lead) {
      return NextResponse.json<ApiResponse<null>>(
        { error: { code: "NOT_FOUND", message: "Lead not found" } },
        { status: 404 }
      );
    }

    const activities = await prisma.activity.findMany({
      where: { leadId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json<ApiResponse<typeof activities>>({
      data: activities,
    });
  } catch (error) {
    console.error("Failed to fetch activities:", error);
    return NextResponse.json<ApiResponse<null>>(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch activities" } },
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

    const { leadId } = await context.params;
    const organizationId = request.headers.get("x-organization-id");

    if (!organizationId) {
      return NextResponse.json<ApiResponse<null>>(
        { error: { code: "BAD_REQUEST", message: "Organization ID required" } },
        { status: 400 }
      );
    }

    // Verify lead exists and belongs to organization
    const lead = await prisma.lead.findFirst({
      where: {
        id: leadId,
        organizationId,
      },
    });

    if (!lead) {
      return NextResponse.json<ApiResponse<null>>(
        { error: { code: "NOT_FOUND", message: "Lead not found" } },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validation = ActivityCreateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json<ApiResponse<null>>(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid activity data",
            details: validation.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const activity = await prisma.activity.create({
      data: {
        organizationId,
        leadId,
        type: validation.data.type as ActivityType,
        body: validation.data.body,
      },
    });

    // Update lead's updatedAt timestamp
    await prisma.lead.update({
      where: { id: leadId },
      data: { updatedById: session.user.id },
    });

    return NextResponse.json<ApiResponse<typeof activity>>(
      { data: activity },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create activity:", error);
    return NextResponse.json<ApiResponse<null>>(
      { error: { code: "INTERNAL_ERROR", message: "Failed to create activity" } },
      { status: 500 }
    );
  }
}
