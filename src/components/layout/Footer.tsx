
"use client";

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Mail } from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() === '' || !email.includes('@')) {
      toast({
        title: "Email Inválido",
        description: "Por favor, ingresa una dirección de email válida.",
        variant: "destructive",
      });
      return;
    }
    // For now, just log to console and show a success message
    console.log('Email para suscripción:', email);
    toast({
      title: "¡Suscrito!",
      description: `Gracias por suscribirte con ${email}.`,
    });
    setEmail(''); // Clear the input field
  };

  return (
    <footer className="bg-card border-t border-border py-10 text-center">
      <div className="container mx-auto px-4 space-y-8">
        {/* Subscription Section */}
        <div className="max-w-xl mx-auto p-6 rounded-lg shadow-md bg-background">
          <h3 className="text-2xl font-semibold text-primary mb-3 flex items-center justify-center gap-2">
            <Mail className="h-7 w-7" />
            Mantente Conectado
          </h3>
          <p className="text-muted-foreground mb-6 text-base">
            Suscríbete para recibir actualizaciones y noticias sobre el proyecto "La técnica no se olvida" y los avances de CET N°26.
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 items-center justify-center">
            <Input
              type="email"
              placeholder="tu.email@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-grow shadow-sm h-11 text-base sm:text-sm"
              aria-label="Dirección de correo electrónico"
            />
            <Button type="submit" className="w-full sm:w-auto shadow-md h-11 px-6 text-base sm:text-sm">
              Suscribirse
            </Button>
          </form>
        </div>

        {/* Copyright Section */}
        <div className="pt-6 border-t border-border/50">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} "La técnica no se olvida" - CET N°26 Ingeniero Jacobacci. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
