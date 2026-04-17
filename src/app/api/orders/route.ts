import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { CONTENT_TYPES, TYPE_LABELS } from "@/lib/types";
import { deadlineForType } from "@/lib/deadline";
import { AsanaApiError, AsanaConfigError, createAsanaTask } from "@/lib/asana";

const OrderSchema = z
  .object({
    clientId: z.string().min(1).nullable(),
    newClientName: z.string().trim().min(1).nullable(),
    type: z.enum(CONTENT_TYPES),
    month: z.string().min(3),
    briefLink: z.string().url(),
    contentLink: z.string().url().nullable().optional(),
    generalDescription: z.string().trim().min(1),
    numberOfCreatives: z.number().int().positive(),
  })
  .refine((data) => data.clientId || data.newClientName, {
    message: "Provide an existing clientId or a newClientName",
    path: ["clientId"],
  });

export async function POST(req: Request) {
  let payload: z.infer<typeof OrderSchema>;
  try {
    const json = await req.json();
    payload = OrderSchema.parse(json);
  } catch (err) {
    const message = err instanceof z.ZodError ? err.issues[0]?.message : "Invalid request body";
    return NextResponse.json({ error: message ?? "Invalid request body" }, { status: 400 });
  }

  const client = payload.clientId
    ? await prisma.client.findUnique({ where: { id: payload.clientId } })
    : await prisma.client.upsert({
        where: { name: payload.newClientName! },
        update: {},
        create: { name: payload.newClientName! },
      });

  if (!client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  const taskName = `${client.name} - ${TYPE_LABELS[payload.type]} - ${payload.month}`;
  const deadline = deadlineForType(payload.type);

  let asanaTaskGid: string | null = null;
  let asanaTaskUrl: string | null = null;
  try {
    const result = await createAsanaTask({
      taskName,
      clientName: client.name,
      type: payload.type,
      briefLink: payload.briefLink,
      contentLink: payload.contentLink ?? null,
      generalDescription: payload.generalDescription,
      numberOfCreatives: payload.numberOfCreatives,
      deadline,
    });
    asanaTaskGid = result.gid;
    asanaTaskUrl = result.permalinkUrl ?? null;
  } catch (err) {
    if (err instanceof AsanaConfigError) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    if (err instanceof AsanaApiError) {
      return NextResponse.json(
        { error: `Asana error: ${err.message}`, details: err.body },
        { status: 502 },
      );
    }
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: `Failed to create Asana task: ${message}` }, { status: 500 });
  }

  const order = await prisma.order.create({
    data: {
      clientId: client.id,
      taskName,
      type: payload.type,
      briefLink: payload.briefLink,
      contentLink: payload.contentLink ?? null,
      generalDescription: payload.generalDescription,
      numberOfCreatives: payload.numberOfCreatives,
      deadline,
      asanaTaskGid,
      asanaTaskUrl,
    },
  });

  return NextResponse.json({
    id: order.id,
    taskName,
    deadline: deadline.toISOString(),
    asanaTaskGid,
    asanaTaskUrl,
  });
}
