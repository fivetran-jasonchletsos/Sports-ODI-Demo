import { useEffect, useState } from 'react';
import { api, fmtNumberShort } from '../api/queries';
import type { PlayerPerf } from '../types';

const STATUS_TONE: Record<string, 'bull' | 'caution' | 'bear' | 'neutral'> = {
  healthy: 'bull', questionable: 'caution', 'day-to-day': 'caution', out: 'bear',
};

export default function PlayerPerfPage() {
  const [data, setData] = useState<PlayerPerf | null>(null);
  useEffect(() => { api.getPlayerPerf().then(setData).catch(() => {}); }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-8">
        <div className="eyebrow mb-1">Player performance · ApexTrack optical (synthetic)</div>
        <h1 className="font-display text-4xl font-extrabold text-[var(--ink-strong)] tracking-tight">612 players. 250k data points per game.</h1>
        <p className="mt-2 text-[var(--ink-muted)] max-w-3xl">
          Top 50 players by APEX (advanced synthetic metric), injury list, biometric trend signals,
          and the load-management agent recommending rest days. All anonymized; all synthetic.
        </p>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <Kpi label="Players tracked" value={data ? fmtNumberShort(data.players_tracked) : '—'} sub="ApexTrack optical" />
        <Kpi label="Data points / player / game" value={data ? fmtNumberShort(data.data_points_per_player_per_game) : '—'} sub="x,y,z + biometric" />
        <Kpi label="Injury list" value={data ? `${data.injury_list_count}` : '—'} sub="active questionable or out" />
        <Kpi label="Rest recs · 24h" value={data ? `${data.load_management_agent.rest_recommendations_24h}` : '—'} sub="load-management agent" />
      </div>

      {/* Load management agent recs */}
      <section className="mb-10">
        <h2 className="font-display text-2xl font-extrabold text-[var(--ink-strong)] border-b border-[var(--hairline)] pb-2 mb-4 uppercase tracking-tight">{data?.load_management_agent.name ?? 'Load-management agent'}</h2>
        <div className="space-y-3">
          {(data?.load_management_agent.recommendations ?? []).map((rec) => (
            <div key={rec.player_id} className="broadcast-card p-5">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="status-pill gold">{rec.rest_days_recommended} day{rec.rest_days_recommended === 1 ? '' : 's'} rest</span>
                    <span className="font-display font-bold uppercase tracking-wide text-[var(--ink-strong)]">{rec.name}</span>
                    <span className="text-[11px] font-display font-bold uppercase tracking-wider text-[var(--gold-dim)]">{rec.team_id}</span>
                  </div>
                  <p className="text-sm text-[var(--ink-muted)] leading-relaxed">{rec.rationale}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Top 50 leaderboard */}
      <section className="mb-10">
        <h2 className="font-display text-2xl font-extrabold text-[var(--ink-strong)] border-b border-[var(--hairline)] pb-2 mb-4 uppercase tracking-tight">Top 50 · APEX metric</h2>
        <div className="broadcast-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[var(--court-black)] text-white text-[10px] font-display font-bold uppercase tracking-wider">
              <tr>
                <th className="text-right px-3 py-2">#</th>
                <th className="text-left px-3 py-2">Player</th>
                <th className="text-left px-3 py-2">Team</th>
                <th className="text-left px-3 py-2">Pos</th>
                <th className="text-right px-3 py-2">APEX</th>
                <th className="text-right px-3 py-2">Min</th>
                <th className="text-right px-3 py-2">Load</th>
                <th className="text-left px-3 py-2">Biometric</th>
                <th className="text-left px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--hairline-soft)]">
              {(data?.top_50 ?? []).map((p) => {
                const tone = STATUS_TONE[p.injury_status] ?? 'neutral';
                return (
                  <tr key={p.player_id} className="hover:bg-[var(--paper-deep)]">
                    <td className="px-3 py-2 text-right scoreboard text-[var(--gold-dim)]">{p.apex_metric_rank}</td>
                    <td className="px-3 py-2 font-display font-bold uppercase tracking-wide">{p.name}</td>
                    <td className="px-3 py-2 stat-mono text-[var(--ink-muted)]">{p.team_name}</td>
                    <td className="px-3 py-2 stat-mono">{p.position}</td>
                    <td className="px-3 py-2 text-right scoreboard text-lg text-[var(--ink-strong)]">{p.apex_metric.toFixed(1)}</td>
                    <td className="px-3 py-2 text-right stat-mono">{p.minutes_played}</td>
                    <td className="px-3 py-2 text-right stat-mono" style={{ color: p.load_index > 0.85 ? 'var(--crimson)' : p.load_index > 0.7 ? 'var(--caution)' : 'var(--ink)' }}>
                      {(p.load_index * 100).toFixed(0)}
                    </td>
                    <td className="px-3 py-2 text-[11px] text-[var(--ink-muted)]">{p.biometric_trend}</td>
                    <td className="px-3 py-2"><span className={`status-pill ${tone}`}>{p.injury_status}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Kpi({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="kpi-tile">
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      <div className="mt-1 text-[11px] text-[var(--ink-soft)] stat-mono">{sub}</div>
    </div>
  );
}
