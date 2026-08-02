import DashboardShell from "@/components/layout/DashboardShell";

export default function ExpensesLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <DashboardShell>{children}</DashboardShell>;
}
