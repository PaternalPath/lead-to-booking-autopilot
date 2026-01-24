import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/lib/api/types";
import { LeadStage, Prisma } from "@prisma/client";

const LeadCreateSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  source: z.string().optional().nullable(),
  destinationOrServiceIntent: z.string().optional().nullable(),
  budgetRange: z.string().optional().nullable(),
  timeline: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  stage: z.enum(["New", "Contacted", "Qualified", "ProposalSent", "Booked", "Lost"]).optional(),
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
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = Math.min(parseInt(searchParams.get("pageSize") || "50"), 100);
    const stage = searchParams.get("stage");
    const search = searchParams.get("search");

    const where: Prisma.LeadWhereInput = {
      organizationId,
      ...(stage && { stage: stage as LeadStage }),
      ...(search && {
        OR: [
          { fullName: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { phone: { contains: search } },
        ],
      }),
    };

    const [leads, totalCount] = await Promise.all([
      prisma.lead.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { tasks: true, activities: true } },
        },
      }),
      prisma.lead.count({ where }),
    ]);

    return NextResponse.json<ApiResponse<typeof leads>>({
      data: leads,
      meta: {
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    });
  } catch (error) {
    console.error("Failed to fetch leads:", error);
    return NextResponse.json<ApiResponse<null>>(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch leads" } },
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
    const validation = LeadCreateSchema.safeParse(body);

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

    const lead = await prisma.lead.create({
      data: {
        ...validation.data,
        stage: (validation.data.stage as LeadStage) || "New",
        organizationId,
        createdById: session.user.id,
        updatedById: session.user.id,
      },
    });

    return NextResponse.json<ApiResponse<typeof lead>>(
      { data: lead },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create lead:", error);
    return NextResponse.json<ApiResponse<null>>(
      { error: { code: "INTERNAL_ERROR", message: "Failed to create lead" } },
      { status: 500 }
    );
  }
}
