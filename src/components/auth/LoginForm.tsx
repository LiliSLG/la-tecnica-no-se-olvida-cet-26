"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Mail, Lock, LogIn } from 'lucide-react';
import Image from 'next/image';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';

const loginSchema = z.object({
  email: z.string().email({ message: "Por favor, ingresa un correo electrónico válido." }),
  password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
});

type LoginFormData = z.infer<typeof loginSchema>;

// Simple Google Icon SVG
const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    <path d="M1 1h22v22H1z" fill="none"/>
  </svg>
);

export default function LoginForm() {
  const { user, loading, signInWithEmailPswd, signInWithGoogle } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittingGoogle, setIsSubmittingGoogle] = useState(false);
  const { toast } = useToast();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    if (user && !loading) {
      const redirectUrl = searchParams.get('redirect') || '/';
      router.push(redirectUrl);
    }
  }, [user, loading, router, searchParams]);

  const onSubmit: SubmitHandler<LoginFormData> = async (data) => {
    setIsSubmitting(true);
    try {
      const success = await signInWithEmailPswd(data.email, data.password);
      if (!success) {
        toast({
          title: "Error al iniciar sesión",
          description: "Credenciales inválidas. Por favor, intenta nuevamente.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error al iniciar sesión",
        description: "Ocurrió un error inesperado. Por favor, intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsSubmittingGoogle(true);
    try {
      const success = await signInWithGoogle();
      if (!success) {
        toast({
          title: "Error al iniciar sesión con Google",
          description: "No se pudo iniciar sesión con Google. Por favor, intenta nuevamente.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error al iniciar sesión con Google",
        description: "Ocurrió un error inesperado. Por favor, intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingGoogle(false);
    }
  };

  if (loading && !user) { 
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <p>Cargando...</p>
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <p>Ya has iniciado sesión. Redirigiendo...</p>
      </div>
    );
  }
  
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
          <CardTitle className="text-3xl font-bold text-primary">Iniciar Sesión</CardTitle>
          <CardDescription>Accede con tu correo electrónico y contraseña.</CardDescription>
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
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center"><Lock className="mr-2 h-4 w-4 text-primary" /> Contraseña</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} className="shadow-sm" />
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
                <LogIn className="mr-2 h-5 w-5" />
                {isSubmitting ? 'Ingresando...' : 'Ingresar'}
              </Button>
            </form>
          </Form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                O continuar con
              </span>
            </div>
          </div>

          <Button 
            variant="outline" 
            className="w-full py-3 text-lg shadow-md" 
            onClick={handleGoogleSignIn}
            disabled={isSubmittingGoogle || loading}
          >
            <GoogleIcon />
            <span className="ml-2">{isSubmittingGoogle ? 'Conectando...' : 'Iniciar Sesión con Google'}</span>
          </Button>

          <div className="mt-6 text-center text-sm">
            <p className="text-muted-foreground">
              ¿No tienes una cuenta?{' '}
              <Link href="/signup" className="font-medium text-primary hover:underline">
                Regístrate
              </Link>
            </p>
            <p className="mt-2">
              <Link href="/forgot-password" className="text-xs text-muted-foreground hover:text-primary hover:underline">
                ¿Olvidaste tu contraseña?
              </Link>
            </p>
          </div>
        </CardContent>
        <CardFooter className="text-center flex-col items-center space-y-2 pt-4">
          <p className="text-xs text-muted-foreground">
            Al continuar, aceptas nuestros Términos de Servicio y Política de Privacidad (simulados).
          </p>
          <p className="text-sm text-muted-foreground">
            Este es un proyecto educativo.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
