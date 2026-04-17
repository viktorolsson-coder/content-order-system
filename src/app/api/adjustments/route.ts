import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const AdjustmentSchema = z.object({
  clientId: z.string().min(1),
  month: z.string().regex(/^\d{4}-\d{2}$/, "month must be YYYY-MM"),
  delta: z.number().int(),
  note: z.string().max(500).optional().nullable(),
});

export async function POST(req: Request) {
  try {
    const payload = AdjustmentSchema.parse(await req.json());
    const adj = await prisma.manualAdjustment.create({
      data: {
        clientId: payload.clientId,
        month: payload.month,
        delta: payload.delta,
        note: payload.note ?? null,
      },
    });
    return NextResponse.json(adj);
  } catch (err) {
    const message = err instanceof z.ZodError ? err.issues[0]?.message : "Invalid request";
    return NextResponse.json({ error: message ?? "Invalid request" }, { status: 400 });
  }
}
