import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApiResponse, LeadStage } from "@/lib/api/types";

const LeadUpdateSchema = z.object({
  fullName: z.string().min(1).optional(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  source: z.string().optional().nullable(),
  destinationOrServiceIntent: z.string().optional().nullable(),
  budgetRange: z.string().optional().nullable(),
  timeline: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  stage: z.enum(["New", "Contacted", "Qualified", "ProposalSent", "Booked", "Lost"]).optional(),
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

    const lead = await prisma.lead.findFirst({
      where: {
        id: leadId,
        organizationId,
      },
      include: {
        activities: {
          orderBy: { createdAt: "desc" },
        },
        tasks: {
          orderBy: { dueAt: "asc" },
        },
      },
    });

    if (!lead) {
      return NextResponse.json<ApiResponse<null>>(
        { error: { code: "NOT_FOUND", message: "Lead not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<typeof lead>>({ data: lead });
  } catch (error) {
    console.error("Failed to fetch lead:", error);
    return NextResponse.json<ApiResponse<null>>(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch lead" } },
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

    const { leadId } = await context.params;
    const organizationId = request.headers.get("x-organization-id");

    if (!organizationId) {
      return NextResponse.json<ApiResponse<null>>(
        { error: { code: "BAD_REQUEST", message: "Organization ID required" } },
        { status: 400 }
      );
    }

    // Verify lead exists and belongs to organization
    const existingLead = await prisma.lead.findFirst({
      where: {
        id: leadId,
        organizationId,
      },
    });

    if (!existingLead) {
      return NextResponse.json<ApiResponse<null>>(
        { error: { code: "NOT_FOUND", message: "Lead not found" } },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validation = LeadUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json<ApiResponse<null>>(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid lead data",
            details: validation.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    // Track stage change for activity log
    const stageChanged = validation.data.stage && validation.data.stage !== existingLead.stage;

    const lead = await prisma.lead.update({
      where: { id: leadId },
      data: {
        ...validation.data,
        stage: validation.data.stage as LeadStage | undefined,
        updatedById: session.user.id,
      },
    });

    // Log stage change as activity
    if (stageChanged) {
      await prisma.activity.create({
        data: {
          organizationId,
          leadId,
          type: "status_change",
          body: `Stage changed from ${existingLead.stage} to ${validation.data.stage}`,
        },
      });
    }

    return NextResponse.json<ApiResponse<typeof lead>>({ data: lead });
  } catch (error) {
    console.error("Failed to update lead:", error);
    return NextResponse.json<ApiResponse<null>>(
      { error: { code: "INTERNAL_ERROR", message: "Failed to update lead" } },
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

    const { leadId } = await context.params;
    const organizationId = request.headers.get("x-organization-id");

    if (!organizationId) {
      return NextResponse.json<ApiResponse<null>>(
        { error: { code: "BAD_REQUEST", message: "Organization ID required" } },
        { status: 400 }
      );
    }

    // Verify lead exists and belongs to organization
    const existingLead = await prisma.lead.findFirst({
      where: {
        id: leadId,
        organizationId,
      },
    });

    if (!existingLead) {
      return NextResponse.json<ApiResponse<null>>(
        { error: { code: "NOT_FOUND", message: "Lead not found" } },
        { status: 404 }
      );
    }

    // Delete lead (cascades to activities and tasks)
    await prisma.lead.delete({
      where: { id: leadId },
    });

    return NextResponse.json<ApiResponse<void>>({ data: undefined });
  } catch (error) {
    console.error("Failed to delete lead:", error);
    return NextResponse.json<ApiResponse<null>>(
      { error: { code: "INTERNAL_ERROR", message: "Failed to delete lead" } },
      { status: 500 }
    );
  }
}
