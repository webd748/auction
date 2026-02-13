import Link from 'next/link';

export default function HomePage() {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-semibold text-slate-900">Welcome</h2>
      <p className="mt-2 text-slate-600">
        Choose a section to continue building the Cricket Auction Dashboard.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Link
          href="/live-auction"
          className="rounded-md border border-emerald-600 bg-emerald-600 px-4 py-2 text-sm font-medium text-white"
        >
          Go to Live Auction
        </Link>
      </div>
    </section>
  );
}
