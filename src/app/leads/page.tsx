"use client";

import { useState } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/app-layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { getLeads } from "@/lib/storage";
import type { Lead, LeadStage } from "@/types";
import { Search, ChevronRight, Users, Filter } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const STAGE_OPTIONS: LeadStage[] = [
  "New",
  "Qualified",
  "Consult Booked",
  "Quote Sent",
  "Booked",
  "Dormant",
];

const STAGE_VARIANTS: Record<LeadStage, "default" | "success" | "warning" | "danger" | "info" | "secondary"> = {
  New: "default",
  Qualified: "success",
  "Consult Booked": "info",
  "Quote Sent": "warning",
  Booked: "success",
  Dormant: "secondary",
};

export default function LeadsPage() {
  const [leads] = useState<Lead[]>(() => getLeads());
  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<LeadStage | "All">("All");

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      searchQuery === "" ||
      lead.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.destination?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStage = stageFilter === "All" || lead.stage === stageFilter;

    return matchesSearch && matchesStage;
  });

  return (
    <AppLayout title="Leads">
      <div className="space-y-6">
        {/* Filters */}
        <Card className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by name, email, or destination..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value as LeadStage | "All")}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <option value="All">All Stages</option>
                {STAGE_OPTIONS.map((stage) => (
                  <option key={stage} value={stage}>
                    {stage}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Leads Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Lead
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Stage
                  </th>
                  <th className="hidden px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 md:table-cell">
                    Next Action
                  </th>
                  <th className="hidden px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 lg:table-cell">
                    Source
                  </th>
                  <th className="hidden px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 xl:table-cell">
                    Updated
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12">
                      <EmptyState
                        icon={<Users className="h-12 w-12" />}
                        title={searchQuery || stageFilter !== "All" ? "No leads found" : "No leads yet"}
                        description={
                          searchQuery || stageFilter !== "All"
                            ? "Try adjusting your search or filters"
                            : "Leads will appear here once they're added to the system"
                        }
                      />
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => (
                    <tr
                      key={lead.id}
                      className="transition-colors hover:bg-gray-50"
                    >
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex flex-col">
                          <Link
                            href={`/leads/${lead.id}`}
                            className="font-medium text-gray-900 hover:text-blue-600"
                          >
                            {lead.firstName} {lead.lastName}
                          </Link>
                          <div className="text-sm text-gray-500">{lead.email}</div>
                          {lead.destination && (
                            <div className="mt-1 text-xs text-gray-400">
                              {lead.destination}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <Badge variant={STAGE_VARIANTS[lead.stage]}>
                          {lead.stage}
                        </Badge>
                      </td>
                      <td className="hidden whitespace-nowrap px-6 py-4 text-sm text-gray-500 md:table-cell">
                        {lead.nextActionAt
                          ? new Date(lead.nextActionAt).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="hidden whitespace-nowrap px-6 py-4 text-sm text-gray-500 lg:table-cell">
                        {lead.source}
                      </td>
                      <td className="hidden whitespace-nowrap px-6 py-4 text-sm text-gray-500 xl:table-cell">
                        {formatDistanceToNow(new Date(lead.updatedAt), {
                          addSuffix: true,
                        })}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                        <Link
                          href={`/leads/${lead.id}`}
                          className="inline-flex items-center gap-1 text-blue-600 transition-colors hover:text-blue-800"
                        >
                          View
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Summary */}
        {filteredLeads.length > 0 && (
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>
              Showing <span className="font-medium">{filteredLeads.length}</span> of{" "}
              <span className="font-medium">{leads.length}</span> leads
            </div>
            {(searchQuery || stageFilter !== "All") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setStageFilter("All");
                }}
                className="text-blue-600 hover:text-blue-800"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
