"use client";

import { useState } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/app-layout";
import { getLeads } from "@/lib/storage";
import type { Lead, LeadStage } from "@/types";
import { Search, ChevronRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const STAGE_OPTIONS: LeadStage[] = [
  "New",
  "Qualified",
  "Consult Booked",
  "Quote Sent",
  "Booked",
  "Dormant",
];

const STAGE_COLORS: Record<LeadStage, string> = {
  New: "bg-blue-100 text-blue-800",
  Qualified: "bg-green-100 text-green-800",
  "Consult Booked": "bg-purple-100 text-purple-800",
  "Quote Sent": "bg-orange-100 text-orange-800",
  Booked: "bg-emerald-100 text-emerald-800",
  Dormant: "bg-gray-100 text-gray-800",
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
      <div className="p-6">
        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search leads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value as LeadStage | "All")}
              className="rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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

        {/* Leads Table */}
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Stage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Next Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Source
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Owner
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
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
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <p className="text-gray-500">No leads found</p>
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex flex-col">
                        <div className="font-medium text-gray-900">
                          {lead.firstName} {lead.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{lead.email}</div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${STAGE_COLORS[lead.stage]}`}
                      >
                        {lead.stage}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {lead.nextActionAt
                        ? new Date(lead.nextActionAt).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {lead.source}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {lead.owner}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {formatDistanceToNow(new Date(lead.updatedAt), {
                        addSuffix: true,
                      })}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <Link
                        href={`/leads/${lead.id}`}
                        className="inline-flex items-center text-blue-600 hover:text-blue-900"
                      >
                        View
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="mt-4 text-sm text-gray-500">
          Showing {filteredLeads.length} of {leads.length} leads
        </div>
      </div>
    </AppLayout>
  );
}
