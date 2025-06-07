import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-bold">Welcome to the Admin Panel</h1>
        <p className="mt-4">Go to /admin/gestion-personas/nueva to test the PersonaForm.</p>
        <Link href="/admin/gestion-personas/nueva" passHref legacyBehavior>
          <Button asChild>
            <a>Go to New Persona Form</a>
          </Button>
        </Link>
      </main>
    );
  }
  