"use client";

import { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { getLeads, getActivities } from "@/lib/storage";
import type { Lead, Activity, LeadStage } from "@/types";
import { Users, CheckCircle, Calendar, FileText, DollarSign, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

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
    return nextAction.toDateString() === today.toDateString();
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
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {kpis.map((kpi) => (
            <Card key={kpi.label} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{kpi.label}</p>
                    <p className="mt-2 text-3xl font-bold text-gray-900">{kpi.value}</p>
                  </div>
                  <div className={`rounded-lg p-3 ${kpi.color}`}>
                    <kpi.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Tasks Due */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Tasks
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-gray-900">Due Today</h4>
                  <Badge variant="default">{tasksToday.length}</Badge>
                </div>
                {tasksToday.length === 0 ? (
                  <EmptyState
                    icon={<Clock className="h-8 w-8" />}
                    title="No tasks due today"
                    description="You're all caught up!"
                    className="py-8"
                  />
                ) : (
                  <div className="space-y-3">
                    {tasksToday.map((lead) => (
                      <Link
                        key={lead.id}
                        href={`/leads/${lead.id}`}
                        className="block rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-900">
                              {lead.firstName} {lead.lastName}
                            </div>
                            <div className="mt-1 flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs">
                                {lead.stage}
                              </Badge>
                              {lead.destination && (
                                <span className="text-xs text-gray-500">
                                  {lead.destination}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-gray-900">This Week</h4>
                  <Badge variant="secondary">{tasksThisWeek.length}</Badge>
                </div>
                {tasksThisWeek.length === 0 ? (
                  <p className="text-sm text-gray-500">No tasks this week</p>
                ) : (
                  <div className="space-y-3">
                    {tasksThisWeek.slice(0, 5).map((lead) => (
                      <Link
                        key={lead.id}
                        href={`/leads/${lead.id}`}
                        className="block rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
                      >
                        <div className="flex items-center justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-gray-900">
                              {lead.firstName} {lead.lastName}
                            </div>
                            <div className="mt-1 flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs">
                                {lead.stage}
                              </Badge>
                            </div>
                          </div>
                          <div className="ml-4 text-xs text-gray-400">
                            {lead.nextActionAt &&
                              new Date(lead.nextActionAt).toLocaleDateString()}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {activities.length === 0 ? (
                <EmptyState
                  icon={<FileText className="h-8 w-8" />}
                  title="No recent activity"
                  description="Activity will appear here as you work with leads"
                />
              ) : (
                <div className="space-y-4">
                  {activities.slice(0, 10).map((activity) => {
                    const lead = leads.find((l) => l.id === activity.leadId);
                    return (
                      <div key={activity.id} className="flex gap-4">
                        <div className="relative mt-1">
                          <div className="h-2 w-2 rounded-full bg-blue-500" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">
                            <Link
                              href={`/leads/${lead?.id}`}
                              className="font-medium hover:text-blue-600"
                            >
                              {lead?.firstName} {lead?.lastName}
                            </Link>{" "}
                            <span className="text-gray-600">{activity.description}</span>
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
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
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
