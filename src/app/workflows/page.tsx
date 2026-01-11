"use client";

import { useState } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/app-layout";
import { getWorkflows } from "@/lib/storage";
import type { Workflow } from "@/types";
import { Plus, ChevronRight, Power, PowerOff } from "lucide-react";

export default function WorkflowsPage() {
  const [workflows] = useState<Workflow[]>(() => getWorkflows());

  return (
    <AppLayout title="Workflows">
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-gray-600">
            Automate your lead nurturing with workflow sequences
          </p>
          <Link
            href="/workflows/new"
            className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Workflow
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {workflows.map((workflow) => (
            <div
              key={workflow.id}
              className="overflow-hidden rounded-lg bg-white shadow hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {workflow.name}
                      </h3>
                      {workflow.active ? (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                          <Power className="mr-1 h-3 w-3" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">
                          <PowerOff className="mr-1 h-3 w-3" />
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-gray-600">
                      {workflow.description}
                    </p>
                    <div className="mt-4 flex items-center gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Trigger:</span>{" "}
                        <span className="font-medium text-gray-900">
                          {workflow.trigger}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Steps:</span>{" "}
                        <span className="font-medium text-gray-900">
                          {workflow.steps.length}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <Link
                    href={`/workflows/${workflow.id}`}
                    className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    Edit Workflow
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {workflows.length === 0 && (
          <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 text-center">
            <h3 className="text-lg font-medium text-gray-900">
              No workflows yet
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Get started by creating your first automation workflow
            </p>
            <Link
              href="/workflows/new"
              className="mt-6 inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Workflow
            </Link>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
