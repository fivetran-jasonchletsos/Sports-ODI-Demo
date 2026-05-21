import { useEffect, useState } from 'react';
import { api, fmtCurrencyShort, fmtNumber, fmtNumberShort, fmtPctPlain } from '../api/queries';
import type { Sponsorship } from '../types';

export default function SponsorshipPage() {
  const [data, setData] = useState<Sponsorship | null>(null);
  useEffect(() => { api.getSponsorship().then(setData).catch(() => {}); }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-8">
        <div className="eyebrow mb-1">Sponsorship · fulfillment &amp; ROI</div>
        <h1 className="font-display text-4xl font-extrabold text-[var(--ink-strong)] tracking-tight">$1.8B YTD. 248 active partners.</h1>
        <p className="mt-2 text-[var(--ink-muted)] max-w-3xl">
          Top 30 sponsor relationships. Contract value, fulfillment (banner impressions, social
          mentions, in-venue activations), and the ROI agent flagging under- and over-delivery.
        </p>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <Kpi label="Revenue YTD" value={data ? fmtCurrencyShort(data.total_sponsorship_revenue_ytd_usd) : '—'} sub="all tiers combined" />
        <Kpi label="Active partners" value={data ? `${data.active_partners}` : '—'} sub="league + team level" />
        <Kpi label="Underdelivery flags" value={data ? `${data.roi_agent.flagged_underdelivery}` : '—'} sub="24h" />
        <Kpi label="Overdelivery flags" value={data ? `${data.roi_agent.flagged_overdelivery}` : '—'} sub="renewal leverage" />
      </div>

      {data && (
        <section className="mb-10 broadcast-card overflow-hidden" style={{ borderColor: 'var(--gold)' }}>
          <div className="bg-[var(--court-black)] text-white p-5">
            <div className="eyebrow-light mb-1">{data.roi_agent.name}</div>
            <h2 className="font-display text-xl font-extrabold uppercase tracking-tight">Latest agent recommendation</h2>
          </div>
          <div className="p-5">
            <p className="text-sm text-[var(--ink-muted)] leading-relaxed">{data.roi_agent.recommendation}</p>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <Mini label="Audits · 24h" value={fmtNumber(data.roi_agent.audits_24h)} />
              <Mini label="Underdelivery flags" value={`${data.roi_agent.flagged_underdelivery}`} />
              <Mini label="Overdelivery flags" value={`${data.roi_agent.flagged_overdelivery}`} />
            </div>
          </div>
        </section>
      )}

      <section className="mb-10">
        <h2 className="font-display text-2xl font-extrabold text-[var(--ink-strong)] border-b border-[var(--hairline)] pb-2 mb-4 uppercase tracking-tight">Top 30 sponsors</h2>
        <div className="broadcast-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[var(--paper-deep)] text-[10px] font-display font-bold uppercase tracking-wider text-[var(--ink-soft)]">
              <tr>
                <th className="text-left px-3 py-2">Sponsor</th>
                <th className="text-left px-3 py-2">Tier</th>
                <th className="text-left px-3 py-2">Category</th>
                <th className="text-right px-3 py-2">Annual value</th>
                <th className="text-right px-3 py-2">Yrs left</th>
                <th className="text-right px-3 py-2">Fulfillment</th>
                <th className="text-right px-3 py-2">Impressions YTD</th>
                <th className="text-right px-3 py-2">ROI score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--hairline-soft)]">
              {(data?.top_30 ?? []).map((s) => {
                const fulfillTone = s.fulfillment_pct < 0.85 ? 'bear' : s.fulfillment_pct > 1.05 ? 'bull' : 'neutral';
                return (
                  <tr key={s.sponsor_id} className="hover:bg-[var(--paper-deep)]">
                    <td className="px-3 py-2 font-display font-bold uppercase tracking-wide">{s.name}</td>
                    <td className="px-3 py-2 text-[11px] stat-mono text-[var(--ink-muted)]">{s.tier}</td>
                    <td className="px-3 py-2 text-[11px] text-[var(--ink-muted)]">{s.category}</td>
                    <td className="px-3 py-2 text-right scoreboard text-[var(--ink-strong)]">{fmtCurrencyShort(s.annual_value_usd)}</td>
                    <td className="px-3 py-2 text-right stat-mono">{s.contract_years_remaining}</td>
                    <td className="px-3 py-2 text-right"><span className={`status-pill ${fulfillTone}`}>{fmtPctPlain(s.fulfillment_pct, 0)}</span></td>
                    <td className="px-3 py-2 text-right stat-mono">{fmtNumberShort(s.banner_impressions_ytd)}</td>
                    <td className="px-3 py-2 text-right scoreboard text-[var(--gold-dim)]">{s.roi_score.toFixed(1)}x</td>
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

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[var(--paper-deep)] border border-[var(--hairline)] rounded-sm px-3 py-2">
      <div className="text-[10px] font-display font-bold uppercase tracking-wider text-[var(--ink-soft)]">{label}</div>
      <div className="mt-0.5 scoreboard text-xl text-[var(--ink-strong)]">{value}</div>
    </div>
  );
}
