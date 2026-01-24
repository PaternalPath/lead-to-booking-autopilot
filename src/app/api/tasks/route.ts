import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApiResponse, TaskChannel, PrismaTypes } from "@/lib/api/types";

const TaskCreateSchema = z.object({
  leadId: z.string().min(1, "Lead ID is required"),
  title: z.string().min(1, "Title is required"),
  dueAt: z.string().or(z.date()),
  channel: z.enum(["email", "sms", "call"]).optional().nullable(),
  templateId: z.string().optional().nullable(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json<ApiResponse<null>>(
        { error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
        { status: 401 }
      );
    }

    const organizationId = request.headers.get("x-organization-id");
    if (!organizationId) {
      return NextResponse.json<ApiResponse<null>>(
        { error: { code: "BAD_REQUEST", message: "Organization ID required" } },
        { status: 400 }
      );
    }

    // Verify membership
    const membership = await prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId: session.user.id,
          organizationId,
        },
      },
    });

    if (!membership) {
      return NextResponse.json<ApiResponse<null>>(
        { error: { code: "FORBIDDEN", message: "Not a member of this organization" } },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get("leadId");
    const status = searchParams.get("status");

    const where: PrismaTypes.TaskWhereInput = {
      organizationId,
      ...(leadId && { leadId }),
      ...(status && { status: status as "todo" | "done" }),
    };

    const tasks = await prisma.task.findMany({
      where,
      orderBy: { dueAt: "asc" },
      include: {
        lead: {
          select: { id: true, fullName: true },
        },
        template: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json<ApiResponse<typeof tasks>>({ data: tasks });
  } catch (error) {
    console.error("Failed to fetch tasks:", error);
    return NextResponse.json<ApiResponse<null>>(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch tasks" } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json<ApiResponse<null>>(
        { error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
        { status: 401 }
      );
    }

    const organizationId = request.headers.get("x-organization-id");
    if (!organizationId) {
      return NextResponse.json<ApiResponse<null>>(
        { error: { code: "BAD_REQUEST", message: "Organization ID required" } },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validation = TaskCreateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json<ApiResponse<null>>(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid task data",
            details: validation.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    // Verify lead exists and belongs to organization
    const lead = await prisma.lead.findFirst({
      where: {
        id: validation.data.leadId,
        organizationId,
      },
    });

    if (!lead) {
      return NextResponse.json<ApiResponse<null>>(
        { error: { code: "NOT_FOUND", message: "Lead not found" } },
        { status: 404 }
      );
    }

    // Verify template exists if provided
    if (validation.data.templateId) {
      const template = await prisma.template.findFirst({
        where: {
          id: validation.data.templateId,
          organizationId,
        },
      });

      if (!template) {
        return NextResponse.json<ApiResponse<null>>(
          { error: { code: "NOT_FOUND", message: "Template not found" } },
          { status: 404 }
        );
      }
    }

    const task = await prisma.task.create({
      data: {
        organizationId,
        leadId: validation.data.leadId,
        title: validation.data.title,
        dueAt: new Date(validation.data.dueAt),
        channel: validation.data.channel as TaskChannel | null,
        templateId: validation.data.templateId || null,
      },
    });

    return NextResponse.json<ApiResponse<typeof task>>(
      { data: task },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create task:", error);
    return NextResponse.json<ApiResponse<null>>(
      { error: { code: "INTERNAL_ERROR", message: "Failed to create task" } },
      { status: 500 }
    );
  }
}
