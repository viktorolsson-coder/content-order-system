import { prisma } from "./prisma";
import { formatMonth } from "./deadline";

export interface DeliverableRow {
  clientId: string;
  clientName: string;
  monthlyTarget: number;
  orderedCount: number;
  adjustments: number;
  deliveredCount: number;
  percentOfTarget: number | null;
  adjustmentEntries: Array<{ id: string; delta: number; note: string | null; createdAt: string }>;
}

export async function getDeliverablesForMonth(month: string): Promise<DeliverableRow[]> {
  const [clients, orders, adjustments] = await Promise.all([
    prisma.client.findMany({ orderBy: { name: "asc" } }),
    prisma.order.findMany(),
    prisma.manualAdjustment.findMany({ where: { month } }),
  ]);

  return clients.map((client) => {
    const clientOrders = orders.filter(
      (o) => o.clientId === client.id && formatMonth(o.createdAt) === month,
    );
    const ordered = clientOrders.reduce((sum, o) => sum + o.numberOfCreatives, 0);
    const clientAdj = adjustments.filter((a) => a.clientId === client.id);
    const adjTotal = clientAdj.reduce((sum, a) => sum + a.delta, 0);
    const delivered = ordered + adjTotal;
    const target = client.monthlyTarget;
    return {
      clientId: client.id,
      clientName: client.name,
      monthlyTarget: target,
      orderedCount: ordered,
      adjustments: adjTotal,
      deliveredCount: delivered,
      percentOfTarget: target > 0 ? Math.round((delivered / target) * 100) : null,
      adjustmentEntries: clientAdj.map((a) => ({
        id: a.id,
        delta: a.delta,
        note: a.note,
        createdAt: a.createdAt.toISOString(),
      })),
    };
  });
}
