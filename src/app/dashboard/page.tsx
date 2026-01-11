"use client";

import { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { getLeads, getActivities } from "@/lib/storage";
import type { Lead, Activity, LeadStage } from "@/types";
import { Users, CheckCircle, Calendar, FileText, DollarSign } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function DashboardPage() {
  const [leads] = useState<Lead[]>(() => getLeads());
  const [activities] = useState<Activity[]>(() => getActivities());

  const getStageCount = (stage: LeadStage) => {
    return leads.filter((lead) => lead.stage === stage).length;
  };

  const tasksToday = leads.filter((lead) => {
    if (!lead.nextActionAt) return false;
    const nextAction = new Date(lead.nextActionAt);
    const today = new Date();
    return (
      nextAction.toDateString() === today.toDateString()
    );
  });

  const tasksThisWeek = leads.filter((lead) => {
    if (!lead.nextActionAt) return false;
    const nextAction = new Date(lead.nextActionAt);
    const today = new Date();
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    return nextAction >= today && nextAction <= weekFromNow;
  });

  const kpis = [
    {
      label: "New Leads",
      value: getStageCount("New"),
      icon: Users,
      color: "bg-blue-500",
    },
    {
      label: "Qualified",
      value: getStageCount("Qualified"),
      icon: CheckCircle,
      color: "bg-green-500",
    },
    {
      label: "Consults Booked",
      value: getStageCount("Consult Booked"),
      icon: Calendar,
      color: "bg-purple-500",
    },
    {
      label: "Quotes Sent",
      value: getStageCount("Quote Sent"),
      icon: FileText,
      color: "bg-orange-500",
    },
    {
      label: "Booked",
      value: getStageCount("Booked"),
      icon: DollarSign,
      color: "bg-emerald-500",
    },
  ];

  return (
    <AppLayout title="Dashboard">
      <div className="p-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {kpis.map((kpi) => (
            <div
              key={kpi.label}
              className="overflow-hidden rounded-lg bg-white shadow"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className={`rounded-md p-3 ${kpi.color}`}>
                    <kpi.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="truncate text-sm font-medium text-gray-500">
                        {kpi.label}
                      </dt>
                      <dd className="text-3xl font-semibold text-gray-900">
                        {kpi.value}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Tasks Due */}
          <div className="rounded-lg bg-white shadow">
            <div className="border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-medium text-gray-900">
                Upcoming Tasks
              </h3>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <h4 className="mb-3 text-sm font-semibold text-gray-700">
                  Due Today ({tasksToday.length})
                </h4>
                {tasksToday.length === 0 ? (
                  <p className="text-sm text-gray-500">No tasks due today</p>
                ) : (
                  <div className="space-y-2">
                    {tasksToday.map((lead) => (
                      <div
                        key={lead.id}
                        className="flex items-center justify-between rounded-md border border-gray-200 p-3"
                      >
                        <div>
                          <div className="font-medium text-gray-900">
                            {lead.firstName} {lead.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {lead.stage}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <h4 className="mb-3 text-sm font-semibold text-gray-700">
                  This Week ({tasksThisWeek.length})
                </h4>
                {tasksThisWeek.length === 0 ? (
                  <p className="text-sm text-gray-500">No tasks this week</p>
                ) : (
                  <div className="space-y-2">
                    {tasksThisWeek.slice(0, 5).map((lead) => (
                      <div
                        key={lead.id}
                        className="flex items-center justify-between rounded-md border border-gray-200 p-3"
                      >
                        <div>
                          <div className="font-medium text-gray-900">
                            {lead.firstName} {lead.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {lead.stage}
                          </div>
                        </div>
                        <div className="text-xs text-gray-400">
                          {lead.nextActionAt &&
                            new Date(lead.nextActionAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="rounded-lg bg-white shadow">
            <div className="border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-medium text-gray-900">
                Recent Activity
              </h3>
            </div>
            <div className="p-6">
              {activities.length === 0 ? (
                <p className="text-sm text-gray-500">No recent activity</p>
              ) : (
                <div className="space-y-4">
                  {activities.slice(0, 10).map((activity) => {
                    const lead = leads.find((l) => l.id === activity.leadId);
                    return (
                      <div
                        key={activity.id}
                        className="flex items-start gap-3"
                      >
                        <div className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">
                            <span className="font-medium">
                              {lead?.firstName} {lead?.lastName}
                            </span>{" "}
                            - {activity.description}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(activity.createdAt), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
