"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/app-layout";
import { getWorkflows, setWorkflows, getTemplates } from "@/lib/storage";
import { useToast } from "@/components/ui/toast";
import type { Workflow, WorkflowStep, WorkflowStepType, Template } from "@/types";
import { ArrowLeft, Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import Link from "next/link";
import { nanoid } from "nanoid";

export default function WorkflowEditorPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const isNew = params.id === "new";

  const [workflow, setWorkflow] = useState<Workflow | null>(() => {
    if (isNew) {
      return {
        id: nanoid(),
        name: "",
        description: "",
        trigger: "",
        steps: [],
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
    const workflows = getWorkflows();
    return workflows.find((w) => w.id === params.id) || null;
  });
  const [templates] = useState<Template[]>(() => getTemplates());

  const handleSave = () => {
    if (!workflow) return;

    if (!workflow.name.trim()) {
      showToast("Please enter a workflow name", "error");
      return;
    }

    const workflows = getWorkflows();
    const updatedWorkflows = isNew
      ? [...workflows, workflow]
      : workflows.map((w) => (w.id === workflow.id ? workflow : w));

    setWorkflows(updatedWorkflows);
    showToast(
      isNew ? "Workflow created" : "Workflow updated",
      "success"
    );
    router.push("/workflows");
  };

  const handleAddStep = (type: WorkflowStepType) => {
    if (!workflow) return;

    const newStep: WorkflowStep = {
      id: nanoid(),
      type,
      order: workflow.steps.length,
      enabled: true,
    };

    setWorkflow({
      ...workflow,
      steps: [...workflow.steps, newStep],
    });
  };

  const handleUpdateStep = (stepId: string, updates: Partial<WorkflowStep>) => {
    if (!workflow) return;

    setWorkflow({
      ...workflow,
      steps: workflow.steps.map((step) =>
        step.id === stepId ? { ...step, ...updates } : step
      ),
    });
  };

  const handleDeleteStep = (stepId: string) => {
    if (!workflow) return;

    const newSteps = workflow.steps
      .filter((step) => step.id !== stepId)
      .map((step, index) => ({ ...step, order: index }));

    setWorkflow({
      ...workflow,
      steps: newSteps,
    });
  };

  const handleMoveStep = (stepId: string, direction: "up" | "down") => {
    if (!workflow) return;

    const index = workflow.steps.findIndex((s) => s.id === stepId);
    if (index === -1) return;

    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= workflow.steps.length) return;

    const newSteps = [...workflow.steps];
    [newSteps[index], newSteps[newIndex]] = [newSteps[newIndex], newSteps[index]];
    newSteps.forEach((step, i) => {
      step.order = i;
    });

    setWorkflow({
      ...workflow,
      steps: newSteps,
    });
  };

  if (!workflow) {
    return (
      <AppLayout title="Workflow Editor">
        <div className="flex h-full items-center justify-center">
          <p className="text-gray-500">Loading...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title={isNew ? "Create Workflow" : "Edit Workflow"}>
      <div className="p-6">
        <Link
          href="/workflows"
          className="mb-6 inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Workflows
        </Link>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Editor */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h3 className="mb-4 text-lg font-medium text-gray-900">
                Workflow Details
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    type="text"
                    value={workflow.name}
                    onChange={(e) =>
                      setWorkflow({ ...workflow, name: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="e.g., New Lead Nurture"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    value={workflow.description}
                    onChange={(e) =>
                      setWorkflow({ ...workflow, description: e.target.value })
                    }
                    rows={2}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Describe what this workflow does"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Trigger
                  </label>
                  <input
                    type="text"
                    value={workflow.trigger}
                    onChange={(e) =>
                      setWorkflow({ ...workflow, trigger: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="e.g., Lead created, Quote sent"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="active"
                    checked={workflow.active}
                    onChange={(e) =>
                      setWorkflow({ ...workflow, active: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label
                    htmlFor="active"
                    className="ml-2 text-sm font-medium text-gray-700"
                  >
                    Active
                  </label>
                </div>
              </div>
            </div>

            {/* Steps */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h3 className="mb-4 text-lg font-medium text-gray-900">
                Workflow Steps
              </h3>

              {workflow.steps.length === 0 ? (
                <p className="mb-4 text-sm text-gray-500">
                  No steps yet. Add a step to get started.
                </p>
              ) : (
                <div className="mb-6 space-y-4">
                  {workflow.steps.map((step, index) => (
                    <div
                      key={step.id}
                      className="rounded-lg border border-gray-200 p-4"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-800">
                            {index + 1}
                          </span>
                          <span className="font-medium text-gray-900">
                            {step.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleMoveStep(step.id, "up")}
                            disabled={index === 0}
                            className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                          >
                            <ChevronUp className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleMoveStep(step.id, "down")}
                            disabled={index === workflow.steps.length - 1}
                            className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                          >
                            <ChevronDown className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteStep(step.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {step.type === "Email" || step.type === "SMS" ? (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Template
                          </label>
                          <select
                            value={step.templateId || ""}
                            onChange={(e) =>
                              handleUpdateStep(step.id, {
                                templateId: e.target.value,
                              })
                            }
                            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="">Select a template</option>
                            {templates
                              .filter((t) => t.type === step.type)
                              .map((template) => (
                                <option key={template.id} value={template.id}>
                                  {template.name}
                                </option>
                              ))}
                          </select>
                        </div>
                      ) : step.type === "Wait" ? (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Wait Days
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={step.waitDays || 1}
                            onChange={(e) =>
                              handleUpdateStep(step.id, {
                                waitDays: parseInt(e.target.value),
                              })
                            }
                            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      ) : step.type === "Task" ? (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Task Description
                          </label>
                          <input
                            type="text"
                            value={step.taskDescription || ""}
                            onChange={(e) =>
                              handleUpdateStep(step.id, {
                                taskDescription: e.target.value,
                              })
                            }
                            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="e.g., Call to schedule consultation"
                          />
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => handleAddStep("Email")}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <Plus className="mr-1 inline h-4 w-4" />
                  Email
                </button>
                <button
                  onClick={() => handleAddStep("SMS")}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <Plus className="mr-1 inline h-4 w-4" />
                  SMS
                </button>
                <button
                  onClick={() => handleAddStep("Wait")}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <Plus className="mr-1 inline h-4 w-4" />
                  Wait
                </button>
                <button
                  onClick={() => handleAddStep("Task")}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <Plus className="mr-1 inline h-4 w-4" />
                  Task
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={handleSave}
                className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Save Workflow
              </button>
              <Link
                href="/workflows"
                className="rounded-lg border border-gray-300 bg-white px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Link>
            </div>
          </div>

          {/* Help Sidebar */}
          <div className="lg:col-span-1">
            <div className="rounded-lg bg-blue-50 p-6">
              <h4 className="mb-3 font-medium text-blue-900">
                About Workflows
              </h4>
              <div className="space-y-3 text-sm text-blue-800">
                <p>
                  Workflows automate your lead nurturing process with a sequence
                  of steps.
                </p>
                <div>
                  <strong>Step Types:</strong>
                  <ul className="mt-1 ml-4 list-disc space-y-1">
                    <li>
                      <strong>Email:</strong> Send an email template
                    </li>
                    <li>
                      <strong>SMS:</strong> Send an SMS template
                    </li>
                    <li>
                      <strong>Wait:</strong> Pause for a number of days
                    </li>
                    <li>
                      <strong>Task:</strong> Create a manual task
                    </li>
                  </ul>
                </div>
                <p className="text-xs text-blue-700">
                  Note: This is a demo. Actual email/SMS sending is not enabled.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
