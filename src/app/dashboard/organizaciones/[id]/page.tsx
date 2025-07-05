// src/app/dashboard/organizaciones/[id]/page.tsx
import { OrganizacionDashboardClient } from "./OrganizacionDashboardClient";

interface OrganizacionDashboardPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrganizacionDashboardPage({
  params,
}: OrganizacionDashboardPageProps) {
  const { id } = await params;

  return <OrganizacionDashboardClient id={id} />;
}
