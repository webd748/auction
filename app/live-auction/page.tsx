'use client';

import { createClient } from '@supabase/supabase-js';
import { useEffect, useMemo, useState } from 'react';

type AuctionRow = {
  id: string;
  status: 'Live' | 'Closed';
  started_at: string;
  current_bid: number | null;
  starting_price: number;
  player: {
    id: string;
    name: string;
    role: string;
    base_price: number;
    photo_url: string | null;
  } | null;
  current_team: {
    id: string;
    name: string;
  } | null;
};

type BidRow = {
  id: string;
  bid_amount: number;
  bid_time: string;
  team: {
    id: string;
    name: string;
  } | null;
};

type TeamPurseRow = {
  id: string;
  name: string;
  purse_remaining: number;
};

function formatCurrency(amount: number) {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export default function LiveAuctionPage() {
  const [auction, setAuction] = useState<AuctionRow | null>(null);
  const [bids, setBids] = useState<BidRow[]>([]);
  const [teamPurse, setTeamPurse] = useState<TeamPurseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      setError('Supabase environment variables are missing.');
      setLoading(false);
      return;
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    async function fetchLiveAuctionData() {
      const { data: liveAuctionData, error: liveAuctionError } = await supabase
        .from('auctions')
        .select(
          `
            id,
            status,
            started_at,
            current_bid,
            starting_price,
            player:players(id, name, role, base_price, photo_url),
            current_team:teams!auctions_current_team_id_fkey(id, name)
          `
        )
        .eq('status', 'Live')
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (liveAuctionError) {
        throw liveAuctionError;
      }

      const selectedAuction = (liveAuctionData as AuctionRow | null) ?? null;

      if (!selectedAuction) {
        return {
          auction: null,
          bids: [],
          teamPurse: []
        };
      }

      const [{ data: bidsData, error: bidsError }, { data: purseData, error: purseError }] = await Promise.all([
        supabase
          .from('bids')
          .select('id, bid_amount, bid_time, team:teams(id, name)')
          .eq('auction_id', selectedAuction.id)
          .order('bid_time', { ascending: false })
          .limit(10),
        supabase.from('teams').select('id, name, purse_remaining').order('name', { ascending: true })
      ]);

      if (bidsError) {
        throw bidsError;
      }

      if (purseError) {
        throw purseError;
      }

      return {
        auction: selectedAuction,
        bids: (bidsData as BidRow[]) ?? [],
        teamPurse: (purseData as TeamPurseRow[]) ?? []
      };
    }

    async function syncLiveAuctionData() {
      try {
        if (isMounted) {
          setError(null);
        }

        const nextState = await fetchLiveAuctionData();

        if (isMounted) {
          setAuction(nextState.auction);
          setBids(nextState.bids);
          setTeamPurse(nextState.teamPurse);
        }
      } catch (fetchError) {
        if (isMounted) {
          setError(fetchError instanceof Error ? fetchError.message : 'Failed to load live auction data.');
          setAuction(null);
          setBids([]);
          setTeamPurse([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void syncLiveAuctionData();

    const realtimeChannel = supabase
      .channel('live-auction-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bids' },
        () => {
          void syncLiveAuctionData();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'auctions' },
        () => {
          void syncLiveAuctionData();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'teams' },
        () => {
          void syncLiveAuctionData();
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      void supabase.removeChannel(realtimeChannel);
    };
  }, []);

  const currentBidAmount = useMemo(() => {
    if (!auction) {
      return 0;
    }

    return auction.current_bid ?? auction.starting_price;
  }, [auction]);

  if (loading) {
    return <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">Loading live auction...</div>;
  }

  if (error) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 shadow-sm">
        Unable to load live auction data: {error}
      </div>
    );
  }

  if (!auction || !auction.player) {
    return <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">No live auction is active right now.</div>;
  }

  return (
    <section className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <div className="flex flex-col gap-5 sm:flex-row">
            <div className="flex h-44 w-full items-center justify-center rounded-lg bg-slate-100 text-sm text-slate-500 sm:h-48 sm:w-40">
              {auction.player.photo_url ? 'Photo' : 'Player Photo'}
            </div>
            <div className="flex-1 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Current Player</p>
              <h2 className="text-2xl font-bold text-slate-900">{auction.player.name}</h2>
              <div className="flex flex-wrap gap-2 text-sm text-slate-700">
                <span className="rounded-full bg-slate-100 px-3 py-1">Role: {auction.player.role}</span>
                <span className="rounded-full bg-slate-100 px-3 py-1">Base Price: {formatCurrency(auction.player.base_price)}</span>
              </div>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">Current Bid</p>
                <p className="mt-1 text-4xl font-extrabold text-emerald-700">{formatCurrency(currentBidAmount)}</p>
                <p className="mt-1 text-sm text-emerald-900">Leading Team: {auction.current_team?.name ?? 'No bids yet'}</p>
              </div>
            </div>
          </div>
        </article>

        <aside className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Team Purse Summary</h3>
          <ul className="mt-4 space-y-3">
            {teamPurse.map((item) => (
              <li key={item.id} className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2">
                <span className="text-sm font-medium text-slate-700">{item.name}</span>
                <span className="text-sm font-semibold text-slate-900">{formatCurrency(item.purse_remaining)}</span>
              </li>
            ))}
          </ul>
        </aside>
      </div>

      <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Bid History</h3>
        {bids.length === 0 ? (
          <p className="mt-4 text-sm text-slate-600">No bids placed yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-slate-200">
            {bids.map((bid) => (
              <li key={bid.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <p className="text-sm font-medium text-slate-700">{bid.team?.name ?? 'Unknown Team'}</p>
                <div className="flex items-center gap-3">
                  <span className="text-base font-semibold text-emerald-700">{formatCurrency(bid.bid_amount)}</span>
                  <span className="text-xs text-slate-500">{new Date(bid.bid_time).toLocaleTimeString('en-IN')}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </article>
    </section>
  );
}
