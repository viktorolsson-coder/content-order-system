import { TYPE_LABELS, type ContentType } from "./types";

export interface AsanaTaskInput {
  taskName: string;
  clientName: string;
  type: ContentType;
  briefLink: string;
  contentLink?: string | null;
  generalDescription: string;
  numberOfCreatives: number;
  deadline: Date; // due date
}

export interface AsanaTaskResult {
  gid: string;
  permalinkUrl?: string;
}

export class AsanaConfigError extends Error {}
export class AsanaApiError extends Error {
  constructor(message: string, public status: number, public body: unknown) {
    super(message);
  }
}

function buildNotes(input: AsanaTaskInput): string {
  const lines = [
    `Client: ${input.clientName}`,
    `Type: ${TYPE_LABELS[input.type]}`,
    `Number of creatives: ${input.numberOfCreatives}`,
    `Brief: ${input.briefLink}`,
  ];
  if (input.contentLink) lines.push(`Existing content: ${input.contentLink}`);
  lines.push("", "Description:", input.generalDescription);
  return lines.join("\n");
}

function toDueOn(date: Date): string {
  // Asana "due_on" expects YYYY-MM-DD (no time).
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export async function createAsanaTask(input: AsanaTaskInput): Promise<AsanaTaskResult> {
  const token = process.env.ASANA_ACCESS_TOKEN;
  const projectGid = process.env.ASANA_PROJECT_GID;

  if (!token || !projectGid) {
    throw new AsanaConfigError(
      "Asana is not configured. Set ASANA_ACCESS_TOKEN and ASANA_PROJECT_GID in your environment.",
    );
  }

  const body: Record<string, unknown> = {
    data: {
      name: input.taskName,
      notes: buildNotes(input),
      due_on: toDueOn(input.deadline),
      projects: [projectGid],
    },
  };

  if (process.env.ASANA_WORKSPACE_GID) {
    (body.data as Record<string, unknown>).workspace = process.env.ASANA_WORKSPACE_GID;
  }

  const res = await fetch("https://app.asana.com/api/1.0/tasks?opt_fields=gid,permalink_url", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  let parsed: unknown = null;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch {
    parsed = text;
  }

  if (!res.ok) {
    throw new AsanaApiError(
      `Asana request failed with status ${res.status}`,
      res.status,
      parsed,
    );
  }

  const data = (parsed as { data?: { gid?: string; permalink_url?: string } })?.data;
  if (!data?.gid) {
    throw new AsanaApiError("Asana response missing task gid", res.status, parsed);
  }

  return { gid: data.gid, permalinkUrl: data.permalink_url };
}
