"use client";

import { useState, useRef } from "react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { exportWorkspace, importWorkspace } from "@/lib/storage/storage";
import { Download, Upload, Trash2, Database } from "lucide-react";
import { loadDemoWorkspace } from "@/lib/demo-data";

export default function SettingsPage() {
  const { workspace, loadDemoWorkspace: loadDemo, clearAll, importWorkspace: importWs } =
    useWorkspace();
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    try {
      const jsonString = exportWorkspace(workspace);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `lead-autopilot-backup-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export workspace. Please try again.");
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError(null);
    setImportSuccess(false);

    try {
      const text = await file.text();
      const imported = importWorkspace(text);
      importWs(imported);
      setImportSuccess(true);
      setTimeout(() => setImportSuccess(false), 3000);
    } catch (error) {
      console.error("Import failed:", error);
      setImportError(
        error instanceof Error
          ? error.message
          : "Invalid file format. Please upload a valid JSON export."
      );
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleLoadDemo = () => {
    if (workspace.leads.length > 0) {
      if (
        !confirm(
          "Loading demo data will replace your current workspace. Are you sure?"
        )
      ) {
        return;
      }
    }
    const demoData = loadDemoWorkspace();
    loadDemo(demoData);
  };

  const handleClearAll = () => {
    if (
      confirm(
        "This will permanently delete all your data. This action cannot be undone. Are you sure?"
      )
    ) {
      if (
        confirm(
          "This is your last chance. All leads, activities, and tasks will be lost. Continue?"
        )
      ) {
        clearAll();
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Settings</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Manage your workspace data and preferences.
        </p>
      </div>

      <div className="space-y-6">
        {/* Workspace Stats */}
        <div className="bg-white dark:bg-zinc-900 shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
            Workspace Overview
          </h2>
          <dl className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <dt className="text-sm text-zinc-500 dark:text-zinc-400">Leads</dt>
              <dd className="text-2xl font-bold text-zinc-900 dark:text-white">
                {workspace.leads.length}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-zinc-500 dark:text-zinc-400">Activities</dt>
              <dd className="text-2xl font-bold text-zinc-900 dark:text-white">
                {workspace.activities.length}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-zinc-500 dark:text-zinc-400">Tasks</dt>
              <dd className="text-2xl font-bold text-zinc-900 dark:text-white">
                {workspace.tasks.length}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-zinc-500 dark:text-zinc-400">Templates</dt>
              <dd className="text-2xl font-bold text-zinc-900 dark:text-white">
                {workspace.templates.length}
              </dd>
            </div>
          </dl>
        </div>

        {/* Demo Data */}
        <div className="bg-white dark:bg-zinc-900 shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
            Demo Data
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
            Load sample leads and templates to explore the application.
          </p>
          <button
            onClick={handleLoadDemo}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Database className="w-4 h-4 mr-2" />
            Load Demo Workspace
          </button>
        </div>

        {/* Import/Export */}
        <div className="bg-white dark:bg-zinc-900 shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
            Data Portability
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
            Export your workspace as JSON or import from a previous backup.
          </p>

          {importSuccess && (
            <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-lg text-sm">
              Workspace imported successfully!
            </div>
          )}

          {importError && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 rounded-lg text-sm">
              {importError}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleExport}
              className="inline-flex items-center justify-center px-4 py-2 bg-zinc-900 dark:bg-zinc-700 text-white rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-500"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Workspace
            </button>

            <label className="inline-flex items-center justify-center px-4 py-2 bg-zinc-900 dark:bg-zinc-700 text-white rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-500 cursor-pointer">
              <Upload className="w-4 h-4 mr-2" />
              Import Workspace
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json,.json"
                onChange={handleImport}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Privacy & Storage */}
        <div className="bg-white dark:bg-zinc-900 shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">
            Privacy & Storage
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
            All data is stored locally in your browser. Nothing is sent to external
            servers.
          </p>
          <div className="text-sm text-zinc-600 dark:text-zinc-400 space-y-2">
            <p>
              <strong className="text-zinc-900 dark:text-white">Storage:</strong>{" "}
              localStorage (browser-based)
            </p>
            <p>
              <strong className="text-zinc-900 dark:text-white">Data sharing:</strong>{" "}
              None - your data stays on your device
            </p>
            <p>
              <strong className="text-zinc-900 dark:text-white">Analytics:</strong> None
            </p>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white dark:bg-zinc-900 shadow rounded-lg p-6 border-2 border-red-200 dark:border-red-900/30">
          <h2 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
            Danger Zone
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
            Permanently delete all workspace data. This action cannot be undone.
          </p>
          <button
            onClick={handleClearAll}
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All Data
          </button>
        </div>
      </div>
    </div>
  );
}
