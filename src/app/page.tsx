import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-bold">Bienvenidos a la tecnica no se olvida</h1>
        <p className="mt-4">Ir a Admin Dashboard para testear.</p>
        <Link href="/admin/" passHref legacyBehavior>
          <Button asChild>
            <a>Ir a Admin Dashboard</a>
          </Button>
        </Link>
        <p className="mt-4">Ir a vista publica para testear.</p>
        <Link href="/comunidad/personas" passHref legacyBehavior>
          <Button asChild>
            <a>Ir a vista publica personas</a>
          </Button>
        </Link>
      </main>
    );
  }
  