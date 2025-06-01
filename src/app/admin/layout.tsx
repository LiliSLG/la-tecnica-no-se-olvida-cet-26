
"use client";

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import type { Persona } from '@/lib/types';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [statusLoading, setStatusLoading] = useState(true);

  useEffect(() => {
    if (authLoading) {
      return; // Wait for Firebase Auth to initialize
    }

    if (!user) {
      router.push('/login?redirect=/admin'); // Redirect to login if not authenticated
      return;
    }

    // Fetch persona data to check for admin status
    const checkAdminStatus = async () => {
      if (user) {
        try {
          const personaDocRef = doc(db, 'personas', user.uid);
          const docSnap = await getDoc(personaDocRef);
          if (docSnap.exists()) {
            const personaData = docSnap.data() as Persona;
            if (personaData.esAdmin) {
              setIsAdmin(true);
            } else {
              // Not an admin, redirect to home or a 'not authorized' page
              console.warn("User is not an admin. Redirecting.");
              router.push('/'); 
            }
          } else {
            // Persona document doesn't exist, treat as not admin
            console.warn("Persona document not found for user. Redirecting.");
            router.push('/');
          }
        } catch (error) {
          console.error("Error fetching admin status:", error);
          router.push('/'); // Redirect on error
        } finally {
          setStatusLoading(false);
        }
      } else {
        // This case should be caught by the !user check above, but as a safeguard:
        setStatusLoading(false);
      }
    };

    checkAdminStatus();

  }, [user, authLoading, router]);

  if (authLoading || statusLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">Verificando acceso...</p>
      </div>
    );
  }

  if (!isAdmin) {
    // This should ideally be caught by the redirect in useEffect,
    // but it's a good fallback.
    // You might want to render a specific "Not Authorized" component here
    // or ensure the redirect has completed.
    return (
         <div className="flex items-center justify-center min-h-screen bg-background">
            <p className="text-lg text-destructive">Acceso denegado. Redirigiendo...</p>
        </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-muted/40">
      <AdminSidebar />
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
