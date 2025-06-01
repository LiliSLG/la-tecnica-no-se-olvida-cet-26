
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Mail, Briefcase, Shield, Edit3, FolderKanban, MicVocal, Settings, AlertTriangle, ExternalLink, CheckCircle, XCircle, GraduationCap, GanttChartSquare, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import type { Persona } from '@/lib/types';
import { db } from '@/lib/firebase/config';
import { doc, getDoc } from 'firebase/firestore';

export default function ManagementPanelContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [personaData, setPersonaData] = useState<Persona | null>(null);
  const [personaLoading, setPersonaLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/management-panel');
    } else if (user && !authLoading) {
      const fetchPersonaData = async () => {
        setPersonaLoading(true);
        try {
          const personaDocRef = doc(db, 'personas', user.uid);
          const docSnap = await getDoc(personaDocRef);

          if (docSnap.exists()) {
            setPersonaData(docSnap.data() as Persona);
          } else {
            console.warn("No persona document found for UID:", user.uid, "This might be normal if ensureUserProfileInFirestore hasn't run or completed yet for this user.");
            // It's possible ensureUserProfileInFirestore is still running or hasn't created the doc yet
            // especially on first login/refresh. The AuthContext useEffect will handle it.
            setPersonaData(null); 
          }
        } catch (error) {
          console.error("Error fetching persona data:", error);
          setPersonaData(null); 
        } finally {
          setPersonaLoading(false);
        }
      };

      fetchPersonaData();
    }
  }, [user, authLoading, router]);

  if (authLoading || personaLoading) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-200px)]"><p>Cargando panel de gestión...</p></div>;
  }

  if (!user) {
    // This case should ideally be caught by the useEffect redirect, but it's a fallback.
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-6">
        <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Acceso Restringido</h2>
        <p className="text-muted-foreground mb-6">Debes iniciar sesión para acceder al panel de gestión.</p>
        <Button onClick={() => router.push('/login?redirect=/management-panel')}>Iniciar Sesión</Button>
      </div>
    );
  }
  
  const getInitials = (nombre?: string | null, apellido?: string | null) => {
    const n = nombre?.charAt(0) || '';
    const a = apellido?.charAt(0) || '';
    const initials = `${n}${a}`.trim().toUpperCase();
    return initials.length > 0 ? initials : (user?.email?.charAt(0) || '?').toUpperCase();
  };
  
  const displayName = personaData ? `${personaData.nombre || ''} ${personaData.apellido || ''}`.trim() : user.displayName || 'Usuario Anónimo';
  const displayEmail = personaData?.email || user.email || 'Email no disponible';
  const avatarSrc = personaData?.fotoURL || user.photoURL || undefined;


  return (
    <div className="space-y-12">
      <header className="text-center py-10 bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl shadow-lg">
        <Settings className="h-20 w-20 text-primary mx-auto mb-4" />
        <h1 className="text-5xl font-extrabold text-primary mb-3">Panel de Gestión</h1>
        <p className="text-xl text-foreground/80 max-w-2xl mx-auto">
          Gestiona tu información personal y accede a herramientas.
        </p>
      </header>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl text-primary flex items-center gap-3">
            <User className="h-8 w-8" />
            Panel Personal
          </CardTitle>
          <CardDescription>Tu información y actividad en la plataforma.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap items-center gap-4 p-4 border rounded-lg bg-card/50">
            <Avatar className="h-20 w-20">
              <AvatarImage src={avatarSrc} alt={displayName} />
              <AvatarFallback className="text-2xl bg-primary/20 text-primary">
                {getInitials(personaData?.nombre, personaData?.apellido)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1 flex-grow">
              <h3 className="text-2xl font-semibold">{displayName}</h3>
              <p className="text-muted-foreground flex items-center gap-2"><Mail className="h-4 w-4" /> {displayEmail}</p>
              {personaData ? (
                <>
                  <p className="text-muted-foreground flex items-center gap-2">
                    <Briefcase className="h-4 w-4" /> Categoría Principal: {personaData.categoriaPrincipal || 'No especificada'}
                  </p>
                  <p className="text-muted-foreground flex items-center gap-2">
                     Estado: {personaData.activo ? 
                      <span className="flex items-center gap-1 text-green-600"><CheckCircle className="h-4 w-4" /> Activo</span> : 
                      <span className="flex items-center gap-1 text-red-600"><XCircle className="h-4 w-4" /> Inactivo</span>
                    }
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Información de perfil no encontrada. Se creará/sincronizará en breve si es tu primer inicio de sesión.</p>
              )}
            </div>
            <Button variant="outline" size="sm" className="ml-auto self-start" disabled>
              <Edit3 className="mr-2 h-4 w-4" /> Editar Datos (Próximamente)
            </Button>
          </div>

          {personaData?.esAdmin && (
            <Card className="shadow-md border-accent bg-accent/5">
              <CardHeader>
                <CardTitle className="text-2xl text-accent-foreground flex items-center gap-3">
                  <Shield className="h-7 w-7" />
                  Acciones de Administrador
                </CardTitle>
                <CardDescription className="text-accent-foreground/80">
                  Atajos para la gestión de la plataforma.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-0 sm:flex sm:flex-wrap sm:justify-center sm:gap-4">
                  <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90" asChild>
                      <Link href="/proyectos/nuevo"> 
                          <PlusCircle className="mr-2 h-5 w-5" /> Crear Nuevo Proyecto
                      </Link>
                  </Button>
                  <Button size="lg" className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground" asChild>
                      <Link href="/admin"> 
                          Ir al Panel de Administración <ExternalLink className="ml-2 h-5 w-5" />
                      </Link>
                  </Button>
              </CardContent>
            </Card>
          )}

          <div>
            <h4 className="text-xl font-semibold text-primary/90 mb-3 flex items-center gap-2"><FolderKanban className="h-5 w-5" /> Mis Proyectos</h4>
            <div className="p-4 border rounded-lg bg-background text-center">
              <p className="text-muted-foreground mb-4">
                Aquí se listarán los proyectos donde figuras como autor o colaborador.
              </p>
              <Button asChild>
                <Link href="/proyectos/nuevo"><GanttChartSquare className="mr-2 h-4 w-4" /> Crear Nuevo Proyecto</Link>
              </Button>
            </div>
          </div>

          <div>
            <h4 className="text-xl font-semibold text-primary/90 mb-3 flex items-center gap-2"><MicVocal className="h-5 w-5" /> Mis Entrevistas</h4>
            <div className="p-4 border rounded-lg bg-background text-center text-muted-foreground">
              <p>(Aquí se listarán las entrevistas que realizaste - Próximamente)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

    