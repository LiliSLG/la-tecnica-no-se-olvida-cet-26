// src/app/dashboard/organizaciones/[id]/edit/page.tsx
import { OrganizacionEditClient } from "./OrganizacionEditClient";

interface OrganizacionEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function DashboardOrganizacionEditPage({
  params,
}: OrganizacionEditPageProps) {
  const { id } = await params;

  return <OrganizacionEditClient id={id} />;
}
