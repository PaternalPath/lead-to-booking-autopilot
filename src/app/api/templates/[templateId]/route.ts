import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/lib/api/types";
import { TemplateChannel } from "@prisma/client";

const TemplateUpdateSchema = z.object({
  channel: z.enum(["email", "sms", "call"]).optional(),
  name: z.string().min(1).optional(),
  subject: z.string().optional().nullable(),
  body: z.string().min(1).optional(),
  tags: z.array(z.string()).optional(),
});

type RouteContext = { params: Promise<{ templateId: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json<ApiResponse<null>>(
        { error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
        { status: 401 }
      );
    }

    const { templateId } = await context.params;
    const organizationId = request.headers.get("x-organization-id");

    if (!organizationId) {
      return NextResponse.json<ApiResponse<null>>(
        { error: { code: "BAD_REQUEST", message: "Organization ID required" } },
        { status: 400 }
      );
    }

    const template = await prisma.template.findFirst({
      where: {
        id: templateId,
        organizationId,
      },
    });

    if (!template) {
      return NextResponse.json<ApiResponse<null>>(
        { error: { code: "NOT_FOUND", message: "Template not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<typeof template>>({ data: template });
  } catch (error) {
    console.error("Failed to fetch template:", error);
    return NextResponse.json<ApiResponse<null>>(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch template" } },
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

    const { templateId } = await context.params;
    const organizationId = request.headers.get("x-organization-id");

    if (!organizationId) {
      return NextResponse.json<ApiResponse<null>>(
        { error: { code: "BAD_REQUEST", message: "Organization ID required" } },
        { status: 400 }
      );
    }

    // Verify template exists and belongs to organization
    const existingTemplate = await prisma.template.findFirst({
      where: {
        id: templateId,
        organizationId,
      },
    });

    if (!existingTemplate) {
      return NextResponse.json<ApiResponse<null>>(
        { error: { code: "NOT_FOUND", message: "Template not found" } },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validation = TemplateUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json<ApiResponse<null>>(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid template data",
            details: validation.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const template = await prisma.template.update({
      where: { id: templateId },
      data: {
        ...(validation.data.channel && {
          channel: validation.data.channel as TemplateChannel,
        }),
        ...(validation.data.name && { name: validation.data.name }),
        ...(validation.data.subject !== undefined && {
          subject: validation.data.subject,
        }),
        ...(validation.data.body && { body: validation.data.body }),
        ...(validation.data.tags && { tags: validation.data.tags }),
      },
    });

    return NextResponse.json<ApiResponse<typeof template>>({ data: template });
  } catch (error) {
    console.error("Failed to update template:", error);
    return NextResponse.json<ApiResponse<null>>(
      { error: { code: "INTERNAL_ERROR", message: "Failed to update template" } },
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

    const { templateId } = await context.params;
    const organizationId = request.headers.get("x-organization-id");

    if (!organizationId) {
      return NextResponse.json<ApiResponse<null>>(
        { error: { code: "BAD_REQUEST", message: "Organization ID required" } },
        { status: 400 }
      );
    }

    // Verify template exists and belongs to organization
    const existingTemplate = await prisma.template.findFirst({
      where: {
        id: templateId,
        organizationId,
      },
    });

    if (!existingTemplate) {
      return NextResponse.json<ApiResponse<null>>(
        { error: { code: "NOT_FOUND", message: "Template not found" } },
        { status: 404 }
      );
    }

    // Don't allow deleting system templates
    if (existingTemplate.isSystemTemplate) {
      return NextResponse.json<ApiResponse<null>>(
        { error: { code: "FORBIDDEN", message: "Cannot delete system templates" } },
        { status: 403 }
      );
    }

    await prisma.template.delete({
      where: { id: templateId },
    });

    return NextResponse.json<ApiResponse<void>>({ data: undefined });
  } catch (error) {
    console.error("Failed to delete template:", error);
    return NextResponse.json<ApiResponse<null>>(
      { error: { code: "INTERNAL_ERROR", message: "Failed to delete template" } },
      { status: 500 }
    );
  }
}
