
import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; // Use Inter font
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Toaster } from "@/components/ui/toaster"; // Import Toaster

const inter = Inter({ // Initialize Inter
  variable: '--font-inter', // Set CSS variable
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'La técnica no se olvida',
  description: 'Preserving rural knowledge and student technical projects from CET N°26 Ingeniero Jacobacci.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        {/* Next.js will automatically populate the head content.
            This explicit empty <head> tag helps structure the document. */}
      </head>
      <body className="antialiased font-sans flex flex-col min-h-screen">
        <AuthProvider>
          <Navbar />
          <main className="flex-grow container mx-auto px-4 py-8">
            {children}
          </main>
          <Footer />
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
