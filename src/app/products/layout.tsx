import DashboardShell from "@/components/layout/DashboardShell";

export default function ProductsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <DashboardShell>{children}</DashboardShell>;
}
