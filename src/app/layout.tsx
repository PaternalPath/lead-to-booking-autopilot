import type { Metadata } from "next";
import "./globals.css";
import { WorkspaceProvider } from "@/contexts/WorkspaceContext";
import { Navigation } from "@/components/Navigation";

export const metadata: Metadata = {
  title: "Lead Autopilot",
  description: "Local-first lead pipeline and follow-up cadence tool for travel advisors",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <WorkspaceProvider>
          <Navigation />
          <main>{children}</main>
        </WorkspaceProvider>
      </body>
    </html>
  );
}
