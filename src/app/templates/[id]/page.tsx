"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/app-layout";
import { getTemplates, setTemplates } from "@/lib/storage";
import { useToast } from "@/components/ui/toast";
import type { Template, TemplateType } from "@/types";
import { TEMPLATE_VARIABLES } from "@/types";
import { ArrowLeft, Eye } from "lucide-react";
import Link from "next/link";
import { nanoid } from "nanoid";

function resolveTemplate(template: string): string {
  let resolved = template;
  TEMPLATE_VARIABLES.forEach((variable) => {
    resolved = resolved.replaceAll(variable.name, variable.defaultValue);
  });
  return resolved;
}

export default function TemplateEditorPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const isNew = params.id === "new";

  const [template, setTemplate] = useState<Template | null>(() => {
    if (isNew) {
      return {
        id: nanoid(),
        name: "",
        type: "Email",
        subject: "",
        body: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
    const templates = getTemplates();
    return templates.find((t) => t.id === params.id) || null;
  });
  const [showPreview, setShowPreview] = useState(true);

  const handleSave = () => {
    if (!template) return;

    if (!template.name.trim()) {
      showToast("Please enter a template name", "error");
      return;
    }

    if (!template.body.trim()) {
      showToast("Please enter template content", "error");
      return;
    }

    if (template.type === "Email" && !template.subject?.trim()) {
      showToast("Please enter an email subject", "error");
      return;
    }

    const templates = getTemplates();
    const updatedTemplates = isNew
      ? [...templates, template]
      : templates.map((t) => (t.id === template.id ? template : t));

    setTemplates(updatedTemplates);
    showToast(
      isNew ? "Template created" : "Template updated",
      "success"
    );
    router.push("/templates");
  };

  if (!template) {
    return (
      <AppLayout title="Template Editor">
        <div className="flex h-full items-center justify-center">
          <p className="text-gray-500">Loading...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title={isNew ? "Create Template" : "Edit Template"}>
      <div className="p-6">
        <Link
          href="/templates"
          className="mb-6 inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Templates
        </Link>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Editor */}
          <div className="space-y-6">
            <div className="rounded-lg bg-white p-6 shadow">
              <h3 className="mb-4 text-lg font-medium text-gray-900">
                Template Details
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    type="text"
                    value={template.name}
                    onChange={(e) =>
                      setTemplate({ ...template, name: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="e.g., Welcome Email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Type
                  </label>
                  <select
                    value={template.type}
                    onChange={(e) =>
                      setTemplate({
                        ...template,
                        type: e.target.value as TemplateType,
                      })
                    }
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="Email">Email</option>
                    <option value="SMS">SMS</option>
                  </select>
                </div>

                {template.type === "Email" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={template.subject || ""}
                      onChange={(e) =>
                        setTemplate({ ...template, subject: e.target.value })
                      }
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="e.g., Welcome to {{destination}}!"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Body
                  </label>
                  <textarea
                    value={template.body}
                    onChange={(e) =>
                      setTemplate({ ...template, body: e.target.value })
                    }
                    rows={template.type === "Email" ? 12 : 4}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Enter your template content here..."
                  />
                  {template.type === "SMS" && (
                    <p className="mt-1 text-xs text-gray-500">
                      {template.body.length} characters
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Variables Reference */}
            <div className="rounded-lg bg-gray-50 p-6">
              <h4 className="mb-3 font-medium text-gray-900">
                Available Variables
              </h4>
              <div className="space-y-2">
                {TEMPLATE_VARIABLES.map((variable) => (
                  <div
                    key={variable.name}
                    className="flex items-center justify-between text-sm"
                  >
                    <code className="rounded bg-gray-200 px-2 py-1 text-xs font-mono text-gray-800">
                      {variable.name}
                    </code>
                    <span className="text-gray-600">{variable.placeholder}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={handleSave}
                className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Save Template
              </button>
              <Link
                href="/templates"
                className="rounded-lg border border-gray-300 bg-white px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Link>
            </div>
          </div>

          {/* Preview */}
          <div className="lg:sticky lg:top-6 lg:self-start">
            <div className="rounded-lg bg-white p-6 shadow">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Preview</h3>
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                >
                  <Eye className="h-4 w-4" />
                  {showPreview ? "Hide" : "Show"}
                </button>
              </div>

              {showPreview && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <div className="mb-3 text-xs font-medium uppercase text-gray-500">
                    Preview with sample values
                  </div>

                  {template.type === "Email" && template.subject && (
                    <div className="mb-4">
                      <div className="text-xs font-medium text-gray-500">
                        Subject:
                      </div>
                      <div className="mt-1 font-medium text-gray-900">
                        {resolveTemplate(template.subject)}
                      </div>
                    </div>
                  )}

                  <div>
                    {template.type === "Email" && (
                      <div className="text-xs font-medium text-gray-500 mb-2">
                        Body:
                      </div>
                    )}
                    <div className="whitespace-pre-wrap text-sm text-gray-900">
                      {resolveTemplate(template.body) || (
                        <span className="text-gray-400 italic">
                          Start typing to see preview...
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-4 rounded-lg bg-blue-50 p-4">
                <p className="text-xs text-blue-800">
                  Variables like <code className="font-mono">{"{{firstName}}"}</code> will
                  be automatically replaced with actual lead data when sent.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
