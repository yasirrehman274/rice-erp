import DashboardShell from "@/components/layout/DashboardShell";

export default function BrokersLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <DashboardShell>{children}</DashboardShell>;
}