import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-bold">Content Order System</h1>
        <p className="mt-2 text-slate-600">
          Order content from the Content Team and track monthly deliverables per client.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Link
          href="/order"
          className="block rounded-lg border border-slate-200 bg-white p-6 hover:border-brand-500 hover:shadow-sm transition"
        >
          <h2 className="font-semibold text-lg">Place an order</h2>
          <p className="mt-1 text-sm text-slate-600">
            Submit a new content request. An Asana task is created in the Content Team project
            with a deadline 5 days out (3 days for static ads).
          </p>
        </Link>

        <Link
          href="/deliverables"
          className="block rounded-lg border border-slate-200 bg-white p-6 hover:border-brand-500 hover:shadow-sm transition"
        >
          <h2 className="font-semibold text-lg">Deliverables tracker</h2>
          <p className="mt-1 text-sm text-slate-600">
            See how many creatives each client has received this month, add manual adjustments,
            and check against monthly targets.
          </p>
        </Link>
      </section>
    </div>
  );
}
