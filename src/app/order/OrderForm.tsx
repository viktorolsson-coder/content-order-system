"use client";

import { useMemo, useState } from "react";
import { CONTENT_TYPES, TYPE_LABELS, type ContentType } from "@/lib/types";

type ClientOption = { id: string; name: string };

type Status =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success"; taskUrl?: string; taskName: string }
  | { kind: "error"; message: string };

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function currentMonthName(): string {
  return MONTHS[new Date().getMonth()];
}

function buildTaskName(clientName: string, type: ContentType | "", month: string): string {
  if (!clientName || !type || !month) return "";
  return `${clientName} - ${TYPE_LABELS[type]} - ${month}`;
}

export function OrderForm({ clients }: { clients: ClientOption[] }) {
  const [clientId, setClientId] = useState<string>("");
  const [newClientName, setNewClientName] = useState("");
  const [type, setType] = useState<ContentType | "">("");
  const [month, setMonth] = useState<string>(currentMonthName());
  const [briefLink, setBriefLink] = useState("");
  const [contentLink, setContentLink] = useState("");
  const [generalDescription, setGeneralDescription] = useState("");
  const [numberOfCreatives, setNumberOfCreatives] = useState<number>(1);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const selectedClientName = useMemo(() => {
    if (clientId === "__new__") return newClientName.trim();
    return clients.find((c) => c.id === clientId)?.name ?? "";
  }, [clientId, newClientName, clients]);

  const taskName = buildTaskName(selectedClientName, type, month);
  const deadlineDays = type === "staticAds" ? 3 : 5;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!type || !selectedClientName) return;

    setStatus({ kind: "submitting" });
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: clientId === "__new__" ? null : clientId,
          newClientName: clientId === "__new__" ? newClientName.trim() : null,
          type,
          month,
          briefLink,
          contentLink: contentLink || null,
          generalDescription,
          numberOfCreatives: Number(numberOfCreatives),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error ?? "Failed to create order");
      }

      setStatus({
        kind: "success",
        taskUrl: data.asanaTaskUrl,
        taskName: data.taskName,
      });
      // reset content fields, keep client/type/month for speed
      setBriefLink("");
      setContentLink("");
      setGeneralDescription("");
      setNumberOfCreatives(1);
    } catch (err) {
      setStatus({
        kind: "error",
        message: err instanceof Error ? err.message : "Something went wrong",
      });
    }
  }

  const submitting = status.kind === "submitting";

  return (
    <form onSubmit={onSubmit} className="space-y-6 bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="field-label">Client</label>
          <select
            className="field-input"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            required
          >
            <option value="">Select a client…</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
            <option value="__new__">+ Add new client…</option>
          </select>
          {clientId === "__new__" && (
            <input
              type="text"
              className="field-input mt-2"
              placeholder="New client name"
              value={newClientName}
              onChange={(e) => setNewClientName(e.target.value)}
              required
            />
          )}
        </div>

        <div>
          <label className="field-label">Type</label>
          <select
            className="field-input"
            value={type}
            onChange={(e) => setType(e.target.value as ContentType)}
            required
          >
            <option value="">Select a type…</option>
            {CONTENT_TYPES.map((t) => (
              <option key={t} value={t}>{TYPE_LABELS[t]}</option>
            ))}
          </select>
          {type && (
            <p className="field-hint">
              Deadline will be set to {deadlineDays} days from today.
            </p>
          )}
        </div>

        <div>
          <label className="field-label">Month</label>
          <select
            className="field-input"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            required
          >
            {MONTHS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="field-label">Number of creatives</label>
          <input
            type="number"
            min={1}
            className="field-input"
            value={numberOfCreatives}
            onChange={(e) => setNumberOfCreatives(Number(e.target.value))}
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className="field-label">Task name (auto)</label>
          <input type="text" className="field-input bg-slate-50" value={taskName} disabled />
          <p className="field-hint">Format: clientName - type - month</p>
        </div>

        <div>
          <label className="field-label">Brief link</label>
          <input
            type="url"
            className="field-input"
            placeholder="https://…"
            value={briefLink}
            onChange={(e) => setBriefLink(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="field-label">Content link (optional)</label>
          <input
            type="url"
            className="field-input"
            placeholder="https://…"
            value={contentLink}
            onChange={(e) => setContentLink(e.target.value)}
          />
        </div>

        <div className="md:col-span-2">
          <label className="field-label">General description</label>
          <textarea
            className="field-input min-h-[120px]"
            value={generalDescription}
            onChange={(e) => setGeneralDescription(e.target.value)}
            required
          />
        </div>
      </div>

      {status.kind === "error" && (
        <div className="rounded border border-red-200 bg-red-50 text-red-800 text-sm p-3">
          {status.message}
        </div>
      )}
      {status.kind === "success" && (
        <div className="rounded border border-green-200 bg-green-50 text-green-800 text-sm p-3">
          Order created: <strong>{status.taskName}</strong>.
          {status.taskUrl && (
            <>
              {" "}
              <a className="underline" href={status.taskUrl} target="_blank" rel="noreferrer">
                Open in Asana
              </a>.
            </>
          )}
        </div>
      )}

      <div className="flex justify-end">
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? "Creating task…" : "Create order"}
        </button>
      </div>
    </form>
  );
}
