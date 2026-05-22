import { useEffect, useState } from 'react';
import { api, fmtCurrencyShort, fmtNumber, fmtPctPlain } from '../api/queries';
import type { Sportsbook } from '../types';

const SEV_TONE: Record<string, 'bear' | 'caution' | 'neutral'> = {
  high: 'bear', elevated: 'caution', moderate: 'caution', low: 'neutral',
};

export default function IntegrityPage() {
  const [data, setData] = useState<Sportsbook | null>(null);
  useEffect(() => { api.getSportsbook().then(setData).catch(() => {}); }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-8">
        <div className="eyebrow-crimson mb-1">Sportsbook · integrity monitoring</div>
        <h1 className="font-display text-4xl font-extrabold text-[var(--ink-strong)] tracking-tight">Governance over a regulated market.</h1>
        <p className="mt-2 text-[var(--ink-muted)] max-w-3xl">
          The integrity agent scores every wager from every sportsbook partner against historical
          baselines per market, line, and account cluster. High-severity flags route to the league
          integrity desk and the sportsbook compliance teams in seconds.
        </p>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <Kpi label="Handle YTD" value={data ? fmtCurrencyShort(data.handle_ytd_usd) : '—'} sub={data ? `YoY +${(data.handle_yoy * 100).toFixed(1)}%` : ''} />
        <Kpi label="Partners" value={data ? `${data.partner_count}` : '—'} sub="active sportsbooks" />
        <Kpi label="Wagers scored · 24h" value={data ? fmtNumber(data.integrity_agent.wagers_scored_24h) : '—'} sub="every bet, every market" />
        <Kpi label="High-severity open" value={data ? `${data.integrity_agent.high_severity_open}` : '—'} sub="under review" tone="bear" />
      </div>

      {/* Agent header */}
      {data && (
        <section className="mb-8 broadcast-card overflow-hidden" style={{ borderColor: 'var(--crimson)' }}>
          <div className="bg-[var(--court-black)] text-white p-5 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="eyebrow-light mb-1" style={{ color: 'var(--crimson-bright)' }}>{data.integrity_agent.name}</div>
              <p className="text-sm text-white/70 mt-1 max-w-xl">
                Reads the gold integrity signals mart. Scores wagers in stream. False-positive rate
                tracked against integrity-desk dispositions to keep the noise floor low.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 min-w-[420px]">
              <Mini label="Flagged · 24h" value={`${data.integrity_agent.flagged_24h}`} />
              <Mini label="False-positive rate" value={fmtPctPlain(data.integrity_agent.false_positive_rate, 1)} />
              <Mini label="Avg detection" value={`${data.integrity_agent.avg_detection_latency_seconds}s`} />
            </div>
          </div>
        </section>
      )}

      {/* Flags */}
      <section className="mb-10">
        <h2 className="font-display text-2xl font-extrabold text-[var(--ink-strong)] border-b border-[var(--hairline)] pb-2 mb-4 uppercase tracking-tight">Active flags</h2>
        <div className="space-y-3">
          {(data?.integrity_agent.flags ?? []).map((f) => {
            const tone = SEV_TONE[f.severity] ?? 'neutral';
            return (
              <div key={f.flag_id} className="broadcast-card p-5" style={f.severity === 'high' ? { borderColor: 'var(--crimson)' } : undefined}>
                <div className="flex items-start justify-between gap-4 mb-2 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`status-pill ${tone}`}>{f.severity}</span>
                    <span className="font-mono text-[11px] text-[var(--ink-soft)]">{f.flag_id}</span>
                    <span className="font-display font-bold uppercase tracking-wide text-[var(--ink-strong)]">{f.matchup}</span>
                  </div>
                  <span className="text-[11px] text-[var(--ink-soft)] stat-mono">{new Date(f.detected_at).toLocaleString()}</span>
                </div>
                <div className="text-[11px] font-display font-bold uppercase tracking-wider text-[var(--gold-dim)] mb-2">{f.market}</div>
                <p className="text-sm text-[var(--ink-muted)] leading-relaxed">{f.summary}</p>
                <div className="mt-3 text-[11px] font-display font-bold uppercase tracking-wider text-[var(--ink-soft)]">Status · {f.status}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Top markets */}
      <section className="mb-10">
        <h2 className="font-display text-2xl font-extrabold text-[var(--ink-strong)] border-b border-[var(--hairline)] pb-2 mb-4 uppercase tracking-tight">Top markets by handle</h2>
        <div className="broadcast-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[var(--paper-deep)] text-[10px] font-display font-bold uppercase tracking-wider text-[var(--ink-soft)]">
              <tr>
                <th className="text-left px-4 py-2">Market</th>
                <th className="text-right px-4 py-2">Handle YTD</th>
                <th className="text-right px-4 py-2">YoY</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--hairline-soft)]">
              {(data?.top_markets ?? []).map((m) => (
                <tr key={m.market}>
                  <td className="px-4 py-2 font-display font-bold uppercase tracking-wide">{m.market}</td>
                  <td className="px-4 py-2 text-right scoreboard text-[var(--ink-strong)]">{fmtCurrencyShort(m.handle_ytd_usd)}</td>
                  <td className="px-4 py-2 text-right stat-mono" style={{ color: m.yoy >= 0 ? 'var(--bull)' : 'var(--bear)' }}>
                    {m.yoy >= 0 ? '+' : ''}{(m.yoy * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Kpi({ label, value, sub, tone }: { label: string; value: string; sub: string; tone?: 'bear' }) {
  return (
    <div className="kpi-tile">
      <div className="kpi-label">{label}</div>
      <div className="kpi-value" style={tone === 'bear' ? { color: 'var(--crimson)' } : undefined}>{value}</div>
      <div className="mt-1 text-[11px] text-[var(--ink-soft)] stat-mono">{sub}</div>
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
