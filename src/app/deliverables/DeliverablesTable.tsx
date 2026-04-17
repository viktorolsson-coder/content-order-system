"use client";

import { Fragment, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { DeliverableRow } from "@/lib/deliverables";

export function DeliverablesTable({
  rows,
  month,
}: {
  rows: DeliverableRow[];
  month: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [adjustments, setAdjustments] = useState<Record<string, { delta: string; note: string }>>({});
  const [error, setError] = useState<string | null>(null);

  function updateAdj(clientId: string, patch: Partial<{ delta: string; note: string }>) {
    setAdjustments((prev) => {
      const existing = prev[clientId] ?? { delta: "", note: "" };
      return { ...prev, [clientId]: { ...existing, ...patch } };
    });
  }

  async function submitAdjustment(clientId: string) {
    const entry = adjustments[clientId];
    const delta = Number(entry?.delta);
    if (!Number.isFinite(delta) || delta === 0) {
      setError("Enter a non-zero adjustment amount (e.g. 2 or -1).");
      return;
    }
    setError(null);
    const res = await fetch("/api/adjustments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId,
        month,
        delta,
        note: entry?.note ?? null,
      }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data?.error ?? "Failed to save adjustment");
      return;
    }
    setAdjustments((prev) => ({ ...prev, [clientId]: { delta: "", note: "" } }));
    startTransition(() => router.refresh());
  }

  async function removeAdjustment(id: string) {
    const res = await fetch(`/api/adjustments/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setError("Failed to remove adjustment");
      return;
    }
    startTransition(() => router.refresh());
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded border border-red-200 bg-red-50 text-red-800 text-sm p-3">{error}</div>
      )}
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="text-left px-4 py-2 font-medium">Client</th>
              <th className="text-right px-4 py-2 font-medium">Ordered</th>
              <th className="text-right px-4 py-2 font-medium">Adjustments</th>
              <th className="text-right px-4 py-2 font-medium">Delivered</th>
              <th className="text-right px-4 py-2 font-medium">Target</th>
              <th className="text-right px-4 py-2 font-medium">Progress</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => {
              const isOpen = expanded === row.clientId;
              const pct = row.percentOfTarget ?? 0;
              const barColor =
                pct >= 100 ? "bg-green-500" : pct >= 60 ? "bg-amber-500" : "bg-red-500";
              return (
                <Fragment key={row.clientId}>
                  <tr className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{row.clientName}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{row.orderedCount}</td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {row.adjustments > 0 ? `+${row.adjustments}` : row.adjustments}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums font-semibold">{row.deliveredCount}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{row.monthlyTarget || "—"}</td>
                    <td className="px-4 py-3 text-right tabular-nums w-40">
                      {row.monthlyTarget > 0 ? (
                        <div className="flex items-center gap-2 justify-end">
                          <div className="h-2 w-20 rounded bg-slate-200 overflow-hidden">
                            <div
                              className={`h-full ${barColor}`}
                              style={{ width: `${Math.min(100, pct)}%` }}
                            />
                          </div>
                          <span className="w-10 text-right">{pct}%</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setExpanded(isOpen ? null : row.clientId)}
                        className="text-brand-600 hover:text-brand-700 text-sm font-medium"
                      >
                        {isOpen ? "Close" : "Adjust"}
                      </button>
                    </td>
                  </tr>
                  {isOpen && (
                    <tr className="bg-slate-50">
                      <td colSpan={7} className="px-4 py-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <h3 className="font-semibold text-sm mb-2">Add manual adjustment</h3>
                            <div className="flex gap-2 items-start">
                              <input
                                type="number"
                                placeholder="±#"
                                className="field-input w-24"
                                value={adjustments[row.clientId]?.delta ?? ""}
                                onChange={(e) =>
                                  updateAdj(row.clientId, { delta: e.target.value })
                                }
                              />
                              <input
                                type="text"
                                placeholder="Note (optional)"
                                className="field-input flex-1"
                                value={adjustments[row.clientId]?.note ?? ""}
                                onChange={(e) =>
                                  updateAdj(row.clientId, { note: e.target.value })
                                }
                              />
                              <button
                                className="btn-primary"
                                onClick={() => submitAdjustment(row.clientId)}
                                disabled={isPending}
                              >
                                Add
                              </button>
                            </div>
                            <p className="field-hint">
                              Use negative numbers to subtract (e.g. something was miscounted).
                            </p>
                          </div>
                          <div>
                            <h3 className="font-semibold text-sm mb-2">Adjustments this month</h3>
                            {row.adjustmentEntries.length === 0 ? (
                              <p className="text-sm text-slate-500">No adjustments yet.</p>
                            ) : (
                              <ul className="space-y-1 text-sm">
                                {row.adjustmentEntries.map((a) => (
                                  <li key={a.id} className="flex items-center justify-between">
                                    <span>
                                      <span className="font-medium tabular-nums">
                                        {a.delta > 0 ? `+${a.delta}` : a.delta}
                                      </span>
                                      {a.note && <span className="text-slate-500"> — {a.note}</span>}
                                    </span>
                                    <button
                                      className="text-xs text-slate-500 hover:text-red-600"
                                      onClick={() => removeAdjustment(a.id)}
                                    >
                                      Remove
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
