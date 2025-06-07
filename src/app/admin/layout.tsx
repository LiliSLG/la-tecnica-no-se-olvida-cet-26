'use client';

import { ReactNode, useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login?redirectedFrom=/admin');
    }
  }, [user, router]);

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <div className="min-h-screen">
      <header className="h-16 border-b flex items-center justify-between px-6">
        <div className="text-lg font-semibold">Admin Panel</div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            {user?.email}
          </div>
          <Button 
            variant="ghost" 
            onClick={handleLogout}
            className="text-sm"
          >
            Logout
          </Button>
        </div>
      </header>

      <div className="flex flex-col md:flex-row">
      {/* Navigation placeholder */}
        <nav className="w-64 border-r min-h-[calc(100vh-4rem)]">
          {/* Future: Admin navigation */}
        </nav>

        {/* Main content area */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
} 