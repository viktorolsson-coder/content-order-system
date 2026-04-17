import { prisma } from "@/lib/prisma";
import { ClientsManager } from "./ClientsManager";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const clients = await prisma.client.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, monthlyTarget: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Clients</h1>
        <p className="text-sm text-slate-600 mt-1">
          Manage the client list and set each client's monthly deliverable target.
        </p>
      </div>
      <ClientsManager initialClients={clients} />
    </div>
  );
}
