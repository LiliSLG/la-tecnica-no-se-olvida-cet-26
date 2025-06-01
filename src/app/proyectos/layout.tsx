
// This layout makes the /proyectos section and its children public.
// Authentication checks for specific actions (like editing) will be handled
// within those specific components or a future user/admin panel layout.

export default function ProyectosPublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
