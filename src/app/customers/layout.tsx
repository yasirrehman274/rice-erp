import DashboardShell from "@/components/layout/DashboardShell";

export default function CustomersLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <DashboardShell>{children}</DashboardShell>;
}
