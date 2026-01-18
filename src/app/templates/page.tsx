"use client";

import { useState } from "react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { Mail, MessageSquare, Phone, Copy, Check } from "lucide-react";
import { Template, TemplateChannel } from "@/types/template";

const channelIcons = {
  email: Mail,
  sms: MessageSquare,
  call: Phone,
};

const channelLabels = {
  email: "Email",
  sms: "SMS",
  call: "Call Script",
};

export default function TemplatesPage() {
  const { workspace, isLoading } = useWorkspace();
  const [selectedChannel, setSelectedChannel] = useState<TemplateChannel | "all">("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredTemplates =
    selectedChannel === "all"
      ? workspace.templates
      : workspace.templates.filter((t) => t.channel === selectedChannel);

  const handleCopy = async (template: Template) => {
    const textToCopy =
      template.channel === "email" && template.subject
        ? `Subject: ${template.subject}\n\n${template.body}`
        : template.body;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedId(template.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <p className="text-zinc-600 dark:text-zinc-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Templates</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Pre-written templates for emails, SMS, and call scripts. Click to copy.
        </p>
      </div>

      <div className="mb-6">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedChannel("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedChannel === "all"
                ? "bg-blue-600 text-white"
                : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800"
            }`}
          >
            All Templates
          </button>
          {(Object.keys(channelLabels) as TemplateChannel[]).map((channel) => {
            const Icon = channelIcons[channel];
            return (
              <button
                key={channel}
                onClick={() => setSelectedChannel(channel)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  selectedChannel === channel
                    ? "bg-blue-600 text-white"
                    : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                }`}
              >
                <Icon className="w-4 h-4" />
                {channelLabels[channel]}
              </button>
            );
          })}
        </div>
      </div>

      {filteredTemplates.length === 0 ? (
        <div className="text-center py-12 bg-zinc-50 dark:bg-zinc-900 rounded-lg border-2 border-dashed border-zinc-300 dark:border-zinc-700">
          <p className="text-zinc-600 dark:text-zinc-400">
            No templates found. Load demo data to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => {
            const Icon = channelIcons[template.channel];
            const isCopied = copiedId === template.id;

            return (
              <div
                key={template.id}
                className="bg-white dark:bg-zinc-900 rounded-lg shadow border border-zinc-200 dark:border-zinc-800 overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <h3 className="font-semibold text-zinc-900 dark:text-white">
                        {template.name}
                      </h3>
                    </div>
                    <button
                      onClick={() => handleCopy(template)}
                      className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors"
                      title="Copy to clipboard"
                    >
                      {isCopied ? (
                        <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                      )}
                    </button>
                  </div>
                  {template.subject && (
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                      Subject: {template.subject}
                    </p>
                  )}
                </div>
                <div className="p-4">
                  <pre className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap font-sans">
                    {template.body}
                  </pre>
                </div>
                {template.tags && template.tags.length > 0 && (
                  <div className="px-4 pb-4">
                    <div className="flex flex-wrap gap-2">
                      {template.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
