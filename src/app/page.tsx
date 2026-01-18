"use client";

import { useState } from "react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { LeadsList } from "@/components/LeadsList";
import { NewLeadModal } from "@/components/NewLeadModal";
import { Lead } from "@/types/lead";

export default function LeadsPage() {
  const { workspace, addLead, isLoading } = useWorkspace();
  const [isNewLeadModalOpen, setIsNewLeadModalOpen] = useState(false);

  const handleNewLead = (lead: Lead) => {
    addLead(lead);
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
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Leads</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Manage your lead pipeline and track follow-ups.
        </p>
      </div>

      {workspace.leads.length === 0 ? (
        <div className="text-center py-12 bg-zinc-50 dark:bg-zinc-900 rounded-lg border-2 border-dashed border-zinc-300 dark:border-zinc-700">
          <h3 className="mt-2 text-sm font-medium text-zinc-900 dark:text-white">
            No leads yet
          </h3>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Get started by creating a new lead or loading demo data.
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <button
              onClick={() => setIsNewLeadModalOpen(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Create Lead
            </button>
          </div>
        </div>
      ) : (
        <LeadsList leads={workspace.leads} onNewLead={() => setIsNewLeadModalOpen(true)} />
      )}

      <NewLeadModal
        isOpen={isNewLeadModalOpen}
        onClose={() => setIsNewLeadModalOpen(false)}
        onSave={handleNewLead}
      />
    </div>
  );
}
