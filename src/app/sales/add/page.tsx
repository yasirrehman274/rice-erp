import SaleForm from "@/components/sales/SaleForm";

export default function AddSalePage() {
  return <div className="mx-auto max-w-7xl pb-8">
    <div className="mb-6"><h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Create Sale</h1></div>
    <SaleForm />
  </div>;
}
