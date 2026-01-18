import { Workspace, WorkspaceSchema } from "@/types/workspace";
import { STORAGE_KEY, STORAGE_VERSION } from "./schema";
import { migrateWorkspace } from "./migrations";

export class StorageError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message);
    this.name = "StorageError";
  }
}

interface StoredData {
  version: number;
  data: Workspace;
  lastUpdated: string;
}

export function loadWorkspace(): Workspace | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return null;
    }

    const parsed = JSON.parse(stored) as StoredData;

    // Handle version migration
    let workspaceData = parsed.data;
    if (parsed.version !== STORAGE_VERSION) {
      workspaceData = migrateWorkspace(
        parsed.data,
        parsed.version,
        STORAGE_VERSION
      ) as Workspace;
    }

    // Validate with Zod
    const validated = WorkspaceSchema.parse(workspaceData);
    return validated;
  } catch (error) {
    console.error("Failed to load workspace:", error);
    throw new StorageError("Failed to load workspace from storage", error);
  }
}

export function saveWorkspace(workspace: Workspace): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    // Validate before saving
    const validated = WorkspaceSchema.parse(workspace);

    const stored: StoredData = {
      version: STORAGE_VERSION,
      data: validated,
      lastUpdated: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  } catch (error) {
    console.error("Failed to save workspace:", error);
    throw new StorageError("Failed to save workspace to storage", error);
  }
}

export function clearWorkspace(): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(STORAGE_KEY);
}

export function exportWorkspace(workspace: Workspace): string {
  try {
    const validated = WorkspaceSchema.parse(workspace);
    return JSON.stringify(validated, null, 2);
  } catch (error) {
    console.error("Failed to export workspace:", error);
    throw new StorageError("Failed to export workspace. Invalid data.", error);
  }
}

export function importWorkspace(jsonString: string): Workspace {
  try {
    const parsed = JSON.parse(jsonString);
    const validated = WorkspaceSchema.parse(parsed);
    return validated;
  } catch (error) {
    console.error("Failed to import workspace:", error);
    throw new StorageError("Failed to import workspace. Invalid JSON or schema.", error);
  }
}
