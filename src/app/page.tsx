import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-bold">Welcome to the Admin Panel</h1>
        <p className="mt-4">Go to /admin/gestion-personas to test the Persona Gestion.</p>
        <Link href="/admin/gestion-personas" passHref legacyBehavior>
          <Button asChild>
            <a>Ir a Gestionar Personas</a>
          </Button>
        </Link>
      </main>
    );
  }
  