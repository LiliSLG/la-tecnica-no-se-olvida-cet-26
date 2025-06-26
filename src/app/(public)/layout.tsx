// src/app/(public)/layout.tsx
import { ReactNode } from "react";
import { MainHeader } from "@/components/common/MainHeader";
import { Toaster } from "@/components/ui/toaster";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <MainHeader />
      <main className="container mx-auto px-4 py-6">{children}</main>
      <Toaster />
    </div>
  );
}
