import { Workspace } from "@/types/workspace";

export type Migration = (data: unknown) => unknown;

export const migrations: Record<number, Migration> = {
  // Future migrations go here
  // Example:
  // 2: (data) => {
  //   // Migrate from v1 to v2
  //   return { ...data, newField: 'default' };
  // },
};

export function migrateWorkspace(data: unknown, fromVersion: number, toVersion: number): unknown {
  let current = data;
  for (let v = fromVersion; v < toVersion; v++) {
    const migration = migrations[v + 1];
    if (migration) {
      current = migration(current);
    }
  }
  return current;
}
