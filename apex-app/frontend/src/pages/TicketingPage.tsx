import { useEffect, useState } from 'react';
import { api, fmtNumber, fmtPctPlain, fmtCurrencyShort } from '../api/queries';
import type { Tickets, Team } from '../types';

export default function TicketingPage() {
  const [data, setData] = useState<Tickets | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  useEffect(() => {
    api.getTickets().then(setData).catch(() => {});
    api.getTeams().then((r) => setTeams(r.teams)).catch(() => {});
  }, []);

  const noShowSorted = [...teams].sort((a, b) => b.no_show_rate - a.no_show_rate).slice(0, 8);
  const teamById = new Map(teams.map((t) => [t.team_id, t]));

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-8">
        <div className="eyebrow mb-1">VP Ticketing &amp; Fan Engagement</div>
        <h1 className="font-display text-4xl font-extrabold text-[var(--ink-strong)] tracking-tight">Dynamic pricing &amp; no-show desk</h1>
        <p className="mt-2 text-[var(--ink-muted)] max-w-3xl">
          Primary plus secondary ticketing. Season-ticket retention, no-show prediction, and the
          pricing agent's recommendations on the next 20 highest-demand games.
        </p>
      </header>

      {/* Agent header */}
      <section className="mb-8 broadcast-card overflow-hidden">
        <div className="bg-[var(--court-black)] text-white p-5 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="eyebrow-light mb-1">Agent</div>
            <h2 className="font-display text-2xl font-extrabold uppercase tracking-tight">{data?.agent_name ?? 'Apex Ticket Pricing Agent'}</h2>
            <p className="mt-1 text-sm text-white/70">Reads gold.fct_ticket_demand. Writes recommendations back to a Snowflake table the ticketing team reviews.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 min-w-[280px]">
            <Mini label="Decisions · 24h" value={data ? fmtNumber(data.agent_decisions_24h) : '—'} />
            <Mini label="Revenue lift YTD" value={data ? fmtCurrencyShort(data.agent_revenue_lift_ytd_usd) : '—'} />
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <div className="kpi-tile">
          <div className="kpi-label">Season-ticket retention</div>
          <div className="kpi-value">{data ? fmtPctPlain(data.season_ticket_avg_retention, 1) : '—'}</div>
          <div className="mt-1 text-[11px] text-[var(--ink-soft)] stat-mono">League average</div>
        </div>
        <div className="kpi-tile">
          <div className="kpi-label">League no-show rate</div>
          <div className="kpi-value" style={{ color: 'var(--crimson)' }}>{data ? fmtPctPlain(data.league_avg_no_show, 1) : '—'}</div>
          <div className="mt-1 text-[11px] text-[var(--ink-soft)] stat-mono">Tier-3 markets trending higher</div>
        </div>
        <div className="kpi-tile">
          <div className="kpi-label">Pricing recs · live</div>
          <div className="kpi-value">{data?.agent_pricing_recommendations.length ?? '—'}</div>
          <div className="mt-1 text-[11px] text-[var(--ink-soft)] stat-mono">High-confidence only</div>
        </div>
        <div className="kpi-tile">
          <div className="kpi-label">Markets tracked</div>
          <div className="kpi-value">{data?.markets.length ?? '—'}</div>
          <div className="mt-1 text-[11px] text-[var(--ink-soft)] stat-mono">Primary + secondary</div>
        </div>
      </div>

      {/* Agent recommendations */}
      <section className="mb-10">
        <h2 className="font-display text-2xl font-extrabold text-[var(--ink-strong)] border-b border-[var(--hairline)] pb-2 mb-4 uppercase tracking-tight">Live agent recommendations</h2>
        <div className="space-y-3">
          {(data?.agent_pricing_recommendations ?? []).map((rec) => {
            const t = teamById.get(rec.team_id);
            const lift = rec.lift_pct;
            const tone = lift > 0 ? 'bull' : 'bear';
            return (
              <div key={rec.game_id} className="broadcast-card p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`status-pill ${tone}`}>{lift >= 0 ? '+' : ''}{(lift * 100).toFixed(1)}%</span>
                      <span className="font-mono text-[11px] text-[var(--ink-soft)]">{rec.game_id}</span>
                      {t && <span className="font-display text-[12px] font-bold uppercase tracking-wide text-[var(--gold-dim)]">{t.city} {t.name}</span>}
                    </div>
                    <p className="text-sm text-[var(--ink-muted)] leading-relaxed">{rec.rationale}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[10px] font-display font-bold uppercase tracking-wider text-[var(--ink-soft)]">Recommended</div>
                    <div className="scoreboard text-3xl text-[var(--ink-strong)]">${rec.recommended_price.toFixed(0)}</div>
                    <div className="text-[11px] text-[var(--ink-soft)] stat-mono">from ${rec.current_price.toFixed(0)}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Top demand games */}
      <section className="mb-10">
        <h2 className="font-display text-2xl font-extrabold text-[var(--ink-strong)] border-b border-[var(--hairline)] pb-2 mb-4 uppercase tracking-tight">Top 20 highest-demand games</h2>
        <div className="broadcast-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[var(--paper-deep)] text-[10px] font-display font-bold uppercase tracking-wider text-[var(--ink-soft)]">
              <tr>
                <th className="text-left px-4 py-2">Game</th>
                <th className="text-left px-4 py-2">Matchup</th>
                <th className="text-left px-4 py-2">Date</th>
                <th className="text-right px-4 py-2">Demand</th>
                <th className="text-right px-4 py-2">Current avg</th>
                <th className="text-right px-4 py-2">Agent rec</th>
                <th className="text-right px-4 py-2">Expected fill</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--hairline-soft)]">
              {(data?.top_demand_games ?? []).map((g) => (
                <tr key={g.game_id} className="hover:bg-[var(--paper-deep)]">
                  <td className="px-4 py-2 font-mono text-[12px] text-[var(--ink-muted)]">{g.game_id}</td>
                  <td className="px-4 py-2 font-display font-bold uppercase tracking-wide">{g.matchup}</td>
                  <td className="px-4 py-2 stat-mono text-[var(--ink-soft)]">{g.date}</td>
                  <td className="px-4 py-2 text-right stat-mono font-bold">{g.demand_index.toFixed(1)}</td>
                  <td className="px-4 py-2 text-right stat-mono">${g.current_avg_price_usd.toFixed(0)}</td>
                  <td className="px-4 py-2 text-right stat-mono font-bold" style={{ color: 'var(--gold-dim)' }}>${g.agent_recommended_price_usd.toFixed(0)}</td>
                  <td className="px-4 py-2 text-right stat-mono">{Math.round((g.expected_attendance / g.capacity) * 100)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* No-show leaderboard */}
      <section className="mb-10">
        <h2 className="font-display text-2xl font-extrabold text-[var(--ink-strong)] border-b border-[var(--hairline)] pb-2 mb-4 uppercase tracking-tight">No-show watchlist · highest 8 teams</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {noShowSorted.map((t) => (
            <div key={t.team_id} className="broadcast-card p-4">
              <div className="text-[10px] font-display font-bold uppercase tracking-wider text-[var(--ink-soft)]">{t.market}</div>
              <div className="mt-1 font-display text-lg font-extrabold uppercase tracking-tight text-[var(--ink-strong)]">{t.name}</div>
              <div className="scoreboard text-3xl mt-2" style={{ color: 'var(--crimson)' }}>{(t.no_show_rate * 100).toFixed(1)}%</div>
              <div className="mt-1 text-[11px] text-[var(--ink-soft)] stat-mono">No-show · season-to-date</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-sm px-3 py-2">
      <div className="text-[10px] font-display font-bold uppercase tracking-wider text-white/60">{label}</div>
      <div className="mt-0.5 scoreboard text-xl text-[var(--gold)]">{value}</div>
    </div>
  );
}
