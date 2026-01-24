import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { OrganizationProvider } from "@/contexts/OrganizationContext";
import { WorkspaceProvider } from "@/contexts/WorkspaceContext";
import { Navigation } from "@/components/Navigation";

export const metadata: Metadata = {
  title: "Lead Autopilot",
  description: "Enterprise-ready lead pipeline and follow-up cadence tool for travel advisors",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          <OrganizationProvider>
            <WorkspaceProvider>
              <Navigation />
              <main>{children}</main>
            </WorkspaceProvider>
          </OrganizationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
