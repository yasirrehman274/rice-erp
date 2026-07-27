import DashboardShell from "@/components/layout/DashboardShell";

export default function SuppliersLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <DashboardShell>{children}</DashboardShell>;
}
