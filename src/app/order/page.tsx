import { prisma } from "@/lib/prisma";
import { OrderForm } from "./OrderForm";

export const dynamic = "force-dynamic";

export default async function OrderPage() {
  const clients = await prisma.client.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">New content order</h1>
        <p className="text-sm text-slate-600 mt-1">
          Submitting this form creates a task in the Content Team Asana project.
        </p>
      </div>
      <OrderForm clients={clients} />
    </div>
  );
}
