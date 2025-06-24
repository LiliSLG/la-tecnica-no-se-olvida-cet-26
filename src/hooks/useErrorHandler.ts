// En /src/hooks/useErrorHandler.ts
import { useToast } from "@/components/ui/use-toast";

export function useErrorHandler() {
  const { toast } = useToast();

  const handleError = (error: any, defaultMessage = "Error inesperado") => {
    let message = defaultMessage;

    if (typeof error === "string") {
      message = error;
    } else if (error?.message) {
      message = error.message;
    } else if (error?.details) {
      message = error.details;
    }

    toast({
      title: "Error",
      description: message,
      variant: "destructive",
    });
  };

  return { handleError };
}
