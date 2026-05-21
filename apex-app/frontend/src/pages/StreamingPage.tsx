import { useEffect, useState } from 'react';
import { api, fmtCurrencyShort, fmtNumber, fmtNumberShort, fmtPctPlain } from '../api/queries';
import type { Streaming } from '../types';

export default function StreamingPage() {
  const [data, setData] = useState<Streaming | null>(null);
  useEffect(() => { api.getStreaming().then(setData).catch(() => {}); }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-8">
        <div className="eyebrow mb-1">ApexTV · streaming product</div>
        <h1 className="font-display text-4xl font-extrabold text-[var(--ink-strong)] tracking-tight">14M subscribers. One churn alarm bell.</h1>
        <p className="mt-2 text-[var(--ink-muted)] max-w-3xl">
          Subscriber health, content-recommendation agent performance, and the personalization agent
          surfacing highlight reels per subscriber. The cohort A retention play is live.
        </p>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <Kpi label="Subscribers" value={data ? fmtNumberShort(data.subscribers_total) : '—'} sub={data ? `YoY ${(data.subscribers_yoy * 100).toFixed(1)}%` : ''} />
        <Kpi label="Monthly churn" value={data ? fmtPctPlain(data.monthly_churn_pct, 1) : '—'} sub="baseline" />
        <Kpi label="ARPU" value={data ? `$${data.arpu_usd_monthly.toFixed(2)}` : '—'} sub="monthly" />
        <Kpi label="LTV / CAC" value={data ? `${data.ltv_cac_ratio.toFixed(1)}x` : '—'} sub={data ? `LTV ${fmtCurrencyShort(data.ltv_usd)} · CAC $${data.cac_usd.toFixed(0)}` : ''} />
      </div>

      {/* Cohort A alert */}
      {data && (
        <section className="mb-10 broadcast-card overflow-hidden" style={{ borderColor: 'var(--crimson)' }}>
          <div className="bg-[var(--crimson)] text-white p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="status-pill" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}>High severity</span>
              <span className="text-[11px] font-display font-bold uppercase tracking-wider opacity-90">ApexTV · churn cohort</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-tight">{data.cohort_a_churn_spike.cohort}</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <div className="text-[10px] font-display font-bold uppercase tracking-wider text-[var(--ink-soft)]">Current churn</div>
              <div className="scoreboard text-4xl" style={{ color: 'var(--crimson)' }}>{(data.cohort_a_churn_spike.current_churn_pct * 100).toFixed(1)}%</div>
              <div className="mt-1 text-[11px] text-[var(--ink-soft)] stat-mono">vs {(data.cohort_a_churn_spike.baseline_churn_pct * 100).toFixed(1)}% baseline (+{data.cohort_a_churn_spike.delta_pct_points.toFixed(1)} pts)</div>
            </div>
            <div>
              <div className="text-[10px] font-display font-bold uppercase tracking-wider text-[var(--ink-soft)]">Subscribers at risk</div>
              <div className="scoreboard text-4xl">{fmtNumberShort(data.cohort_a_churn_spike.subscribers_at_risk)}</div>
              <div className="mt-1 text-[11px] text-[var(--ink-soft)] stat-mono">~{fmtCurrencyShort(data.cohort_a_churn_spike.estimated_arr_at_risk_usd)} ARR exposure</div>
            </div>
            <div>
              <div className="text-[10px] font-display font-bold uppercase tracking-wider text-[var(--ink-soft)]">Agent action</div>
              <p className="text-sm text-[var(--ink-muted)] leading-relaxed mt-1">{data.cohort_a_churn_spike.agent_action}</p>
            </div>
          </div>
        </section>
      )}

      {/* Agents */}
      {data && (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          <AgentCard
            name={data.content_agent.name}
            stats={[
              ['Recs · 24h', fmtNumber(data.content_agent.personalized_recs_24h)],
              ['CTR', fmtPctPlain(data.content_agent.click_through_rate, 1)],
              ['Avg session lift', `+${data.content_agent.avg_session_lift_minutes.toFixed(1)} min`],
            ]}
            blurb="Reads gold.fct_apex_tv_subscriber_health and writes top-of-app carousels per subscriber. Cortex agent reasoning over the same Iceberg gold layer the BI team uses."
          />
          <AgentCard
            name={data.personalization_agent.name}
            stats={[
              ['Reels per user / day', `${data.personalization_agent.highlight_reels_per_user_daily.toFixed(1)}`],
              ['Watch completion', fmtPctPlain(data.personalization_agent.watch_completion_rate, 0)],
            ]}
            blurb={data.personalization_agent.sample_recommendation}
            sample
          />
        </section>
      )}

      {/* Top games */}
      <section className="mb-10">
        <h2 className="font-display text-2xl font-extrabold text-[var(--ink-strong)] border-b border-[var(--hairline)] pb-2 mb-4 uppercase tracking-tight">Top concurrent broadcasts</h2>
        <div className="broadcast-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[var(--paper-deep)] text-[10px] font-display font-bold uppercase tracking-wider text-[var(--ink-soft)]">
              <tr>
                <th className="text-left px-4 py-2">Broadcast</th>
                <th className="text-right px-4 py-2">Peak concurrent</th>
                <th className="text-right px-4 py-2">Minutes watched</th>
                <th className="text-right px-4 py-2">Completion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--hairline-soft)]">
              {(data?.top_concurrent_games ?? []).map((g) => (
                <tr key={g.game_id}>
                  <td className="px-4 py-2 font-display font-bold uppercase tracking-wide">{g.matchup}</td>
                  <td className="px-4 py-2 text-right stat-mono font-bold">{fmtNumberShort(g.concurrent_peak)}</td>
                  <td className="px-4 py-2 text-right stat-mono">{fmtNumberShort(g.total_minutes_watched)}</td>
                  <td className="px-4 py-2 text-right stat-mono">{(g.completion_rate * 100).toFixed(0)}%</td>
                </tr>
              ))}
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

function AgentCard({ name, stats, blurb, sample }: { name: string; stats: [string, string][]; blurb: string; sample?: boolean }) {
  return (
    <div className="broadcast-card overflow-hidden">
      <div className="bg-[var(--court-black)] text-white p-4">
        <div className="eyebrow-light mb-1">Cortex agent</div>
        <div className="font-display text-lg font-extrabold uppercase tracking-tight">{name}</div>
      </div>
      <div className="p-5">
        <div className="grid grid-cols-2 gap-3 mb-4">
          {stats.map(([l, v]) => (
            <div key={l}>
              <div className="text-[10px] font-display font-bold uppercase tracking-wider text-[var(--ink-soft)]">{l}</div>
              <div className="scoreboard text-2xl text-[var(--ink-strong)] mt-0.5">{v}</div>
            </div>
          ))}
        </div>
        {sample ? (
          <div className="bg-[var(--paper-deep)] border-l-2 border-[var(--gold)] pl-3 py-2 text-sm text-[var(--ink-muted)] leading-relaxed italic">
            {blurb}
          </div>
        ) : (
          <p className="text-sm text-[var(--ink-muted)] leading-relaxed">{blurb}</p>
        )}
      </div>
    </div>
  );
}
