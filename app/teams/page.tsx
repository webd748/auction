const teams = [
  { name: 'Mumbai Meteors', purse: '₹9.4 Cr', players: 16 },
  { name: 'Delhi Strikers', purse: '₹8.8 Cr', players: 15 },
  { name: 'Chennai Chargers', purse: '₹10.1 Cr', players: 14 },
  { name: 'Bengal Tigers', purse: '₹7.9 Cr', players: 17 },
  { name: 'Hyderabad Hawks', purse: '₹9.0 Cr', players: 16 },
  { name: 'Punjab Panthers', purse: '₹8.3 Cr', players: 15 }
];

export default function TeamsPage() {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Teams</h2>
        <p className="mt-1 text-sm text-slate-600">Overview of all teams participating in the auction.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {teams.map((team) => (
          <article key={team.name} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-500">
                Logo
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{team.name}</h3>
                <p className="text-sm text-slate-500">Team Card</p>
              </div>
            </div>

            <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-md bg-slate-50 px-3 py-2">
                <dt className="text-slate-500">Remaining Purse</dt>
                <dd className="mt-1 font-semibold text-slate-900">{team.purse}</dd>
              </div>
              <div className="rounded-md bg-slate-50 px-3 py-2">
                <dt className="text-slate-500">Players Count</dt>
                <dd className="mt-1 font-semibold text-slate-900">{team.players}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}
