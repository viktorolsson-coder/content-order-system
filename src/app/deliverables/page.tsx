import Link from "next/link";
import { getDeliverablesForMonth } from "@/lib/deliverables";
import { currentMonthKey } from "@/lib/deadline";
import { DeliverablesTable } from "./DeliverablesTable";

export const dynamic = "force-dynamic";

function monthOptions(): string[] {
  const now = new Date();
  const out: string[] = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, "0");
    out.push(`${y}-${m}`);
  }
  return out;
}

function formatMonthLabel(key: string): string {
  const [y, m] = key.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1, 1));
  return d.toLocaleString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
}

export default async function DeliverablesPage({
  searchParams,
}: {
  searchParams?: { month?: string };
}) {
  const months = monthOptions();
  const month = searchParams?.month && months.includes(searchParams.month)
    ? searchParams.month
    : currentMonthKey();
  const rows = await getDeliverablesForMonth(month);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Deliverables</h1>
          <p className="text-sm text-slate-600 mt-1">
            Delivered = creatives from orders placed this month + manual adjustments.
          </p>
        </div>
        <form className="flex items-center gap-2">
          <label className="text-sm text-slate-600">Month</label>
          <select
            name="month"
            defaultValue={month}
            className="field-input"
            style={{ minWidth: 180 }}
          >
            {months.map((m) => (
              <option key={m} value={m}>{formatMonthLabel(m)}</option>
            ))}
          </select>
          <button type="submit" className="btn-secondary">View</button>
        </form>
      </div>

      {rows.length === 0 ? (
        <div className="rounded border border-slate-200 bg-white p-6 text-sm text-slate-600">
          No clients yet. <Link href="/clients" className="underline">Add your first client</Link>.
        </div>
      ) : (
        <DeliverablesTable rows={rows} month={month} />
      )}
    </div>
  );
}
