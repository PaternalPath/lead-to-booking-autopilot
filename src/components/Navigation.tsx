"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Home,
  Columns,
  FileText,
  Settings,
  User,
  LogOut,
  ChevronDown,
  Building2,
  Check,
  Plus,
} from "lucide-react";
import { useOrganization } from "@/contexts/OrganizationContext";

const navItems = [
  { href: "/", label: "Leads", icon: Home },
  { href: "/pipeline", label: "Pipeline", icon: Columns },
  { href: "/templates", label: "Templates", icon: FileText },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Navigation() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { currentOrganization, organizations, setCurrentOrganization } = useOrganization();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [orgMenuOpen, setOrgMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const orgMenuRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
      if (orgMenuRef.current && !orgMenuRef.current.contains(event.target as Node)) {
        setOrgMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isAuthenticated = status === "authenticated" && session?.user;

  return (
    <nav className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-zinc-900 dark:text-white">
                Lead Autopilot
              </h1>
            </div>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive
                        ? "border-blue-500 text-zinc-900 dark:text-white"
                        : "border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right side - Auth & Org */}
          <div className="hidden sm:flex sm:items-center sm:space-x-4">
            {isAuthenticated ? (
              <>
                {/* Organization Switcher */}
                {organizations.length > 0 && (
                  <div className="relative" ref={orgMenuRef}>
                    <button
                      onClick={() => setOrgMenuOpen(!orgMenuOpen)}
                      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                    >
                      <Building2 className="w-4 h-4" />
                      <span className="max-w-32 truncate">
                        {currentOrganization?.name || "Select Org"}
                      </span>
                      <ChevronDown className="w-4 h-4" />
                    </button>

                    {orgMenuOpen && (
                      <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-zinc-800 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-700 py-1 z-50">
                        <div className="px-3 py-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                          Organizations
                        </div>
                        {organizations.map((org) => (
                          <button
                            key={org.id}
                            onClick={() => {
                              setCurrentOrganization(org);
                              setOrgMenuOpen(false);
                            }}
                            className="w-full flex items-center justify-between px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                          >
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4" />
                              <span className="truncate">{org.name}</span>
                            </div>
                            {currentOrganization?.id === org.id && (
                              <Check className="w-4 h-4 text-blue-500" />
                            )}
                          </button>
                        ))}
                        <div className="border-t border-zinc-200 dark:border-zinc-700 mt-1 pt-1">
                          <button
                            onClick={() => setOrgMenuOpen(false)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                          >
                            <Plus className="w-4 h-4" />
                            Create Organization
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* User Menu */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                  >
                    {session.user.image ? (
                      <img
                        src={session.user.image}
                        alt=""
                        className="w-6 h-6 rounded-full"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium">
                        {session.user.name?.[0] || session.user.email?.[0] || "U"}
                      </div>
                    )}
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-800 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-700 py-1 z-50">
                      <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-700">
                        <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">
                          {session.user.name || "User"}
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                          {session.user.email}
                        </p>
                      </div>
                      <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : status === "loading" ? (
              <div className="w-20 h-8 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" />
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/auth/signin"
                  className="px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile user button */}
          <div className="flex items-center sm:hidden">
            {isAuthenticated ? (
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="p-2 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
              >
                <User className="w-5 h-5" />
              </button>
            ) : (
              <Link
                href="/auth/signin"
                className="px-3 py-2 text-sm font-medium text-blue-600"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="sm:hidden">
        <div className="pt-2 pb-3 space-y-1 border-t border-zinc-200 dark:border-zinc-800">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                  isActive
                    ? "bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                    : "border-transparent text-zinc-600 hover:bg-zinc-50 hover:border-zinc-300 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                }`}
              >
                <div className="flex items-center">
                  <Icon className="w-4 h-4 mr-3" />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </div>

        {/* Mobile user menu */}
        {isAuthenticated && userMenuOpen && (
          <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4 pb-3">
            <div className="flex items-center px-4">
              {session?.user.image ? (
                <img
                  src={session.user.image}
                  alt=""
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                  {session?.user.name?.[0] || session?.user.email?.[0] || "U"}
                </div>
              )}
              <div className="ml-3">
                <p className="text-base font-medium text-zinc-800 dark:text-white">
                  {session?.user.name || "User"}
                </p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {session?.user.email}
                </p>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              {currentOrganization && (
                <div className="px-4 py-2 text-sm text-zinc-500 dark:text-zinc-400">
                  <span className="font-medium">Org:</span> {currentOrganization.name}
                </div>
              )}
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="block w-full text-left px-4 py-2 text-base font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
