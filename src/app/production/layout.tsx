import DashboardShell from "@/components/layout/DashboardShell";

export default function ProductionLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <DashboardShell>{children}</DashboardShell>;
}
