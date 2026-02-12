'use client';

import { createClient } from '@supabase/supabase-js';
import { useEffect, useMemo, useState } from 'react';

type PlayerStatus = 'Available' | 'Sold' | 'Unsold';

type Player = {
  id: string;
  name: string;
  role: string;
  base_price: number;
  status: PlayerStatus;
  photo_url: string | null;
};

const roles = ['All Roles', 'Batter', 'Bowler', 'All-Rounder', 'Wicketkeeper'];

export default function PlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('All Roles');

  useEffect(() => {
    let isMounted = true;

    async function loadPlayers() {
      try {
        setLoading(true);
        setError(null);

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseAnonKey) {
          throw new Error('Supabase environment variables are missing.');
        }

        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        const { data, error: queryError } = await supabase
          .from('players')
          .select('id, name, role, base_price, status, photo_url')
          .order('name', { ascending: true });

        if (queryError) {
          throw queryError;
        }

        if (isMounted) {
          setPlayers((data as Player[]) ?? []);
        }
      } catch (fetchError) {
        if (isMounted) {
          setError(fetchError instanceof Error ? fetchError.message : 'Failed to load players.');
          setPlayers([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void loadPlayers();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredPlayers = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return players.filter((player) => {
      const matchesSearch = player.name.toLowerCase().includes(normalizedSearch);
      const matchesRole = selectedRole === 'All Roles' || player.role === selectedRole;
      return matchesSearch && matchesRole;
    });
  }, [players, searchTerm, selectedRole]);

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Players</h2>
        <p className="mt-1 text-sm text-slate-600">Players loaded from Supabase with search and role filtering.</p>
      </div>

      <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-[2fr_1fr]">
        <label className="flex flex-col gap-1 text-sm text-slate-700">
          Search
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            type="text"
            placeholder="Search by player name"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-emerald-500 focus:ring-2"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-slate-700">
          Role
          <select
            value={selectedRole}
            onChange={(event) => setSelectedRole(event.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-emerald-500 focus:ring-2"
          >
            {roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </label>
      </div>

      {loading && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">Loading players...</div>
      )}

      {!loading && error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 shadow-sm">
          Unable to load players: {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {filteredPlayers.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
              No players found for the selected filters.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredPlayers.map((player) => (
                <article key={player.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-500">
                      Photo
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-lg font-semibold text-slate-900">{player.name}</h3>
                      <p className="text-sm text-slate-600">{player.role}</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">{player.status}</span>
                  </div>

                  <div className="mt-4 rounded-md bg-slate-50 px-3 py-2">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Base Price</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">₹{player.base_price.toLocaleString('en-IN')}</p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
