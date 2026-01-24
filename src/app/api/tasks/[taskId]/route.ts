import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApiResponse, TaskChannel, TaskStatus } from "@/lib/api/types";

const TaskUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  dueAt: z.string().or(z.date()).optional(),
  status: z.enum(["todo", "done"]).optional(),
  channel: z.enum(["email", "sms", "call"]).optional().nullable(),
  templateId: z.string().optional().nullable(),
});

type RouteContext = { params: Promise<{ taskId: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json<ApiResponse<null>>(
        { error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
        { status: 401 }
      );
    }

    const { taskId } = await context.params;
    const organizationId = request.headers.get("x-organization-id");

    if (!organizationId) {
      return NextResponse.json<ApiResponse<null>>(
        { error: { code: "BAD_REQUEST", message: "Organization ID required" } },
        { status: 400 }
      );
    }

    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        organizationId,
      },
      include: {
        lead: {
          select: { id: true, fullName: true },
        },
        template: true,
      },
    });

    if (!task) {
      return NextResponse.json<ApiResponse<null>>(
        { error: { code: "NOT_FOUND", message: "Task not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<typeof task>>({ data: task });
  } catch (error) {
    console.error("Failed to fetch task:", error);
    return NextResponse.json<ApiResponse<null>>(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch task" } },
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

    const { taskId } = await context.params;
    const organizationId = request.headers.get("x-organization-id");

    if (!organizationId) {
      return NextResponse.json<ApiResponse<null>>(
        { error: { code: "BAD_REQUEST", message: "Organization ID required" } },
        { status: 400 }
      );
    }

    // Verify task exists and belongs to organization
    const existingTask = await prisma.task.findFirst({
      where: {
        id: taskId,
        organizationId,
      },
    });

    if (!existingTask) {
      return NextResponse.json<ApiResponse<null>>(
        { error: { code: "NOT_FOUND", message: "Task not found" } },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validation = TaskUpdateSchema.safeParse(body);

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

    const task = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...(validation.data.title && { title: validation.data.title }),
        ...(validation.data.dueAt && { dueAt: new Date(validation.data.dueAt) }),
        ...(validation.data.status && { status: validation.data.status as TaskStatus }),
        ...(validation.data.channel !== undefined && {
          channel: validation.data.channel as TaskChannel | null,
        }),
        ...(validation.data.templateId !== undefined && {
          templateId: validation.data.templateId,
        }),
      },
    });

    return NextResponse.json<ApiResponse<typeof task>>({ data: task });
  } catch (error) {
    console.error("Failed to update task:", error);
    return NextResponse.json<ApiResponse<null>>(
      { error: { code: "INTERNAL_ERROR", message: "Failed to update task" } },
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

    const { taskId } = await context.params;
    const organizationId = request.headers.get("x-organization-id");

    if (!organizationId) {
      return NextResponse.json<ApiResponse<null>>(
        { error: { code: "BAD_REQUEST", message: "Organization ID required" } },
        { status: 400 }
      );
    }

    // Verify task exists and belongs to organization
    const existingTask = await prisma.task.findFirst({
      where: {
        id: taskId,
        organizationId,
      },
    });

    if (!existingTask) {
      return NextResponse.json<ApiResponse<null>>(
        { error: { code: "NOT_FOUND", message: "Task not found" } },
        { status: 404 }
      );
    }

    await prisma.task.delete({
      where: { id: taskId },
    });

    return NextResponse.json<ApiResponse<void>>({ data: undefined });
  } catch (error) {
    console.error("Failed to delete task:", error);
    return NextResponse.json<ApiResponse<null>>(
      { error: { code: "INTERNAL_ERROR", message: "Failed to delete task" } },
      { status: 500 }
    );
  }
}
