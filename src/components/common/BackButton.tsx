// /src/components/common/BackButton.tsx
"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  href?: string;
  label?: string;
  className?: string;
}

export function BackButton({
  href,
  label = "Volver",
  className,
}: BackButtonProps) {
  const router = useRouter();

  // Si se proporciona href, usar Link
  if (href) {
    return (
      <Link href={href}>
        <Button variant="ghost" className={`mb-4 ${className || ""}`}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {label}
        </Button>
      </Link>
    );
  }

  // Si no hay href, usar router.back() (comportamiento original)
  return (
    <Button
      variant="ghost"
      onClick={() => router.back()}
      className={`mb-4 ${className || ""}`}
    >
      <ArrowLeft className="mr-2 h-4 w-4" />
      {label}
    </Button>
  );
}
