// src/components/public/common/ShareButton.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface ShareButtonProps {
  title: string;
  text?: string;
  url?: string;
  className?: string;
}

export function ShareButton({
  title,
  text = "",
  url,
  className,
}: ShareButtonProps) {
  const { toast } = useToast();

  const handleShare = async () => {
    const shareUrl = url || window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title,
          text,
          url: shareUrl,
        });
      } else {
        // Fallback: copiar al clipboard
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "¡Enlace copiado!",
          description: "El enlace ha sido copiado al portapapeles.",
        });
      }
    } catch (error) {
      console.error("Error sharing:", error);
      toast({
        title: "Error",
        description: "No se pudo compartir el contenido.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleShare}
      className={className}
    >
      <Share2 className="h-4 w-4 mr-2" />
      Enlace
    </Button>
  );
}
