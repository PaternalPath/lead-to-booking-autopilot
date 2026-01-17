import type { Metadata } from "next";
import "./globals.css";

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
        {children}
      </body>
    </html>
  );
}
