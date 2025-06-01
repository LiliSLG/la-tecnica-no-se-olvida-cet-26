
"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface UnsavedChangesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmSaveAndExit: () => void;
  onConfirmDiscardAndExit: () => void;
}

export default function UnsavedChangesModal({
  isOpen,
  onClose,
  onConfirmSaveAndExit,
  onConfirmDiscardAndExit,
}: UnsavedChangesModalProps) {
  if (!isOpen) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cambios sin Guardar</AlertDialogTitle>
          <AlertDialogDescription>
            Tienes cambios sin guardar. ¿Estás seguro de que quieres salir sin guardar los cambios?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose}>
            Permanecer en la Página
          </Button>
          <Button variant="destructive" onClick={onConfirmDiscardAndExit}>
            Descartar y Salir
          </Button>
          <AlertDialogAction onClick={onConfirmSaveAndExit}>
            Guardar y Salir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
