import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/lib/api/types";
import { TemplateChannel } from "@prisma/client";

const TemplateCreateSchema = z.object({
  channel: z.enum(["email", "sms", "call"]),
  name: z.string().min(1, "Name is required"),
  subject: z.string().optional().nullable(),
  body: z.string().min(1, "Body is required"),
  tags: z.array(z.string()).optional(),
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
    const channel = searchParams.get("channel");

    const templates = await prisma.template.findMany({
      where: {
        organizationId,
        ...(channel && { channel: channel as TemplateChannel }),
      },
      orderBy: [{ isSystemTemplate: "desc" }, { name: "asc" }],
    });

    return NextResponse.json<ApiResponse<typeof templates>>({
      data: templates,
    });
  } catch (error) {
    console.error("Failed to fetch templates:", error);
    return NextResponse.json<ApiResponse<null>>(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch templates" } },
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

    const body = await request.json();
    const validation = TemplateCreateSchema.safeParse(body);

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

    const template = await prisma.template.create({
      data: {
        organizationId,
        channel: validation.data.channel as TemplateChannel,
        name: validation.data.name,
        subject: validation.data.subject || null,
        body: validation.data.body,
        tags: validation.data.tags || [],
      },
    });

    return NextResponse.json<ApiResponse<typeof template>>(
      { data: template },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create template:", error);
    return NextResponse.json<ApiResponse<null>>(
      { error: { code: "INTERNAL_ERROR", message: "Failed to create template" } },
      { status: 500 }
    );
  }
}
