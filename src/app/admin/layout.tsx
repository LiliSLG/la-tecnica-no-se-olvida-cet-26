"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if we're not loading and there's no user
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  // Show nothing while loading or if not authenticated
  if (isLoading || !user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar user={user} onSignOut={signOut} />
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
} 