import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const UpdateSchema = z.object({
  name: z.string().trim().min(1).optional(),
  monthlyTarget: z.number().int().nonnegative().optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const payload = UpdateSchema.parse(await req.json());
    const client = await prisma.client.update({
      where: { id: params.id },
      data: payload,
    });
    return NextResponse.json(client);
  } catch (err) {
    const message = err instanceof z.ZodError ? err.issues[0]?.message : "Invalid request";
    return NextResponse.json({ error: message ?? "Invalid request" }, { status: 400 });
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  await prisma.client.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
