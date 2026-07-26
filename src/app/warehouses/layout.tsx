import DashboardShell from "@/components/layout/DashboardShell";

export default function WarehousesLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <DashboardShell>{children}</DashboardShell>;
}
