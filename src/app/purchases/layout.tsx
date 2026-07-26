import DashboardShell from "@/components/layout/DashboardShell";

export default function PurchasesLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <DashboardShell>{children}</DashboardShell>;
}
