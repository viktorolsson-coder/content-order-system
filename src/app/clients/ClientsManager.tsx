"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type Client = { id: string; name: string; monthlyTarget: number };

export function ClientsManager({ initialClients }: { initialClients: Client[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [newName, setNewName] = useState("");
  const [newTarget, setNewTarget] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  async function addClient(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim(), monthlyTarget: newTarget }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data?.error ?? "Failed to add client");
      return;
    }
    const created: Client = await res.json();
    setClients((prev) => {
      const existing = prev.find((c) => c.id === created.id);
      if (existing) return prev.map((c) => (c.id === created.id ? created : c));
      return [...prev, created].sort((a, b) => a.name.localeCompare(b.name));
    });
    setNewName("");
    setNewTarget(0);
    startTransition(() => router.refresh());
  }

  async function updateTarget(id: string, target: number) {
    const res = await fetch(`/api/clients/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ monthlyTarget: target }),
    });
    if (!res.ok) {
      setError("Failed to update target");
      return;
    }
    setClients((prev) => prev.map((c) => (c.id === id ? { ...c, monthlyTarget: target } : c)));
  }

  async function removeClient(id: string) {
    if (!confirm("Delete this client and all their orders?")) return;
    const res = await fetch(`/api/clients/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setError("Failed to delete client");
      return;
    }
    setClients((prev) => prev.filter((c) => c.id !== id));
    startTransition(() => router.refresh());
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded border border-red-200 bg-red-50 text-red-800 text-sm p-3">{error}</div>
      )}

      <form
        onSubmit={addClient}
        className="flex flex-wrap items-end gap-3 bg-white rounded-lg border border-slate-200 p-4 shadow-sm"
      >
        <div className="flex-1 min-w-[200px]">
          <label className="field-label">New client name</label>
          <input
            type="text"
            required
            className="field-input"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
        </div>
        <div className="w-40">
          <label className="field-label">Monthly target</label>
          <input
            type="number"
            min={0}
            className="field-input"
            value={newTarget}
            onChange={(e) => setNewTarget(Number(e.target.value))}
          />
        </div>
        <button type="submit" className="btn-primary" disabled={isPending}>
          Add client
        </button>
      </form>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="text-left px-4 py-2 font-medium">Client</th>
              <th className="text-right px-4 py-2 font-medium">Monthly target</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {clients.map((c) => (
              <tr key={c.id}>
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3 text-right">
                  <input
                    type="number"
                    min={0}
                    className="field-input w-24 text-right"
                    defaultValue={c.monthlyTarget}
                    onBlur={(e) => {
                      const next = Number(e.target.value);
                      if (next !== c.monthlyTarget) updateTarget(c.id, next);
                    }}
                  />
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    className="text-sm text-slate-500 hover:text-red-600"
                    onClick={() => removeClient(c.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {clients.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-slate-500">
                  No clients yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
