"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { api } from "@/lib/api/client";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
}

interface OrganizationContextValue {
  currentOrganization: Organization | null;
  organizations: Organization[];
  isLoading: boolean;
  setCurrentOrganization: (org: Organization) => void;
}

const OrganizationContext = createContext<OrganizationContextValue | undefined>(undefined);

export function OrganizationProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [currentOrganization, setCurrentOrgState] = useState<Organization | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);

  // Derive loading state directly from auth status and whether data has been processed
  // This avoids the need for setState inside useEffect
  const isLoading = status === "loading" ||
    (status === "authenticated" && organizations.length === 0 && !!session?.user?.organizations?.length);

  // Load organizations from session
  useEffect(() => {
    if (status === "loading") {
      return;
    }

    if (status === "unauthenticated") {
      return;
    }

    if (session?.user?.organizations) {
      const orgs = session.user.organizations as Organization[];

      // Only update if not already set (avoids unnecessary re-renders)
      if (organizations.length === 0) {
        setOrganizations(orgs);
      }

      // Try to restore last selected organization
      const savedOrgId = typeof window !== "undefined"
        ? localStorage.getItem("currentOrganizationId")
        : null;

      const selectedOrg = savedOrgId
        ? orgs.find((o) => o.id === savedOrgId)
        : null;

      const org = selectedOrg || orgs[0] || null;

      if (org && !currentOrganization) {
        setCurrentOrgState(org);
        api.setOrganization(org.id);
      }
    }
  }, [session, status, organizations.length, currentOrganization]);

  const setCurrentOrganization = useCallback((org: Organization) => {
    setCurrentOrgState(org);
    api.setOrganization(org.id);

    if (typeof window !== "undefined") {
      localStorage.setItem("currentOrganizationId", org.id);
    }
  }, []);

  const value: OrganizationContextValue = {
    currentOrganization,
    organizations,
    isLoading,
    setCurrentOrganization,
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error("useOrganization must be used within an OrganizationProvider");
  }
  return context;
}
