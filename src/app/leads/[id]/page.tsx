"use client";

import { use, useState } from "react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useRouter } from "next/navigation";
import { nanoid } from "nanoid";
import { format } from "date-fns";
import { ArrowLeft, Check, Trash2, Plus, Zap } from "lucide-react";
import Link from "next/link";
import { LEAD_STAGE_LABELS, LeadStage } from "@/types/lead";
import { ActivityType, ACTIVITY_TYPE_LABELS } from "@/types/activity";
import { generateCadenceTasks, getCadenceExplanation } from "@/lib/cadence/engine";
import { DEFAULT_CADENCE } from "@/lib/cadence/default-cadence";

interface LeadDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function LeadDetailPage({ params }: LeadDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const {
    getLeadById,
    updateLead,
    deleteLead,
    getActivitiesByLeadId,
    getTasksByLeadId,
    addActivity,
    updateTask,
    addTask,
    workspace,
  } = useWorkspace();

  const lead = getLeadById(id);
  const activities = getActivitiesByLeadId(id);
  const tasks = getTasksByLeadId(id);

  const [isEditing, setIsEditing] = useState(false);
  const [editedLead, setEditedLead] = useState(lead);
  const [newActivityType, setNewActivityType] = useState<ActivityType>("note");
  const [newActivityBody, setNewActivityBody] = useState("");
  const [cadenceMessage, setCadenceMessage] = useState<{
    type: "success" | "info" | "error";
    text: string;
  } | null>(null);

  if (!lead) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
            Lead not found
          </h2>
          <Link
            href="/"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Back to Leads
          </Link>
        </div>
      </div>
    );
  }

  const handleSave = () => {
    if (editedLead) {
      updateLead(id, editedLead);
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this lead?")) {
      deleteLead(id);
      router.push("/");
    }
  };

  const handleAddActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (newActivityBody.trim()) {
      addActivity({
        id: nanoid(),
        leadId: id,
        type: newActivityType,
        body: newActivityBody,
        createdAt: new Date(),
      });
      setNewActivityBody("");
    }
  };

  const handleToggleTask = (taskId: string, currentStatus: "todo" | "done") => {
    updateTask(taskId, { status: currentStatus === "todo" ? "done" : "todo" });
  };

  const handleGenerateCadence = () => {
    if (!lead) return;

    setCadenceMessage(null);

    const result = generateCadenceTasks({
      lead,
      cadencePolicy: DEFAULT_CADENCE,
      existingTasks: workspace.tasks,
    });

    if (result.stopped) {
      setCadenceMessage({
        type: "info",
        text: result.reason || "Cannot generate tasks for this lead.",
      });
      return;
    }

    if (result.tasks.length === 0 && result.skipped > 0) {
      setCadenceMessage({
        type: "info",
        text: `All ${result.skipped} tasks already exist. No new tasks created.`,
      });
      return;
    }

    // Add all new tasks
    result.tasks.forEach((task) => addTask(task));

    // Show success message
    const message =
      result.skipped > 0
        ? `Created ${result.tasks.length} new tasks. Skipped ${result.skipped} duplicates.`
        : `Created ${result.tasks.length} follow-up tasks!`;

    setCadenceMessage({
      type: "success",
      text: message,
    });

    // Clear message after 5 seconds
    setTimeout(() => setCadenceMessage(null), 5000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Leads
        </Link>
      </div>

      <div className="bg-white dark:bg-zinc-900 shadow rounded-lg p-6 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
              {lead.fullName}
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Created {format(lead.createdAt, "MMM d, yyyy")}
            </p>
          </div>
          <div className="flex gap-2">
            {!isEditing ? (
              <>
                <button
                  onClick={() => {
                    setEditedLead(lead);
                    setIsEditing(true);
                  }}
                  className="px-4 py-2 text-sm border border-zinc-300 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 text-sm border border-red-300 dark:border-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-sm border border-zinc-300 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save
                </button>
              </>
            )}
          </div>
        </div>

        {!isEditing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                Stage
              </h3>
              <span
                className={`px-2 inline-flex text-sm leading-6 font-semibold rounded-full ${
                  lead.stage === "Booked"
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                    : lead.stage === "Lost"
                      ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                      : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                }`}
              >
                {LEAD_STAGE_LABELS[lead.stage]}
              </span>
            </div>

            {lead.email && (
              <div>
                <h3 className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                  Email
                </h3>
                <p className="text-sm text-zinc-900 dark:text-white">{lead.email}</p>
              </div>
            )}

            {lead.phone && (
              <div>
                <h3 className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                  Phone
                </h3>
                <p className="text-sm text-zinc-900 dark:text-white">{lead.phone}</p>
              </div>
            )}

            {lead.source && (
              <div>
                <h3 className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                  Source
                </h3>
                <p className="text-sm text-zinc-900 dark:text-white">{lead.source}</p>
              </div>
            )}

            {lead.destinationOrServiceIntent && (
              <div className="md:col-span-2">
                <h3 className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                  Service Intent
                </h3>
                <p className="text-sm text-zinc-900 dark:text-white">
                  {lead.destinationOrServiceIntent}
                </p>
              </div>
            )}

            {lead.budgetRange && (
              <div>
                <h3 className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                  Budget Range
                </h3>
                <p className="text-sm text-zinc-900 dark:text-white">{lead.budgetRange}</p>
              </div>
            )}

            {lead.timeline && (
              <div>
                <h3 className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                  Timeline
                </h3>
                <p className="text-sm text-zinc-900 dark:text-white">{lead.timeline}</p>
              </div>
            )}

            {lead.notes && (
              <div className="md:col-span-2">
                <h3 className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                  Notes
                </h3>
                <p className="text-sm text-zinc-900 dark:text-white whitespace-pre-wrap">
                  {lead.notes}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Stage
              </label>
              <select
                value={editedLead?.stage || ""}
                onChange={(e) =>
                  editedLead &&
                  setEditedLead({ ...editedLead, stage: e.target.value as LeadStage })
                }
                className="block w-full rounded-md border border-zinc-300 dark:border-zinc-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
              >
                {Object.entries(LEAD_STAGE_LABELS).map(([stage, label]) => (
                  <option key={stage} value={stage}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Email
              </label>
              <input
                type="email"
                value={editedLead?.email || ""}
                onChange={(e) =>
                  editedLead && setEditedLead({ ...editedLead, email: e.target.value })
                }
                className="block w-full rounded-md border border-zinc-300 dark:border-zinc-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={editedLead?.phone || ""}
                onChange={(e) =>
                  editedLead && setEditedLead({ ...editedLead, phone: e.target.value })
                }
                className="block w-full rounded-md border border-zinc-300 dark:border-zinc-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Source
              </label>
              <input
                type="text"
                value={editedLead?.source || ""}
                onChange={(e) =>
                  editedLead && setEditedLead({ ...editedLead, source: e.target.value })
                }
                className="block w-full rounded-md border border-zinc-300 dark:border-zinc-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Service Intent
              </label>
              <input
                type="text"
                value={editedLead?.destinationOrServiceIntent || ""}
                onChange={(e) =>
                  editedLead &&
                  setEditedLead({ ...editedLead, destinationOrServiceIntent: e.target.value })
                }
                className="block w-full rounded-md border border-zinc-300 dark:border-zinc-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Budget Range
              </label>
              <input
                type="text"
                value={editedLead?.budgetRange || ""}
                onChange={(e) =>
                  editedLead && setEditedLead({ ...editedLead, budgetRange: e.target.value })
                }
                className="block w-full rounded-md border border-zinc-300 dark:border-zinc-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Timeline
              </label>
              <input
                type="text"
                value={editedLead?.timeline || ""}
                onChange={(e) =>
                  editedLead && setEditedLead({ ...editedLead, timeline: e.target.value })
                }
                className="block w-full rounded-md border border-zinc-300 dark:border-zinc-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Notes
              </label>
              <textarea
                rows={3}
                value={editedLead?.notes || ""}
                onChange={(e) =>
                  editedLead && setEditedLead({ ...editedLead, notes: e.target.value })
                }
                className="block w-full rounded-md border border-zinc-300 dark:border-zinc-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
              />
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-zinc-900 shadow rounded-lg p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
              Tasks ({tasks.length})
            </h2>
            <button
              onClick={handleGenerateCadence}
              disabled={lead?.stage === "Booked" || lead?.stage === "Lost"}
              className="inline-flex items-center px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-zinc-300 disabled:cursor-not-allowed"
              title={
                lead?.stage === "Booked" || lead?.stage === "Lost"
                  ? "Cannot generate tasks for Booked or Lost leads"
                  : "Generate follow-up plan based on default cadence"
              }
            >
              <Zap className="w-4 h-4 mr-1.5" />
              Generate Plan
            </button>
          </div>

          {cadenceMessage && (
            <div
              className={`mb-4 p-3 rounded-lg text-sm ${
                cadenceMessage.type === "success"
                  ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
                  : cadenceMessage.type === "info"
                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400"
                    : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400"
              }`}
            >
              {cadenceMessage.text}
            </div>
          )}

          {lead && (lead.stage === "New" || lead.stage === "Contacted") && tasks.length === 0 && (
            <div className="mb-4 p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-sm text-zinc-700 dark:text-zinc-300">
              <p className="font-medium mb-1">💡 Tip: Generate a Follow-up Plan</p>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                {getCadenceExplanation(DEFAULT_CADENCE)}
              </p>
            </div>
          )}

          {tasks.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center py-4">
              No tasks yet. Click "Generate Plan" to create follow-up tasks.
            </p>
          ) : (
            <div className="space-y-2">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700"
                >
                  <button
                    onClick={() => handleToggleTask(task.id, task.status)}
                    className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center ${
                      task.status === "done"
                        ? "bg-blue-600 border-blue-600"
                        : "border-zinc-300 dark:border-zinc-600"
                    }`}
                  >
                    {task.status === "done" && <Check className="w-3 h-3 text-white" />}
                  </button>
                  <div className="flex-1">
                    <p
                      className={`text-sm ${
                        task.status === "done"
                          ? "line-through text-zinc-500 dark:text-zinc-500"
                          : "text-zinc-900 dark:text-white"
                      }`}
                    >
                      {task.title}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                      Due: {format(task.dueAt, "MMM d, yyyy")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-zinc-900 shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
            Activity Timeline
          </h2>

          <form onSubmit={handleAddActivity} className="mb-4">
            <div className="flex gap-2 mb-2">
              <select
                value={newActivityType}
                onChange={(e) => setNewActivityType(e.target.value as ActivityType)}
                className="px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm"
              >
                {Object.entries(ACTIVITY_TYPE_LABELS).map(([type, label]) => (
                  <option key={type} value={type}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add activity..."
                value={newActivityBody}
                onChange={(e) => setNewActivityBody(e.target.value)}
                className="flex-1 px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm"
              />
              <button
                type="submit"
                disabled={!newActivityBody.trim()}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-zinc-300 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </form>

          <div className="space-y-3">
            {activities.length === 0 ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center py-4">
                No activity yet.
              </p>
            ) : (
              activities.map((activity) => (
                <div
                  key={activity.id}
                  className="border-l-2 border-blue-500 pl-3 py-2"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                      {ACTIVITY_TYPE_LABELS[activity.type]}
                    </span>
                    <span className="text-xs text-zinc-400 dark:text-zinc-500">
                      {format(activity.createdAt, "MMM d, yyyy 'at' h:mm a")}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-900 dark:text-white whitespace-pre-wrap">
                    {activity.body}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
