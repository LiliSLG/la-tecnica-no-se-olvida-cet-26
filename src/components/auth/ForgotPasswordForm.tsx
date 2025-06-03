"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Mail, Send } from 'lucide-react';
import Image from 'next/image';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Por favor, ingresa un correo electrónico válido." }),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordForm() {
  const { sendPasswordReset, loading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit: SubmitHandler<ForgotPasswordFormData> = async (data) => {
    setIsSubmitting(true);
    try {
      const success = await sendPasswordReset(data.email);
      if (!success) {
        toast({
          title: "Error al enviar el correo",
          description: "No se pudo enviar el correo de recuperación. Por favor, intenta nuevamente.",
          variant: "destructive",
        });
      } else {
        form.reset(); // Clear form on success
        toast({
          title: "Correo enviado",
          description: "Se ha enviado un correo con instrucciones para restablecer tu contraseña.",
        });
      }
    } catch (error) {
      toast({
        title: "Error al enviar el correo",
        description: "Ocurrió un error inesperado. Por favor, intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-200px)] py-12">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <Image 
            src="https://placehold.co/100x100.png" 
            alt="La técnica no se olvida Logo" 
            data-ai-hint="school logo"
            width={80} 
            height={80} 
            className="mx-auto mb-4 rounded-full"
          />
          <CardTitle className="text-3xl font-bold text-primary">Restablecer Contraseña</CardTitle>
          <CardDescription>Ingresa tu correo electrónico para recibir un enlace de restablecimiento.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><Mail className="mr-2 h-4 w-4 text-primary" /> Correo Electrónico</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="tu.email@ejemplo.com" {...field} className="shadow-sm" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 text-lg shadow-md"
                disabled={isSubmitting || loading}
              >
                <Send className="mr-2 h-5 w-5" />
                {isSubmitting ? 'Enviando...' : 'Enviar Enlace'}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="text-center flex-col items-center space-y-2 pt-4">
          <p className="text-sm">
            <Link href="/login" className="font-medium text-primary hover:underline">
              Volver a Iniciar Sesión
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
