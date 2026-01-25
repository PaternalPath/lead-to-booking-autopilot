import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MigrationBanner } from "../MigrationBanner";

// Mock the WorkspaceContext
const mockMigrateToCloud = vi.fn();
vi.mock("@/contexts/WorkspaceContext", () => ({
  useWorkspace: vi.fn(),
}));

import { useWorkspace } from "@/contexts/WorkspaceContext";
const mockedUseWorkspace = vi.mocked(useWorkspace);

describe("MigrationBanner", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should not render when user is not authenticated", () => {
    mockedUseWorkspace.mockReturnValue({
      isAuthenticated: false,
      hasLocalData: true,
      migrateToCloud: mockMigrateToCloud,
    } as ReturnType<typeof useWorkspace>);

    const { container } = render(<MigrationBanner />);
    expect(container.firstChild).toBeNull();
  });

  it("should not render when there is no local data", () => {
    mockedUseWorkspace.mockReturnValue({
      isAuthenticated: true,
      hasLocalData: false,
      migrateToCloud: mockMigrateToCloud,
    } as ReturnType<typeof useWorkspace>);

    const { container } = render(<MigrationBanner />);
    expect(container.firstChild).toBeNull();
  });

  it("should render when user is authenticated and has local data", () => {
    mockedUseWorkspace.mockReturnValue({
      isAuthenticated: true,
      hasLocalData: true,
      migrateToCloud: mockMigrateToCloud,
    } as ReturnType<typeof useWorkspace>);

    render(<MigrationBanner />);

    expect(
      screen.getByText(/You have local data from before signing in/)
    ).toBeInTheDocument();
    expect(screen.getByText("Migrate to Cloud")).toBeInTheDocument();
    expect(screen.getByText("Dismiss")).toBeInTheDocument();
  });

  it("should dismiss when dismiss button is clicked", () => {
    mockedUseWorkspace.mockReturnValue({
      isAuthenticated: true,
      hasLocalData: true,
      migrateToCloud: mockMigrateToCloud,
    } as ReturnType<typeof useWorkspace>);

    render(<MigrationBanner />);

    fireEvent.click(screen.getByText("Dismiss"));

    expect(
      screen.queryByText(/You have local data from before signing in/)
    ).not.toBeInTheDocument();
  });

  it("should call migrateToCloud when migrate button is clicked", async () => {
    mockMigrateToCloud.mockResolvedValue({
      success: true,
      message: "Successfully migrated 5 leads",
    });

    mockedUseWorkspace.mockReturnValue({
      isAuthenticated: true,
      hasLocalData: true,
      migrateToCloud: mockMigrateToCloud,
    } as ReturnType<typeof useWorkspace>);

    render(<MigrationBanner />);

    fireEvent.click(screen.getByText("Migrate to Cloud"));

    await waitFor(() => {
      expect(mockMigrateToCloud).toHaveBeenCalledTimes(1);
    });
  });

  it("should show loading state during migration", async () => {
    // Create a promise that we control
    let resolvePromise: (value: { success: boolean; message: string }) => void;
    const migrationPromise = new Promise<{ success: boolean; message: string }>(
      (resolve) => {
        resolvePromise = resolve;
      }
    );
    mockMigrateToCloud.mockReturnValue(migrationPromise);

    mockedUseWorkspace.mockReturnValue({
      isAuthenticated: true,
      hasLocalData: true,
      migrateToCloud: mockMigrateToCloud,
    } as ReturnType<typeof useWorkspace>);

    render(<MigrationBanner />);

    fireEvent.click(screen.getByText("Migrate to Cloud"));

    // Should show loading state
    await waitFor(() => {
      expect(screen.getByText("Migrating...")).toBeInTheDocument();
    });

    // Resolve the promise - use failure to avoid auto-dismiss
    resolvePromise!({ success: false, message: "Test complete" });

    // Should show result message
    await waitFor(() => {
      expect(screen.getByText("Test complete")).toBeInTheDocument();
    });
  });

  it("should show error message and retry button on failure", async () => {
    mockMigrateToCloud.mockResolvedValue({
      success: false,
      message: "Network error",
    });

    mockedUseWorkspace.mockReturnValue({
      isAuthenticated: true,
      hasLocalData: true,
      migrateToCloud: mockMigrateToCloud,
    } as ReturnType<typeof useWorkspace>);

    render(<MigrationBanner />);

    fireEvent.click(screen.getByText("Migrate to Cloud"));

    await waitFor(() => {
      expect(screen.getByText("Network error")).toBeInTheDocument();
      expect(screen.getByText("Try Again")).toBeInTheDocument();
    });
  });
});
