import DashboardShell from "@/components/layout/DashboardShell";

export default function SalesLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <DashboardShell>{children}</DashboardShell>;
}
