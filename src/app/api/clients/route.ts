import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const ClientSchema = z.object({
  name: z.string().trim().min(1),
  monthlyTarget: z.number().int().nonnegative().optional(),
});

export async function GET() {
  const clients = await prisma.client.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(clients);
}

export async function POST(req: Request) {
  try {
    const payload = ClientSchema.parse(await req.json());
    const client = await prisma.client.upsert({
      where: { name: payload.name },
      update: { monthlyTarget: payload.monthlyTarget ?? undefined },
      create: { name: payload.name, monthlyTarget: payload.monthlyTarget ?? 0 },
    });
    return NextResponse.json(client);
  } catch (err) {
    const message = err instanceof z.ZodError ? err.issues[0]?.message : "Invalid request";
    return NextResponse.json({ error: message ?? "Invalid request" }, { status: 400 });
  }
}
