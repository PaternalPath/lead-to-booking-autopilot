"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { getLeads, setLeads, getActivities, setActivities } from "@/lib/storage";
import { useToast } from "@/components/ui/toast";
import type { Lead, Activity, LeadStage } from "@/types";
import { ArrowLeft, Mail, Phone, MapPin, Calendar, DollarSign, User } from "lucide-react";
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

const STAGE_VARIANTS: Record<LeadStage, "default" | "success" | "warning" | "danger" | "info" | "secondary"> = {
  New: "default",
  Qualified: "success",
  "Consult Booked": "info",
  "Quote Sent": "warning",
  Booked: "success",
  Dormant: "secondary",
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
        <Card className="p-12">
          <div className="text-center">
            <p className="text-gray-500">Lead not found</p>
            <Link href="/leads" className="mt-4 inline-block text-blue-600 hover:text-blue-800">
              ← Back to Leads
            </Link>
          </div>
        </Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Lead Details">
      <div className="space-y-6">
        {/* Back button */}
        <Link
          href="/leads"
          className="inline-flex items-center text-sm text-gray-600 transition-colors hover:text-gray-900"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Leads
        </Link>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                      <User className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">
                        {lead.firstName} {lead.lastName}
                      </h1>
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="mr-2 h-4 w-4" />
                          <a href={`mailto:${lead.email}`} className="hover:text-blue-600">
                            {lead.email}
                          </a>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="mr-2 h-4 w-4" />
                          <a href={`tel:${lead.phone}`} className="hover:text-blue-600">
                            {lead.phone}
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Stage
                    </label>
                    <select
                      value={lead.stage}
                      onChange={(e) => handleStageChange(e.target.value as LeadStage)}
                      className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      {STAGE_OPTIONS.map((stage) => (
                        <option key={stage} value={stage}>
                          {stage}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-6 border-t pt-6 md:grid-cols-4">
                  <div>
                    <div className="flex items-center text-sm font-medium text-gray-500">
                      <MapPin className="mr-2 h-4 w-4" />
                      Destination
                    </div>
                    <div className="mt-1 text-gray-900">{lead.destination || "—"}</div>
                  </div>
                  <div>
                    <div className="flex items-center text-sm font-medium text-gray-500">
                      <Calendar className="mr-2 h-4 w-4" />
                      Travel Dates
                    </div>
                    <div className="mt-1 text-gray-900">{lead.dates || "—"}</div>
                  </div>
                  <div>
                    <div className="flex items-center text-sm font-medium text-gray-500">
                      <DollarSign className="mr-2 h-4 w-4" />
                      Budget
                    </div>
                    <div className="mt-1 text-gray-900">{lead.budget || "—"}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500">Source</div>
                    <div className="mt-1 text-gray-900">{lead.source}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {lead.notes && (
                  <div className="whitespace-pre-wrap rounded-lg bg-gray-50 p-4 text-sm text-gray-700">
                    {lead.notes}
                  </div>
                )}
                <div className="space-y-3">
                  <Textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add a note about this lead..."
                    rows={3}
                  />
                  <Button onClick={handleAddNote} disabled={!newNote.trim()} size="sm">
                    Add Note
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activity Timeline */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Activity Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                {activities.length === 0 ? (
                  <p className="text-center text-sm text-gray-500">No activity yet</p>
                ) : (
                  <div className="space-y-6">
                    {activities.map((activity, index) => (
                      <div key={activity.id} className="relative">
                        {index !== activities.length - 1 && (
                          <div className="absolute left-2 top-6 h-full w-px bg-gray-200" />
                        )}
                        <div className="flex gap-4">
                          <div className="relative mt-1 flex h-4 w-4 shrink-0 items-center justify-center">
                            <div className="h-2 w-2 rounded-full bg-blue-500 ring-4 ring-white" />
                          </div>
                          <div className="flex-1 pb-4">
                            <p className="text-sm font-medium text-gray-900">
                              {activity.description}
                            </p>
                            {activity.metadata?.note ? (
                              <p className="mt-1 text-xs text-gray-600 line-clamp-2">
                                {String(activity.metadata.note)}
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
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
