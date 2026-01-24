"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useOrganization } from "@/contexts/OrganizationContext";
import {
  Users,
  Calendar,
  Mail,
  BarChart3,
  ArrowRight,
  Loader2,
  Sparkles,
  CheckCircle,
} from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Lead Management",
    description: "Track and organize all your leads in one place with custom stages and pipelines.",
  },
  {
    icon: Calendar,
    title: "Smart Follow-ups",
    description: "Never miss a follow-up with automated task scheduling and reminders.",
  },
  {
    icon: Mail,
    title: "Multi-channel Outreach",
    description: "Reach leads via email, SMS, or phone with customizable templates.",
  },
  {
    icon: BarChart3,
    title: "Pipeline Analytics",
    description: "Get insights into your conversion rates and pipeline performance.",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { currentOrganization, isLoading: orgLoading } = useOrganization();
  const [step, setStep] = useState(1);
  const [workspaceName, setWorkspaceName] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Redirect if not authenticated
  if (status === "unauthenticated") {
    router.push("/auth/signin");
    return null;
  }

  if (status === "loading" || orgLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const userName = session?.user?.name?.split(" ")[0] || "there";

  const handleUpdateWorkspace = async () => {
    if (!workspaceName.trim() || !currentOrganization) {
      setStep(2);
      return;
    }

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/organizations/${currentOrganization.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": currentOrganization.id,
        },
        body: JSON.stringify({ name: workspaceName }),
      });

      if (response.ok) {
        // Refresh the page to update the organization name in context
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to update workspace:", error);
    } finally {
      setIsUpdating(false);
      setStep(2);
    }
  };

  const handleGetStarted = () => {
    // Mark onboarding as complete in localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("onboarding_complete", "true");
    }
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto px-4 py-16">
        {step === 1 && (
          <div className="text-center space-y-8 animate-in fade-in duration-500">
            <div className="space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900">
                <Sparkles className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                Welcome, {userName}!
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Let&apos;s set up your workspace. You can customize it now or skip to explore the app.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md mx-auto">
              <label
                htmlFor="workspaceName"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 text-left mb-2"
              >
                Workspace Name
              </label>
              <input
                id="workspaceName"
                type="text"
                placeholder={currentOrganization?.name || "My Workspace"}
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 text-left">
                This is how your workspace will appear to team members.
              </p>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 px-4 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Skip
                </button>
                <button
                  onClick={handleUpdateWorkspace}
                  disabled={isUpdating}
                  className="flex-1 px-4 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {isUpdating ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-12 animate-in fade-in duration-500">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Here&apos;s what you can do
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Lead Autopilot helps you convert more leads into bookings.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <feature.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {feature.title}
                      </h3>
                      <p className="mt-1 text-gray-600 dark:text-gray-300">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-center text-white">
              <CheckCircle className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">You&apos;re all set!</h3>
              <p className="text-blue-100 mb-6 max-w-lg mx-auto">
                Start by adding your first lead or load demo data to explore all features.
              </p>
              <button
                onClick={handleGetStarted}
                className="px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors inline-flex items-center gap-2"
              >
                Get Started
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
