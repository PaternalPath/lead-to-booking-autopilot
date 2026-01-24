import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  ApiResponse,
  MigrationStats,
  LeadStage,
  ActivityType,
  TaskStatus,
  TaskChannel,
  TemplateChannel,
} from "@/lib/api/types";

// Migration endpoint to transfer localStorage data to database
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

    // Verify membership and must be OWNER or ADMIN
    const membership = await prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId: session.user.id,
          organizationId,
        },
      },
    });

    if (!membership || membership.role === "MEMBER") {
      return NextResponse.json<ApiResponse<null>>(
        {
          error: {
            code: "FORBIDDEN",
            message: "Only organization admins can perform migrations",
          },
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const stats: MigrationStats = {
      leads: 0,
      activities: 0,
      tasks: 0,
      templates: 0,
      cadencePolicies: 0,
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await prisma.$transaction(async (tx: any) => {
      // Create ID mappings for foreign keys
      const leadIdMap = new Map<string, string>();
      const templateIdMap = new Map<string, string>();

      // Import leads
      if (body.leads?.length) {
        for (const lead of body.leads) {
          const created = await tx.lead.create({
            data: {
              organizationId,
              fullName: lead.fullName,
              email: lead.email || null,
              phone: lead.phone || null,
              source: lead.source || null,
              destinationOrServiceIntent: lead.destinationOrServiceIntent || null,
              budgetRange: lead.budgetRange || null,
              timeline: lead.timeline || null,
              notes: lead.notes || null,
              stage: (lead.stage as LeadStage) || "New",
              createdAt: new Date(lead.createdAt),
              updatedAt: new Date(lead.updatedAt),
              createdById: session.user.id,
            },
          });
          leadIdMap.set(lead.id, created.id);
          stats.leads++;
        }
      }

      // Import templates (skip if already have templates)
      const existingTemplates = await tx.template.count({
        where: { organizationId },
      });

      if (body.templates?.length && existingTemplates === 0) {
        for (const template of body.templates) {
          const created = await tx.template.create({
            data: {
              organizationId,
              channel: template.channel as TemplateChannel,
              name: template.name,
              subject: template.subject || null,
              body: template.body,
              tags: template.tags || [],
            },
          });
          templateIdMap.set(template.id, created.id);
          stats.templates++;
        }
      } else {
        // Map existing templates by name for task references
        const templates = await tx.template.findMany({
          where: { organizationId },
        });
        for (const t of templates) {
          // Try to match by common template IDs
          const matchingOld = body.templates?.find(
            (old: { name: string }) => old.name === t.name
          );
          if (matchingOld) {
            templateIdMap.set(matchingOld.id, t.id);
          }
        }
      }

      // Import activities
      if (body.activities?.length) {
        for (const activity of body.activities) {
          const leadId = leadIdMap.get(activity.leadId);
          if (leadId) {
            await tx.activity.create({
              data: {
                organizationId,
                leadId,
                type: activity.type as ActivityType,
                body: activity.body,
                createdAt: new Date(activity.createdAt),
              },
            });
            stats.activities++;
          }
        }
      }

      // Import tasks
      if (body.tasks?.length) {
        for (const task of body.tasks) {
          const leadId = leadIdMap.get(task.leadId);
          const templateId = task.templateId
            ? templateIdMap.get(task.templateId)
            : null;

          if (leadId) {
            await tx.task.create({
              data: {
                organizationId,
                leadId,
                title: task.title,
                dueAt: new Date(task.dueAt),
                status: (task.status as TaskStatus) || "todo",
                channel: task.channel as TaskChannel | null,
                templateId,
              },
            });
            stats.tasks++;
          }
        }
      }

      // Import cadence policies (skip if already have policies)
      const existingPolicies = await tx.cadencePolicy.count({
        where: { organizationId },
      });

      if (body.cadencePolicies?.length && existingPolicies === 0) {
        for (const cadence of body.cadencePolicies) {
          await tx.cadencePolicy.create({
            data: {
              organizationId,
              name: cadence.name,
              rules: cadence.rules,
              isDefault: true,
            },
          });
          stats.cadencePolicies++;
        }
      }
    });

    console.log("Migration completed:", { organizationId, stats });

    return NextResponse.json<ApiResponse<{ imported: MigrationStats }>>({
      data: { imported: stats },
    });
  } catch (error) {
    console.error("Migration failed:", error);
    return NextResponse.json<ApiResponse<null>>(
      { error: { code: "INTERNAL_ERROR", message: "Migration failed" } },
      { status: 500 }
    );
  }
}
