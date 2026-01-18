"use client";

import { useWorkspace } from "@/contexts/WorkspaceContext";
import { LEAD_STAGES, LEAD_STAGE_LABELS, LeadStage } from "@/types/lead";
import Link from "next/link";
import { format } from "date-fns";

export default function PipelinePage() {
  const { workspace, updateLead, isLoading } = useWorkspace();

  const handleStageChange = (leadId: string, newStage: LeadStage) => {
    updateLead(leadId, { stage: newStage });
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <p className="text-zinc-600 dark:text-zinc-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Pipeline</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Visualize and move leads through your sales pipeline.
        </p>
      </div>

      {workspace.leads.length === 0 ? (
        <div className="text-center py-12 bg-zinc-50 dark:bg-zinc-900 rounded-lg border-2 border-dashed border-zinc-300 dark:border-zinc-700">
          <h3 className="mt-2 text-sm font-medium text-zinc-900 dark:text-white">
            No leads yet
          </h3>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Create some leads to see them in the pipeline view.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {LEAD_STAGES.map((stage) => {
            const leadsInStage = workspace.leads.filter((lead) => lead.stage === stage);

            return (
              <div
                key={stage}
                className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-4 min-h-[200px]"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-sm text-zinc-900 dark:text-white">
                    {LEAD_STAGE_LABELS[stage]}
                  </h3>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-200 dark:bg-zinc-800 px-2 py-1 rounded-full">
                    {leadsInStage.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {leadsInStage.length === 0 ? (
                    <p className="text-xs text-zinc-400 dark:text-zinc-600 text-center py-4">
                      No leads
                    </p>
                  ) : (
                    leadsInStage.map((lead) => (
                      <div
                        key={lead.id}
                        className="bg-white dark:bg-zinc-800 rounded-lg p-3 shadow-sm border border-zinc-200 dark:border-zinc-700 hover:shadow-md transition-shadow"
                      >
                        <Link
                          href={`/leads/${lead.id}`}
                          className="block text-sm font-medium text-zinc-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 mb-2"
                        >
                          {lead.fullName}
                        </Link>

                        {lead.destinationOrServiceIntent && (
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2 truncate">
                            {lead.destinationOrServiceIntent}
                          </p>
                        )}

                        <div className="text-xs text-zinc-400 dark:text-zinc-500 mb-3">
                          {format(lead.createdAt, "MMM d")}
                        </div>

                        <div className="flex gap-1">
                          {stage !== "New" && (
                            <button
                              onClick={() => {
                                const currentIndex = LEAD_STAGES.indexOf(stage);
                                if (currentIndex > 0) {
                                  handleStageChange(lead.id, LEAD_STAGES[currentIndex - 1]);
                                }
                              }}
                              className="flex-1 text-xs px-2 py-1 bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 rounded hover:bg-zinc-200 dark:hover:bg-zinc-600"
                              title="Move backward"
                            >
                              ←
                            </button>
                          )}
                          {stage !== "Lost" && stage !== "Booked" && (
                            <button
                              onClick={() => {
                                const currentIndex = LEAD_STAGES.indexOf(stage);
                                if (currentIndex < LEAD_STAGES.length - 1) {
                                  handleStageChange(lead.id, LEAD_STAGES[currentIndex + 1]);
                                }
                              }}
                              className="flex-1 text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                              title="Move forward"
                            >
                              →
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
