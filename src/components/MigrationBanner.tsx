"use client";

import { useState } from "react";
import { Cloud, X, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useWorkspace } from "@/contexts/WorkspaceContext";

export function MigrationBanner() {
  const { isAuthenticated, hasLocalData, migrateToCloud } = useWorkspace();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Don't show if:
  // - User dismissed it
  // - User is not authenticated
  // - No local data to migrate
  // - Already showing a result
  if (isDismissed || !isAuthenticated || !hasLocalData || result?.success) {
    return null;
  }

  const handleMigrate = async () => {
    setIsMigrating(true);
    setResult(null);

    try {
      const migrationResult = await migrateToCloud();
      setResult(migrationResult);

      if (migrationResult.success) {
        // Auto-dismiss after success
        setTimeout(() => {
          setIsDismissed(true);
        }, 3000);
      }
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : "Migration failed",
      });
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Cloud className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <p className="text-sm text-blue-800 dark:text-blue-200">
              {result ? (
                <span className="flex items-center gap-2">
                  {result.success ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      {result.message}
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      {result.message}
                    </>
                  )}
                </span>
              ) : (
                "You have local data from before signing in. Migrate it to your cloud workspace?"
              )}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {!result && (
              <>
                <button
                  onClick={() => setIsDismissed(true)}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Dismiss
                </button>
                <button
                  onClick={handleMigrate}
                  disabled={isMigrating}
                  className="px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isMigrating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Migrating...
                    </>
                  ) : (
                    "Migrate to Cloud"
                  )}
                </button>
              </>
            )}
            {result && !result.success && (
              <button
                onClick={handleMigrate}
                className="px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
              >
                Try Again
              </button>
            )}
            <button
              onClick={() => setIsDismissed(true)}
              className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-800 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
