"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { AppLayout } from "@/components/layout/app-layout";
import { getLeads, setLeads, getActivities, setActivities } from "@/lib/storage";
import { useToast } from "@/components/ui/toast";
import type { Lead, Activity, LeadStage } from "@/types";
import { ArrowLeft, Mail, Phone, MapPin, Calendar, DollarSign } from "lucide-react";
import Link from "next/link";
import { nanoid } from "nanoid";
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

export default function LeadDetailPage() {
  const params = useParams();
  const { showToast } = useToast();
  const [lead, setLead] = useState<Lead | null>(() => {
    const leads = getLeads();
    return leads.find((l) => l.id === params.id) || null;
  });
  const [activities, setActivitiesState] = useState<Activity[]>(() => {
    const leads = getLeads();
    const foundLead = leads.find((l) => l.id === params.id);
    if (!foundLead) return [];
    const allActivities = getActivities();
    return allActivities.filter((a) => a.leadId === foundLead.id);
  });
  const [newNote, setNewNote] = useState("");

  const handleStageChange = (newStage: LeadStage) => {
    if (!lead) return;

    const leads = getLeads();
    const updatedLeads = leads.map((l) =>
      l.id === lead.id
        ? { ...l, stage: newStage, updatedAt: new Date().toISOString() }
        : l
    );
    setLeads(updatedLeads);

    const newActivity: Activity = {
      id: nanoid(),
      leadId: lead.id,
      type: "stage_change",
      description: `Stage changed to ${newStage}`,
      metadata: { newStage },
      createdAt: new Date().toISOString(),
    };

    const allActivities = getActivities();
    setActivities([newActivity, ...allActivities]);
    setActivitiesState([newActivity, ...activities]);

    setLead({ ...lead, stage: newStage });
    showToast("Lead stage updated", "success");
  };

  const handleAddNote = () => {
    if (!lead || !newNote.trim()) return;

    const leads = getLeads();
    const updatedLeads = leads.map((l) =>
      l.id === lead.id
        ? {
            ...l,
            notes: l.notes ? `${l.notes}\n\n${newNote}` : newNote,
            updatedAt: new Date().toISOString(),
          }
        : l
    );
    setLeads(updatedLeads);

    const newActivity: Activity = {
      id: nanoid(),
      leadId: lead.id,
      type: "note_added",
      description: "Note added",
      metadata: { note: newNote },
      createdAt: new Date().toISOString(),
    };

    const allActivities = getActivities();
    setActivities([newActivity, ...allActivities]);
    setActivitiesState([newActivity, ...activities]);

    setLead({
      ...lead,
      notes: lead.notes ? `${lead.notes}\n\n${newNote}` : newNote,
    });
    setNewNote("");
    showToast("Note added", "success");
  };

  if (!lead) {
    return (
      <AppLayout title="Lead Details">
        <div className="flex h-full items-center justify-center">
          <p className="text-gray-500">Lead not found</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Lead Details">
      <div className="p-6">
        {/* Back button */}
        <Link
          href="/leads"
          className="mb-6 inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Leads
        </Link>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="rounded-lg bg-white p-6 shadow">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {lead.firstName} {lead.lastName}
                  </h1>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center text-gray-600">
                      <Mail className="mr-2 h-4 w-4" />
                      {lead.email}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Phone className="mr-2 h-4 w-4" />
                      {lead.phone}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stage
                  </label>
                  <select
                    value={lead.stage}
                    onChange={(e) => handleStageChange(e.target.value as LeadStage)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold ${STAGE_COLORS[lead.stage]} border-0 focus:ring-2 focus:ring-blue-500`}
                  >
                    {STAGE_OPTIONS.map((stage) => (
                      <option key={stage} value={stage}>
                        {stage}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t pt-4">
                <div>
                  <div className="text-sm font-medium text-gray-500">
                    Destination
                  </div>
                  <div className="mt-1 flex items-center text-gray-900">
                    <MapPin className="mr-2 h-4 w-4 text-gray-400" />
                    {lead.destination || "—"}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">
                    Travel Dates
                  </div>
                  <div className="mt-1 flex items-center text-gray-900">
                    <Calendar className="mr-2 h-4 w-4 text-gray-400" />
                    {lead.dates || "—"}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Budget</div>
                  <div className="mt-1 flex items-center text-gray-900">
                    <DollarSign className="mr-2 h-4 w-4 text-gray-400" />
                    {lead.budget || "—"}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Source</div>
                  <div className="mt-1 text-gray-900">{lead.source}</div>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h3 className="mb-4 text-lg font-medium text-gray-900">Notes</h3>
              {lead.notes && (
                <div className="mb-4 whitespace-pre-wrap rounded-md bg-gray-50 p-4 text-sm text-gray-700">
                  {lead.notes}
                </div>
              )}
              <div className="space-y-3">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add a note..."
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 p-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  onClick={handleAddNote}
                  disabled={!newNote.trim()}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Add Note
                </button>
              </div>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="lg:col-span-1">
            <div className="rounded-lg bg-white p-6 shadow">
              <h3 className="mb-4 text-lg font-medium text-gray-900">
                Activity Timeline
              </h3>
              {activities.length === 0 ? (
                <p className="text-sm text-gray-500">No activity yet</p>
              ) : (
                <div className="space-y-4">
                  {activities.map((activity, index) => (
                    <div key={activity.id} className="relative">
                      {index !== activities.length - 1 && (
                        <div className="absolute left-2 top-6 h-full w-px bg-gray-200" />
                      )}
                      <div className="flex items-start gap-3">
                        <div className="relative mt-1 h-4 w-4 rounded-full bg-blue-500" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {activity.description}
                          </p>
                          {activity.metadata?.note ? (
                            <p className="mt-1 text-xs text-gray-600">
                              {String(activity.metadata.note).substring(0, 100)}
                              {String(activity.metadata.note).length > 100
                                ? "..."
                                : ""}
                            </p>
                          ) : null}
                          <p className="mt-1 text-xs text-gray-500">
                            {formatDistanceToNow(new Date(activity.createdAt), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
