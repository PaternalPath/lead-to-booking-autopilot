"use client";

import { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import {
  resetAllData,
  exportData,
  getAllData,
  STORAGE_VERSION,
} from "@/lib/storage";
import {
  generateDemoLeads,
  generateDemoTemplates,
  generateDemoWorkflows,
  generateDemoActivities,
} from "@/lib/seed-data";
import { useToast } from "@/components/ui/toast";
import {
  Download,
  RefreshCw,
  Database,
  AlertTriangle,
  Info,
} from "lucide-react";
import { setLeads, setTemplates, setWorkflows, setActivities } from "@/lib/storage";

export default function SettingsPage() {
  const { showToast } = useToast();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleExport = () => {
    try {
      const jsonData = exportData();
      const blob = new Blob([jsonData], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `lead-autopilot-data-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast("Data exported successfully", "success");
    } catch {
      showToast("Failed to export data", "error");
    }
  };

  const handleReset = () => {
    try {
      resetAllData();

      // Re-seed with demo data
      const leads = generateDemoLeads();
      const templates = generateDemoTemplates();
      const workflows = generateDemoWorkflows();
      const activities = generateDemoActivities(leads);

      setLeads(leads);
      setTemplates(templates);
      setWorkflows(workflows);
      setActivities(activities);

      showToast("Demo data reset successfully", "success");
      setShowResetConfirm(false);

      // Reload the page to refresh all data
      window.location.reload();
    } catch {
      showToast("Failed to reset data", "error");
    }
  };

  const data = getAllData();
  const dataStats = {
    leads: data.leads.length,
    workflows: data.workflows.length,
    templates: data.templates.length,
    activities: data.activities.length,
  };

  return (
    <AppLayout title="Settings">
      <div className="p-6">
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Demo Mode Notice */}
          <div className="rounded-lg bg-blue-50 p-6">
            <div className="flex items-start gap-3">
              <Info className="mt-0.5 h-5 w-5 text-blue-600" />
              <div>
                <h3 className="font-medium text-blue-900">Demo Mode Active</h3>
                <p className="mt-1 text-sm text-blue-800">
                  This application is running in demo mode. All data is stored
                  locally in your browser and no real emails or SMS messages are
                  sent.
                </p>
              </div>
            </div>
          </div>

          {/* Data Statistics */}
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="mb-4 flex items-center gap-3">
              <Database className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-medium text-gray-900">
                Data Statistics
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-lg bg-gray-50 p-4">
                <div className="text-2xl font-bold text-gray-900">
                  {dataStats.leads}
                </div>
                <div className="text-sm text-gray-600">Leads</div>
              </div>
              <div className="rounded-lg bg-gray-50 p-4">
                <div className="text-2xl font-bold text-gray-900">
                  {dataStats.workflows}
                </div>
                <div className="text-sm text-gray-600">Workflows</div>
              </div>
              <div className="rounded-lg bg-gray-50 p-4">
                <div className="text-2xl font-bold text-gray-900">
                  {dataStats.templates}
                </div>
                <div className="text-sm text-gray-600">Templates</div>
              </div>
              <div className="rounded-lg bg-gray-50 p-4">
                <div className="text-2xl font-bold text-gray-900">
                  {dataStats.activities}
                </div>
                <div className="text-sm text-gray-600">Activities</div>
              </div>
            </div>
            <div className="mt-4 text-xs text-gray-500">
              Version: {STORAGE_VERSION}
            </div>
          </div>

          {/* Export Data */}
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-3">
                  <Download className="h-5 w-5 text-gray-600" />
                  <h3 className="text-lg font-medium text-gray-900">
                    Export Data
                  </h3>
                </div>
                <p className="text-sm text-gray-600">
                  Download all your data as a JSON file. You can use this as a
                  backup or to transfer data between browsers.
                </p>
              </div>
              <button
                onClick={handleExport}
                className="ml-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Export JSON
              </button>
            </div>
          </div>

          {/* Reset Data */}
          <div className="rounded-lg border-2 border-red-200 bg-white p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-3">
                  <RefreshCw className="h-5 w-5 text-red-600" />
                  <h3 className="text-lg font-medium text-gray-900">
                    Reset Demo Data
                  </h3>
                </div>
                <p className="text-sm text-gray-600">
                  Delete all current data and reload the original demo dataset.
                  This action cannot be undone.
                </p>
              </div>
              <button
                onClick={() => setShowResetConfirm(true)}
                className="ml-4 rounded-lg border-2 border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
              >
                Reset Data
              </button>
            </div>

            {/* Confirmation Dialog */}
            {showResetConfirm && (
              <div className="mt-4 rounded-lg bg-red-50 p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 text-red-600" />
                  <div className="flex-1">
                    <h4 className="font-medium text-red-900">
                      Are you sure?
                    </h4>
                    <p className="mt-1 text-sm text-red-800">
                      This will delete all your current data and restore the
                      original demo dataset. This action cannot be undone.
                    </p>
                    <div className="mt-4 flex gap-3">
                      <button
                        onClick={handleReset}
                        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                      >
                        Yes, Reset Data
                      </button>
                      <button
                        onClick={() => setShowResetConfirm(false)}
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Integrations (Coming Soon) */}
          <div className="rounded-lg bg-white p-6 shadow opacity-60">
            <h3 className="mb-4 text-lg font-medium text-gray-900">
              Integrations
              <span className="ml-2 rounded-full bg-gray-200 px-2 py-1 text-xs font-medium text-gray-600">
                Coming Soon
              </span>
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                <div>
                  <div className="font-medium text-gray-700">Email Provider</div>
                  <div className="text-sm text-gray-500">
                    Connect your email service (SendGrid, Mailgun, etc.)
                  </div>
                </div>
                <button
                  disabled
                  className="rounded-lg bg-gray-300 px-4 py-2 text-sm font-medium text-gray-500 cursor-not-allowed"
                >
                  Configure
                </button>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                <div>
                  <div className="font-medium text-gray-700">SMS Provider</div>
                  <div className="text-sm text-gray-500">
                    Connect your SMS service (Twilio, etc.)
                  </div>
                </div>
                <button
                  disabled
                  className="rounded-lg bg-gray-300 px-4 py-2 text-sm font-medium text-gray-500 cursor-not-allowed"
                >
                  Configure
                </button>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
                <div>
                  <div className="font-medium text-gray-700">CRM Integration</div>
                  <div className="text-sm text-gray-500">
                    Sync with your CRM (Salesforce, HubSpot, etc.)
                  </div>
                </div>
                <button
                  disabled
                  className="rounded-lg bg-gray-300 px-4 py-2 text-sm font-medium text-gray-500 cursor-not-allowed"
                >
                  Configure
                </button>
              </div>
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="rounded-lg bg-gray-50 p-6">
            <h3 className="mb-2 font-medium text-gray-900">
              Privacy & Data Storage
            </h3>
            <p className="text-sm text-gray-600">
              All data in this demo application is stored locally in your
              browser using localStorage. No data is sent to any external
              servers. If you clear your browser data, all information will be
              lost.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
