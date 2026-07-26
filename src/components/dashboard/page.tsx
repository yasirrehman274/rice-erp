import DashboardCards from "@/components/dashboard/DashboardCards";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>

        <p className="text-gray-500">Welcome to Rice ERP</p>
      </div>

      <DashboardCards />
    </div>
  );
}
