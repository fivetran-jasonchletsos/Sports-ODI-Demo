import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, fmtCurrencyShort, fmtNumber, fmtNumberShort, fmtPct, fmtPctPlain, fmtBytes } from '../api/queries';
import type { Summary, Team } from '../types';

export default function HomePage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);

  useEffect(() => {
    api.getSummary().then(setSummary).catch(() => {});
    api.getTeams().then((r) => setTeams(r.teams)).catch(() => {});
  }, []);

  return (
    <>
      <section className="bg-[var(--court-black)] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.08] pointer-events-none" aria-hidden style={{
          backgroundImage: 'repeating-linear-gradient(90deg, transparent 0 64px, rgba(250,204,21,0.6) 64px 65px), repeating-linear-gradient(0deg, transparent 0 64px, rgba(220,38,38,0.2) 64px 65px)',
        }} />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 sm:py-20 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
            <div className="lg:col-span-7">
              <div className="eyebrow-light mb-4">Apex Sports League · Open Data Infrastructure</div>
              <h1 className="font-display text-5xl sm:text-7xl font-extrabold text-white leading-[0.92] tracking-tight">
                One league.<br />
                <span className="text-[var(--gold)]">Every signal.</span><br />
                Decided in seconds.
              </h1>
              <p className="mt-6 text-base sm:text-lg text-white/75 max-w-2xl leading-relaxed">
                24 franchises. 14M ApexTV subscribers. 5.2M ticketed fans. 248 sponsors.
                Player tracking, social listening, sportsbook integrity. All landed once
                in open Iceberg tables on S3. Ready for the agents the league office actually
                runs in production.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <button onClick={() => navigate('/ticketing')} className="inline-flex items-center gap-2 rounded-sm font-display font-bold uppercase tracking-wider text-sm text-[var(--court-black)] px-5 py-3 shadow-lg hover:opacity-95 transition-opacity" style={{ background: 'var(--gold)' }}>
                  Open the desk <span aria-hidden>→</span>
                </button>
                <button onClick={() => navigate('/architecture')} className="inline-flex items-center gap-2 rounded-sm font-display font-bold uppercase tracking-wider text-sm text-white bg-white/5 border border-white/20 px-5 py-3 hover:bg-white/10 transition-colors">
                  ODI architecture <span aria-hidden>→</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="bg-white text-[var(--ink)] rounded-sm border border-[var(--hairline)] shadow-xl overflow-hidden">
                <div className="px-5 py-3 border-b border-[var(--hairline)] flex items-center justify-between bg-[var(--paper-deep)]">
                  <div className="eyebrow">League snapshot</div>
                  <div className="text-[10px] font-bold text-[var(--ink-soft)] uppercase tracking-wider">Iceberg · gold layer</div>
                </div>
                <div className="grid grid-cols-2 divide-x divide-y divide-[var(--hairline-soft)] tabular">
                  <Stat label="Reg-season attendance" value={summary ? fmtNumberShort(summary.regular_season_attendance) : '—'} delta={summary?.regular_season_attendance_yoy} />
                  <Stat label="ApexTV subscribers" value={summary ? fmtNumberShort(summary.apex_tv_subscribers) : '—'} delta={summary?.apex_tv_subscribers_yoy} />
                  <Stat label="Avg ticket" value={summary ? `$${summary.avg_ticket_price_usd.toFixed(2)}` : '—'} delta={summary?.avg_ticket_price_yoy} />
                  <Stat label="Sponsor YTD" value={summary ? fmtCurrencyShort(summary.sponsorship_revenue_ytd_usd) : '—'} delta={summary?.sponsorship_revenue_yoy} />
                </div>
                <div className="px-5 py-3 border-t border-[var(--hairline)] flex items-center justify-between text-[11px] text-[var(--ink-soft)] bg-[var(--paper-deep)]">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--bull)] animate-pulse" />
                    {summary ? fmtBytes(summary.s3_bytes) : '—'} in S3 · {summary?.iceberg_table_count ?? '—'} Iceberg tables
                  </span>
                  <button onClick={() => navigate('/pipeline')} className="font-bold hover:text-[var(--ink-strong)] uppercase tracking-wider font-display">
                    Inspect →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* KPI strip */}
      <section className="mx-auto max-w-7xl px-4 pt-12 pb-4 sm:px-6 lg:px-8">
        <div className="mb-5 border-b border-[var(--hairline)] pb-3">
          <div className="eyebrow mb-1">Scoreboard</div>
          <h2 className="font-display text-3xl font-extrabold text-[var(--ink-strong)] tracking-tight">
            The league in six numbers
          </h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
          <Kpi label="Social followers" value={summary ? fmtNumberShort(summary.social_followers_total) : '—'} sub={summary ? fmtPct(summary.social_followers_yoy) : ''} />
          <Kpi label="Concurrent viewers" value={summary ? fmtNumberShort(summary.apex_tv_avg_concurrent) : '—'} sub="ApexTV average" />
          <Kpi label="Sportsbook handle YTD" value={summary ? fmtCurrencyShort(summary.sportsbook_handle_ytd_usd) : '—'} sub={summary ? fmtPct(summary.sportsbook_handle_yoy) : ''} />
          <Kpi label="Annual revenue" value={summary ? fmtCurrencyShort(summary.annual_revenue_usd) : '—'} sub="combined league + media" />
          <Kpi label="Top trending player" value={summary?.top_trending_player.name.split(' ')[1] ?? '—'} sub={summary ? `${fmtNumberShort(summary.top_trending_player.mentions_24h)} mentions · 24h` : ''} />
          <Kpi label="Teams" value="24" sub="US + Canada" />
        </div>
      </section>

      {/* Top issues on the CDO's desk */}
      <section className="mx-auto max-w-7xl px-4 pt-10 pb-2 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-end justify-between border-b border-[var(--hairline)] pb-3">
          <div>
            <div className="eyebrow-crimson mb-1">On the CDO's desk</div>
            <h2 className="font-display text-3xl font-extrabold text-[var(--ink-strong)] tracking-tight">Three issues, ranked by ARR at risk</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <IssueCard
            severity="high"
            tag="ApexTV · Churn"
            title="Cohort A churn spike"
            body="Subscribers acquired in 2025-Q3 via Tier-3 markets are churning at 7.2% monthly vs 3.4% baseline. ~143k subs and $25.7M ARR at risk. Personalization agent already activating retention play."
            onClick={() => navigate('/streaming')}
          />
          <IssueCard
            severity="elevated"
            tag="Ticketing · No-shows"
            title="No-show rate in Tier-3 markets"
            body="League-wide no-show 11.8%, but 4 Tier-3 markets averaging 19%+. Pricing agent recommending dynamic discounts plus mobile-only resale to lift paid attendance and concession revenue."
            onClick={() => navigate('/ticketing')}
          />
          <IssueCard
            severity="high"
            tag="Sportsbook · Integrity"
            title="Two anomalous bet patterns flagged"
            body="Integrity agent flagged 1 high-severity (player props · K. Sterling) and 1 elevated (Coyotes FC at Tides · 1H total) in the last 48h. Routed to integrity desk and sportsbook compliance."
            onClick={() => navigate('/integrity')}
          />
        </div>
      </section>

      {/* Team map */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-end justify-between border-b border-[var(--hairline)] pb-3">
          <div>
            <div className="eyebrow mb-1">League footprint</div>
            <h2 className="font-display text-3xl font-extrabold text-[var(--ink-strong)] tracking-tight">24 markets · color = attendance YoY</h2>
            <p className="text-sm text-[var(--ink-muted)] mt-1">Green = growing gate, red = declining, gold = top quartile in absolute attendance.</p>
          </div>
        </div>
        <div className="broadcast-card overflow-hidden">
          <NorthAmericaMap teams={teams} onSelect={() => navigate('/ticketing')} />
        </div>
      </section>

      {/* ODI architecture lineage strip */}
      <section className="bg-[var(--court-black)] text-white border-y border-[var(--hairline)]">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-10">
            <div className="eyebrow-light mb-2">Provenance</div>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Seven sources. One lake. Every chart traces back.
            </h2>
            <p className="mt-2 text-sm sm:text-base text-white/70 leading-relaxed">
              Ticketmaster, StubHub, Salesforce Marketing Cloud, ApexTV telemetry, ApexTrack player tracking,
              sponsorship management, social platforms (X, Instagram, Reddit, TikTok), and sportsbook partner feeds.
              All landed once in open Iceberg tables on S3.
            </p>
          </div>
          <ol className="grid grid-cols-1 md:grid-cols-5 gap-3 sm:gap-4">
            {[
              { tag: '01', label: 'Sources', desc: 'Ticketmaster · StubHub · SFMC · ApexTV · ApexTrack · social · sportsbook.' },
              { tag: '02', label: 'Ingest',  desc: 'Fivetran lands raw bronze tables to S3 as Apache Iceberg via Glue.' },
              { tag: '03', label: 'Transform', desc: 'dbt builds silver (conformed) → gold (business-ready) marts.' },
              { tag: '04', label: 'Serve',  desc: 'Snowflake reads the same Iceberg tables. Trino or DuckDB would too.' },
              { tag: '05', label: 'Reason', desc: 'Cortex agents (pricing, content, load, ROI, integrity) read gold directly.' },
            ].map((s) => (
              <li key={s.tag} className="bg-white/5 border border-white/10 rounded-sm p-4 hover:border-[var(--gold)] transition-colors">
                <div className="text-[10px] font-mono font-bold text-[var(--gold)] tracking-wider">{s.tag}</div>
                <div className="mt-1 font-display text-base font-extrabold text-white uppercase tracking-wide">{s.label}</div>
                <p className="mt-2 text-xs text-white/70 leading-relaxed">{s.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-[var(--court-deep)] text-white border-t border-[var(--hairline)]">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8 text-center">
          <div className="eyebrow-light mb-3">Design Principle</div>
          <p className="font-display text-2xl sm:text-3xl text-white leading-snug font-extrabold uppercase tracking-wide">
            "Lock-in is an architectural choice.<br />
            <span className="text-[var(--gold)]">So is openness.</span>"
          </p>
          <p className="mt-4 text-sm text-white/70 max-w-2xl mx-auto">
            The league office chose ODI because the next five years of decisions — ticketing,
            streaming, player health, integrity — will be made jointly by humans and agents,
            and both need to read the same governed surface.
          </p>
        </div>
      </section>
    </>
  );
}

function Stat({ label, value, delta }: { label: string; value: string; delta?: number | null }) {
  const color = delta == null ? 'var(--ink-soft)' : delta >= 0 ? 'var(--bull)' : 'var(--bear)';
  return (
    <div className="px-5 py-4">
      <div className="text-[10.5px] font-bold text-[var(--ink-soft)] uppercase tracking-[0.1em] font-display">{label}</div>
      <div className="mt-1 flex items-baseline gap-2">
        <div className="font-display text-2xl font-extrabold text-[var(--ink-strong)] leading-none tabular">{value}</div>
        {delta != null && <span className="text-[11px] font-bold tabular stat-mono" style={{ color }}>{fmtPct(delta, 1)}</span>}
      </div>
    </div>
  );
}

function Kpi({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="kpi-tile">
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      <div className="mt-1.5 text-[11px] text-[var(--ink-soft)] stat-mono">{sub}</div>
    </div>
  );
}

function IssueCard({ severity, tag, title, body, onClick }: { severity: 'high' | 'elevated'; tag: string; title: string; body: string; onClick: () => void }) {
  const pill = severity === 'high' ? 'crimson' : 'caution';
  return (
    <button onClick={onClick} className="broadcast-card text-left hover:border-[var(--gold)] transition-colors p-5 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <span className={`status-pill ${pill}`}>{severity}</span>
        <span className="text-[10px] font-display font-bold uppercase tracking-wider text-[var(--ink-soft)]">{tag}</span>
      </div>
      <h3 className="font-display text-xl font-extrabold text-[var(--ink-strong)] tracking-tight">{title}</h3>
      <p className="mt-2 text-sm text-[var(--ink-muted)] leading-relaxed flex-1">{body}</p>
      <div className="mt-3 text-[11px] font-display font-bold uppercase tracking-wider text-[var(--gold-dim)]">Open detail →</div>
    </button>
  );
}

// Simple SVG-based North America map projection of the 24 markets.
function NorthAmericaMap({ teams, onSelect }: { teams: Team[]; onSelect: (t: Team) => void }) {
  // bbox covering continental US + southern Canada
  const minLon = -125, maxLon = -68, minLat = 25, maxLat = 50;
  const W = 960, H = 460;
  const proj = (lat: number, lon: number) => {
    const x = ((lon - minLon) / (maxLon - minLon)) * W;
    const y = H - ((lat - minLat) / (maxLat - minLat)) * H;
    return [x, y];
  };
  const palette = (yoy: number, top: boolean) => {
    if (top) return '#facc15';
    if (yoy > 0.05) return '#16a34a';
    if (yoy > 0) return '#86efac';
    if (yoy > -0.04) return '#fcd34d';
    return '#dc2626';
  };
  // top-quartile by absolute attendance
  const sorted = [...teams].sort((a, b) => b.avg_attendance - a.avg_attendance);
  const topThreshold = sorted[Math.floor(sorted.length / 4)]?.avg_attendance ?? Infinity;

  return (
    <div className="relative bg-[var(--court-black)]">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
        {/* faint grid */}
        <defs>
          <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M 48 0 L 0 0 0 48" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width={W} height={H} fill="url(#grid)" />
        {/* coarse North America outline approximation */}
        <path
          d="M 40 100 L 120 70 L 220 60 L 360 50 L 520 60 L 700 80 L 820 100 L 880 160 L 870 230 L 840 290 L 780 340 L 720 380 L 640 410 L 560 420 L 480 410 L 400 405 L 320 400 L 250 380 L 180 340 L 130 280 L 90 220 L 60 160 Z"
          fill="rgba(255,255,255,0.04)"
          stroke="rgba(250,204,21,0.18)"
          strokeWidth="1"
        />
        {teams.map((t) => {
          const [x, y] = proj(t.lat, t.lon);
          const top = t.avg_attendance >= topThreshold;
          const fill = palette(t.attendance_yoy_pct, top);
          return (
            <g key={t.team_id} onClick={() => onSelect(t)} style={{ cursor: 'pointer' }}>
              <circle cx={x} cy={y} r="9" fill={fill} stroke="#0a0e1a" strokeWidth="2" opacity="0.92" />
              <text x={x + 12} y={y + 4} fill="white" fontSize="11" fontFamily="Saira Condensed, sans-serif" fontWeight="700">
                {t.team_id}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center gap-3 text-[10px] font-bold uppercase tracking-wider text-white/80 font-display">
        <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#facc15]" /> Top-quartile attendance</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#16a34a]" /> Growing &gt;5%</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#86efac]" /> Growing 0–5%</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#fcd34d]" /> Soft</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#dc2626]" /> Declining</span>
      </div>
    </div>
  );
}
