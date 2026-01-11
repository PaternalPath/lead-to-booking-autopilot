"use client";

import { useState } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/app-layout";
import { getTemplates } from "@/lib/storage";
import type { Template } from "@/types";
import { Plus, Mail, MessageSquare, ChevronRight } from "lucide-react";

export default function TemplatesPage() {
  const [templates] = useState<Template[]>(() => getTemplates());

  const emailTemplates = templates.filter((t) => t.type === "Email");
  const smsTemplates = templates.filter((t) => t.type === "SMS");

  return (
    <AppLayout title="Templates">
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-gray-600">
            Create and manage email and SMS templates
          </p>
          <Link
            href="/templates/new"
            className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Template
          </Link>
        </div>

        <div className="space-y-8">
          {/* Email Templates */}
          <div>
            <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-900">
              <Mail className="mr-2 h-5 w-5" />
              Email Templates ({emailTemplates.length})
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {emailTemplates.map((template) => (
                <Link
                  key={template.id}
                  href={`/templates/${template.id}`}
                  className="group block rounded-lg border border-gray-200 bg-white p-4 hover:border-blue-500 hover:shadow-md transition-all"
                >
                  <div className="mb-2 flex items-start justify-between">
                    <h4 className="font-medium text-gray-900 group-hover:text-blue-600">
                      {template.name}
                    </h4>
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600" />
                  </div>
                  {template.subject && (
                    <p className="mb-2 text-sm font-medium text-gray-700">
                      Subject: {template.subject}
                    </p>
                  )}
                  <p className="line-clamp-2 text-sm text-gray-500">
                    {template.body}
                  </p>
                </Link>
              ))}
            </div>
          </div>

          {/* SMS Templates */}
          <div>
            <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-900">
              <MessageSquare className="mr-2 h-5 w-5" />
              SMS Templates ({smsTemplates.length})
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {smsTemplates.map((template) => (
                <Link
                  key={template.id}
                  href={`/templates/${template.id}`}
                  className="group block rounded-lg border border-gray-200 bg-white p-4 hover:border-blue-500 hover:shadow-md transition-all"
                >
                  <div className="mb-2 flex items-start justify-between">
                    <h4 className="font-medium text-gray-900 group-hover:text-blue-600">
                      {template.name}
                    </h4>
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600" />
                  </div>
                  <p className="line-clamp-2 text-sm text-gray-500">
                    {template.body}
                  </p>
                  <p className="mt-2 text-xs text-gray-400">
                    {template.body.length} characters
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {templates.length === 0 && (
          <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 text-center">
            <h3 className="text-lg font-medium text-gray-900">
              No templates yet
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Create your first email or SMS template to use in workflows
            </p>
            <Link
              href="/templates/new"
              className="mt-6 inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Template
            </Link>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
