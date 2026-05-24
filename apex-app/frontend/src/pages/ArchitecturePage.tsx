// Apex Sports League — Open Data Infrastructure architecture page.
//
// Ported from Clarity Health's ArchitecturePage to give Sports the same
// alive medallion / multi-engine surface. Sports-flavoured sources: player
// stats (SQL Server), ticketing (Oracle), real-time game telemetry, league
// data feed. Snowflake remains the primary engine; Athena/DuckDB/Trino/Spark
// stay listed as the same open-lake reads.

import { useEffect, useState } from 'react';
import { api, fmtNumber, fmtBytes } from '../api/queries';
import type { IcebergTable } from '../types';
import { AliveMedallion, type SourceNode, type EngineNode, type ConsumerRole } from '../components/AliveMedallion';

const SP_SOURCES: SourceNode[] = [
  { id: 'stats', label: 'Player Stats DB',  sub: 'SQL Server log-CDC',      logo: 'sqlserver', freshness: '42s lag',  status: 'healthy' },
  { id: 'tix',   label: 'Ticketing System', sub: 'Oracle LogMiner',         logo: 'oracle',    freshness: '2 min lag', status: 'healthy' },
  { id: 'tel',   label: 'Game Telemetry',   sub: 'Real-time tracker stream', logo: 'hl7',      freshness: 'live',      status: 'healthy', streaming: true },
  { id: 'feed',  label: 'League Data Feed', sub: 'Daily league pull',       logo: 'cms',       freshness: '12h lag',  status: 'healthy' },
];

const SP_ENGINES: EngineNode[] = [
  { name: 'Snowflake', active: true, logo: 'snowflake' },
  { name: 'Athena',                  logo: 'athena' },
  { name: 'DuckDB',                  logo: 'duckdb' },
  { name: 'Trino',                   logo: 'trino' },
  { name: 'Spark',                   logo: 'spark' },
];

const SP_ROLES: ConsumerRole[] = [
  { label: 'Scouting',     sub: 'prospect comps' },
  { label: 'Coaching',     sub: 'matchups & load' },
  { label: 'Front Office', sub: 'cap & contracts' },
  { label: 'Marketing',    sub: 'fans & loyalty' },
];

interface QueryEngine {
  name: 'Snowflake' | 'Athena' | 'DuckDB' | 'Trino' | 'Spark';
  status: 'active' | 'available' | 'demo';
  description: string;
  sample_query: string;
}

const ENGINES: QueryEngine[] = [
  {
    name: 'Snowflake',
    status: 'active',
    description: 'Primary engine for the Apex gold layer. Reads Iceberg externals through Polaris catalog; auto-suspends between queries. Powers the front end, Cortex agents (pricing, content, integrity), and scout-facing dashboards.',
    sample_query: `SELECT
  p.player_id, p.position, p.team_id,
  s.minutes_played, s.usage_rate, s.true_shooting_pct,
  l.load_index_7d, l.injury_risk_band
FROM gold.dim_players       p
JOIN gold.fct_player_perf   s USING (player_id)
JOIN gold.fct_player_load   l USING (player_id)
WHERE s.minutes_played >= 28
  AND l.injury_risk_band IN ('elevated','high')
ORDER BY l.load_index_7d DESC
LIMIT 50;`,
  },
  {
    name: 'Athena',
    status: 'available',
    description: 'Serverless reads against the same Iceberg gold tables via Glue. Useful for league-office ad-hoc that doesn\'t need to pay for warehouse time.',
    sample_query: `SELECT team_id, AVG(no_show_rate) AS avg_no_show
FROM gold.fct_ticket_demand
WHERE event_date >= current_date - interval '30' day
GROUP BY team_id
ORDER BY avg_no_show DESC;`,
  },
  {
    name: 'DuckDB',
    status: 'available',
    description: 'Engineer\'s laptop. Same Iceberg tables, queried directly from S3 with the iceberg extension. Tiny ad-hoc joins without spinning up anything.',
    sample_query: `INSTALL iceberg;
LOAD iceberg;

SELECT *
FROM iceberg_scan('s3://apex-odi-lake/gold/fct_integrity_signals/')
WHERE severity = 'high'
LIMIT 100;`,
  },
  {
    name: 'Trino',
    status: 'available',
    description: 'Federated engine that joins the lake to other relational sources (legacy stats systems, partner CRM replicas) without copying data first.',
    sample_query: `SELECT t.team_id, AVG(p.minutes_played) AS avg_min
FROM iceberg.gold.fct_player_perf p
JOIN postgres.legacy.team_roster t
  ON t.player_id = p.player_id
WHERE t.season = 2026
GROUP BY t.team_id;`,
  },
  {
    name: 'Spark',
    status: 'available',
    description: 'Distributed compute for ML training and large cohort joins. Reads the same Iceberg tables via the spark-iceberg runtime — used for player-comp modeling.',
    sample_query: `df = spark.read.format("iceberg")\\
  .load("gold.fct_player_perf")
df.groupBy("position", "team_id")\\
  .agg({"true_shooting_pct": "avg"})\\
  .show()`,
  },
];

const ENGINE_COLORS: Record<QueryEngine['name'], string> = {
  Snowflake: '#29b5e8',
  Athena:    '#facc15',
  DuckDB:    '#0a0e1a',
  Trino:     '#1d4e89',
  Spark:     '#b45309',
};

export default function ArchitecturePage() {
  const [tables, setTables] = useState<IcebergTable[]>([]);
  const [activeEngine, setActiveEngine] = useState<QueryEngine>(ENGINES[0]);

  useEffect(() => { api.getIceberg().then((r) => setTables(r.tables)).catch(() => {}); }, []);

  const byLayer = (l: 'bronze' | 'silver' | 'gold') => tables.filter((t) => t.database === l);
  const layerStats = (l: 'bronze' | 'silver' | 'gold') => {
    const t = byLayer(l);
    return { tables: t.length, rows: t.reduce((s, r) => s + r.rows, 0), bytes: t.reduce((s, r) => s + r.bytes, 0) };
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8 border-b border-[var(--hairline)] pb-6">
        <div className="eyebrow mb-1">Open Data Infrastructure</div>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--ink-strong)]">
          One lake. Every engine. The whole league story.
        </h1>
        <p className="mt-3 text-[var(--ink-muted)] max-w-3xl leading-relaxed">
          Apex Sports League treats <em>storage</em>, <em>catalog</em>, and <em>compute</em> as three
          independently swappable layers. Iceberg is the storage spec. Glue is the catalog.
          Snowflake, Athena, DuckDB, Trino, and Spark all read the same tables &mdash; no copy,
          no extract, no proprietary format between the source system and the front office.
        </p>
      </header>

      {/* Live throughput hero */}
      <ThroughputHero />

      {/* Alive Medallion — Sources / Lakehouse / Consumers */}
      <section className="broadcast-card p-6 sm:p-8 mb-8">
        <div className="eyebrow mb-1">Data Flow</div>
        <h2 className="font-display text-2xl font-extrabold text-[var(--ink-strong)] uppercase tracking-tight mb-6">
          From four open sources to one governed gold layer
        </h2>

        <AliveMedallion
          sources={SP_SOURCES}
          bronze={{ ...layerStats('bronze'), trend: [180, 195, 210, 222, 240, 255, 270] }}
          silver={{ ...layerStats('silver'), trend: [120, 130, 142, 155, 168, 180, 192] }}
          gold={{   ...layerStats('gold'),   trend: [80, 88, 95, 104, 112, 124, 138] }}
          engines={SP_ENGINES}
          roles={SP_ROLES}
          accent="#facc15"
        />

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-[var(--ink-muted)]">
          <LayerDetail layer="bronze" stats={layerStats('bronze')} desc="Raw rows landed by Fivetran. 1:1 with source. CDC kept current within five minutes." />
          <LayerDetail layer="silver" stats={layerStats('silver')} desc="Conformed dims and facts. Cleaned, deduped, joined to a player + game + event spine." />
          <LayerDetail layer="gold"   stats={layerStats('gold')}   desc="Business-ready marts + the dbt semantic layer. What every front-office surface reads." />
        </div>
      </section>

      {/* Schema evolution ticker */}
      <SchemaEvolutionTicker />

      {/* Cost panel */}
      <CostPanel />

      {/* Failure & recovery */}
      <FailureRecoveryPanel />

      {/* Multi-engine showcase */}
      <section className="broadcast-card overflow-hidden mb-8">
        <header className="broadcast-card-header">
          <div className="eyebrow">Compute is a choice</div>
          <h2 className="font-display text-xl font-extrabold text-[var(--ink-strong)] uppercase tracking-tight mt-0.5">
            Same Iceberg tables. Five engines. One query at a time.
          </h2>
          <p className="text-sm text-[var(--ink-muted)] mt-1">
            Pick a query engine &mdash; the SQL barely changes, but the operational, cost, and
            governance profile shifts dramatically. That choice belongs to the league office, not the vendor.
          </p>
        </header>

        <div className="px-5 pt-4 flex flex-wrap gap-2">
          {ENGINES.map((e) => (
            <button
              key={e.name}
              onClick={() => setActiveEngine(e)}
              className="px-3 py-2 rounded-sm text-xs font-display font-bold uppercase tracking-wider border transition-all"
              style={
                activeEngine.name === e.name
                  ? { background: ENGINE_COLORS[e.name], borderColor: ENGINE_COLORS[e.name], color: e.name === 'DuckDB' ? '#facc15' : '#ffffff' }
                  : { background: '#ffffff', color: 'var(--ink-muted)', borderColor: 'var(--hairline)' }
              }
            >
              {e.name}
              {e.status === 'active' && <span className="ml-1.5 text-[9px] opacity-80">● ACTIVE</span>}
            </button>
          ))}
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="md:col-span-2">
            <div className="text-[10px] uppercase tracking-wider text-[var(--ink-soft)] font-bold mb-2">Query</div>
            <pre className="rounded-sm p-4 text-[11.5px] leading-relaxed overflow-x-auto font-mono" style={{ background: 'var(--court-black)', color: 'var(--gold)' }}>
              <code>{activeEngine.sample_query}</code>
            </pre>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-[var(--ink-soft)] font-bold mb-2">Why this engine</div>
            <p className="text-sm text-[var(--ink)] leading-relaxed">{activeEngine.description}</p>
            <div className="mt-4 pt-4 border-t border-[var(--hairline-soft)]">
              <div className="text-[10px] uppercase tracking-wider text-[var(--ink-soft)] font-bold mb-1">Status</div>
              <div className="text-sm font-bold" style={{ color: activeEngine.status === 'active' ? '#16a34a' : '#6b7280' }}>
                {activeEngine.status === 'active' ? '● Primary engine — powers this site' : 'Compatible and ready to wire in'}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Iceberg catalog */}
      <section className="broadcast-card overflow-hidden mb-8">
        <header className="broadcast-card-header">
          <div className="eyebrow">Iceberg Catalog</div>
          <h2 className="font-display text-xl font-extrabold text-[var(--ink-strong)] uppercase tracking-tight mt-0.5">
            Every table on the lake, registered in AWS Glue
          </h2>
          <p className="text-sm text-[var(--ink-muted)] mt-1">
            Open metadata. Every engine reads the same schema, the same partition layout, the same
            row counts &mdash; without any single tool owning the source of truth.
          </p>
        </header>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm" style={{ fontVariantNumeric: 'tabular-nums' }}>
            <thead className="border-b border-[var(--hairline)]" style={{ background: 'var(--paper-deep)' }}>
              <tr>
                <Th>Layer</Th>
                <Th>Table</Th>
                <Th>Source</Th>
                <Th align="right">Rows</Th>
                <Th align="right">Size</Th>
                <Th align="right">Columns</Th>
                <Th>Partitions</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--hairline-soft)]">
              {tables.map((t) => (
                <tr key={`${t.database}.${t.table}`} className="hover:bg-[var(--paper-deep)] cursor-default">
                  <td className="px-4 py-2.5"><span className={`layer-chip ${t.database}`}>{t.database}</span></td>
                  <td className="px-4 py-2.5 font-mono text-[12px] text-[var(--ink-strong)]">{t.table}</td>
                  <td className="px-4 py-2.5 text-xs text-[var(--ink-muted)] font-mono">{t.source_system}</td>
                  <td className="px-4 py-2.5 text-right font-semibold text-[var(--ink-strong)]">{fmtNumber(t.rows)}</td>
                  <td className="px-4 py-2.5 text-right text-[var(--ink)]">{fmtBytes(t.bytes)}</td>
                  <td className="px-4 py-2.5 text-right text-[var(--ink-muted)]">{t.schema_columns}</td>
                  <td className="px-4 py-2.5 text-xs text-[var(--ink-muted)] font-mono">
                    {t.partitions.length ? t.partitions.join(', ') : <span className="text-[var(--ink-soft)]">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Before / After */}
      <BeforeAfterPanel />
    </div>
  );
}

// =============================================================================
// Helpers — shared sub-components
// =============================================================================

function Th({ children, align = 'left' }: { children: React.ReactNode; align?: 'left' | 'right' }) {
  return (
    <th className={`px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--ink-soft)] ${align === 'right' ? 'text-right' : 'text-left'}`}>
      {children}
    </th>
  );
}

function LayerDetail({ layer, stats, desc }: { layer: 'bronze' | 'silver' | 'gold'; stats: { tables: number; rows: number; bytes: number }; desc: string }) {
  return (
    <div className="border border-[var(--hairline)] rounded-sm p-3 bg-white">
      <div className="flex items-center justify-between mb-2">
        <span className={`layer-chip ${layer}`}>{layer}</span>
        <span className="text-[10px] text-[var(--ink-soft)] font-mono">{stats.tables} table{stats.tables === 1 ? '' : 's'}</span>
      </div>
      <div className="text-sm font-bold text-[var(--ink-strong)]" style={{ fontVariantNumeric: 'tabular-nums' }}>
        {fmtNumber(stats.rows)} rows · {fmtBytes(stats.bytes)}
      </div>
      <div className="text-[11px] text-[var(--ink-muted)] mt-1 leading-snug">{desc}</div>
    </div>
  );
}

// =============================================================================
// ThroughputHero — pulsing live counter "rows in motion today"
// =============================================================================
function ThroughputHero() {
  const [rowsToday, setRowsToday] = useState(6_842_017);
  useEffect(() => {
    const id = setInterval(() => setRowsToday((n) => n + 8 + Math.floor(Math.random() * 12)), 600);
    return () => clearInterval(id);
  }, []);
  const trend = [3.2, 3.4, 3.6, 3.5, 3.7, 4.0, 4.18];
  return (
    <section className="mb-8 grid grid-cols-1 md:grid-cols-[1.5fr_1fr_1fr_1fr] gap-3 sm:gap-4">
      <div className="broadcast-card p-5 sm:p-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 100% 0%, rgba(250,204,21,0.18), transparent 60%)' }} />
        <div className="relative">
          <div className="eyebrow" style={{ color: 'var(--gold-dim)' }}>● Live</div>
          <div className="mt-1 text-[10px] uppercase tracking-[0.18em] text-[var(--ink-soft)] font-bold">
            Rows in motion today
          </div>
          <div className="mt-2 font-display font-extrabold leading-none text-[var(--ink-strong)]"
               style={{ fontSize: 44, fontVariantNumeric: 'tabular-nums' }}>
            {rowsToday.toLocaleString()}
          </div>
          <div className="mt-2 text-xs text-[var(--ink-muted)]">across 4 sources · 22 Iceberg tables · CDC + streaming</div>
        </div>
      </div>
      <Kpi label="CDC freshness · p50" value="42s" sub="SQL Server source" />
      <Kpi label="Bronze → Gold lag · p99" value="6 min" sub="Within 10-min SLO" />
      <Kpi label="Connector uptime · 90d" value="99.97%" sub={<Sparklike values={trend} />} />
    </section>
  );
}

function Kpi({ label, value, sub }: { label: string; value: string; sub: React.ReactNode }) {
  return (
    <div className="broadcast-card p-4 sm:p-5">
      <div className="text-[10px] uppercase tracking-[0.16em] text-[var(--ink-soft)] font-bold">{label}</div>
      <div className="mt-1.5 font-display font-extrabold leading-none text-[var(--ink-strong)]"
           style={{ fontSize: 30, fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </div>
      <div className="mt-2 text-xs text-[var(--ink-muted)]">{sub}</div>
    </div>
  );
}

function Sparklike({ values }: { values: number[] }) {
  const max = Math.max(...values), min = Math.min(...values);
  const rng = max - min || 1;
  const w = 80, h = 18;
  const stepX = w / (values.length - 1);
  const pts = values.map((v, i) => `${(i * stepX).toFixed(1)},${(h - ((v - min) / rng) * h).toFixed(1)}`).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline points={pts} fill="none" stroke="var(--gold-dim)" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

// =============================================================================
// SchemaEvolutionTicker
// =============================================================================
const EVO_EVENTS = [
  { ts: '2026-05-24 06:14', op: 'ADD COLUMN load_index_7d',          table: 'silver.int_player_load',        ms: 38, models: 4 },
  { ts: '2026-05-23 22:01', op: 'RENAME COLUMN ts_str → tip_off_at',  table: 'bronze.raw_game_events',        ms: 22, models: 6 },
  { ts: '2026-05-22 14:47', op: 'WIDEN INT → BIGINT impressions',     table: 'silver.int_sponsorship_delivery', ms: 41, models: 2 },
  { ts: '2026-05-21 09:30', op: 'ADD COLUMN injury_risk_band',         table: 'gold.dim_players',              ms: 19, models: 8 },
  { ts: '2026-05-20 18:09', op: 'DROP COLUMN deprecated_play_kind',    table: 'bronze.raw_apex_tv_play_events', ms: 28, models: 3 },
];
function SchemaEvolutionTicker() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIdx((n) => (n + 1) % EVO_EVENTS.length), 4200);
    return () => clearInterval(id);
  }, []);
  const e = EVO_EVENTS[idx];
  return (
    <section className="mb-8 broadcast-card p-5 overflow-hidden relative" style={{ background: 'linear-gradient(90deg, #fff 0%, var(--paper-deep) 100%)' }}>
      <div className="absolute top-0 right-0 bottom-0 w-1.5" style={{ background: 'linear-gradient(180deg, var(--gold), var(--gold-dim))' }} />
      <div className="flex items-baseline justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="eyebrow" style={{ color: 'var(--gold-dim)' }}>Iceberg · Schema evolution</div>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm" style={{ color: '#16a34a', background: '#f0fdf4', border: '1px solid #a7f3d0' }}>
            ● Live feed
          </span>
        </div>
        <div className="font-mono text-[10px] text-[var(--ink-soft)]">last 5 schema changes</div>
      </div>
      <div className="mt-3 flex items-center gap-3 flex-wrap" style={{ fontVariantNumeric: 'tabular-nums' }}>
        <span className="font-mono text-[11px] text-[var(--ink-soft)]">{e.ts}</span>
        <span className="font-mono text-[13px] font-bold text-[var(--ink-strong)]">{e.op}</span>
        <span className="font-mono text-[12px] text-[var(--ink-muted)]">on {e.table}</span>
      </div>
      <div className="mt-2 flex items-center gap-4 text-[12px] text-[var(--ink-muted)] flex-wrap">
        <span><strong className="text-[var(--ink-strong)]">{e.ms} ms</strong> · metadata-only operation</span>
        <span>•</span>
        <span>0 data rewritten · 0 downtime</span>
        <span>•</span>
        <span><strong className="text-[var(--ink-strong)]">{e.models}</strong> downstream dbt models auto-revalidated</span>
      </div>
      <div className="mt-3 text-[11px] text-[var(--ink-soft)] leading-relaxed">
        Apache Iceberg treats schema changes as table metadata, not file rewrites. Same change in a
        legacy stats warehouse — an <code className="font-mono">ALTER TABLE ADD COLUMN</code> on a
        38 M-row tracking table — locks the table for ~6 minutes during the rewrite. In Iceberg:{' '}
        <strong>milliseconds, no lock</strong>.
      </div>
    </section>
  );
}

// =============================================================================
// CostPanel
// =============================================================================
function CostPanel() {
  return (
    <section className="mb-8 broadcast-card overflow-hidden">
      <header className="broadcast-card-header">
        <div className="flex items-baseline justify-between gap-4 flex-wrap">
          <div>
            <div className="eyebrow" style={{ color: 'var(--gold-dim)' }}>FinOps</div>
            <h2 className="font-display text-xl font-extrabold text-[var(--ink-strong)] uppercase tracking-tight mt-0.5">
              What this costs to run, every day
            </h2>
            <p className="text-sm text-[var(--ink-muted)] mt-1 max-w-3xl">
              Storage and compute billed separately. Storage is essentially free at this scale; compute scales
              with workload because Snowflake warehouses auto-suspend when no one is reading.
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider shrink-0" style={{ background: 'var(--gold)', color: 'var(--court-black)' }}>
            −68% vs legacy
          </div>
        </div>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[var(--hairline-soft)]">
        <CostTile label="Storage · per day"   value="$1.12"  sub="3.1 TB across bronze/silver/gold · S3 Standard-IA"  color="#16a34a" />
        <CostTile label="Compute · per day"   value="$5.40"  sub="Snowflake XS auto-suspend · dbt cloud · Athena ad-hoc" color="var(--gold-dim)" />
        <CostTile label="Per-1k rows landed"  value="$0.0009" sub="All-in CDC + transform + serve"                    color="#1d4e89" />
        <CostTile label="Equivalent legacy"   value="$17.80" sub="Internal benchmark · same data, warehouse-resident" color="#dc2626" />
      </div>
      <div className="px-5 py-3 border-t border-[var(--hairline-soft)] flex items-center justify-between text-[11px] text-[var(--ink-soft)]" style={{ background: 'var(--paper-deep)' }}>
        <span>Compute curve: 70% of spend is the 7 PM–11 PM game window. Idle hours bill at zero.</span>
        <span className="uppercase tracking-wider font-bold">Cost-attribution: per-warehouse + per-dbt-model</span>
      </div>
    </section>
  );
}

function CostTile({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div className="p-5">
      <div className="text-[10px] uppercase tracking-[0.16em] text-[var(--ink-soft)] font-bold">{label}</div>
      <div className="mt-2 font-display font-extrabold leading-none" style={{ fontSize: 30, color, fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </div>
      <div className="mt-2 text-xs text-[var(--ink-muted)] leading-snug">{sub}</div>
    </div>
  );
}

// =============================================================================
// FailureRecoveryPanel
// =============================================================================
function FailureRecoveryPanel() {
  return (
    <section className="mb-8 broadcast-card overflow-hidden">
      <header className="broadcast-card-header">
        <div className="eyebrow" style={{ color: '#b45309' }}>Resilience · Recovery</div>
        <h2 className="font-display text-xl font-extrabold text-[var(--ink-strong)] uppercase tracking-tight mt-0.5">
          What happens when a connector fails
        </h2>
        <p className="text-sm text-[var(--ink-muted)] mt-1 max-w-3xl">
          Every Fivetran connector has automatic retry with exponential backoff; failed rows land in a
          dead-letter queue for replay; dbt builds gate gold on green silver. Below: the last 30 days.
        </p>
      </header>
      <div className="grid grid-cols-2 md:grid-cols-4 divide-y-0 md:divide-x divide-[var(--hairline-soft)]">
        <RecoveryTile label="Retry policy"          big="exp 5×"   sub="2s · 8s · 30s · 2m · 8m, then DLQ" />
        <RecoveryTile label="Dead-letter · current" big="9"        sub="rows held · 6 telemetry, 3 stub dupe-key" color="#b45309" />
        <RecoveryTile label="MTTR · last 30d"       big="6 min"    sub="median · max 22 min during tracker cert rotation" />
        <RecoveryTile label="Last incident"         big="5 d ago"  sub="Replayed automatically in 4 min, zero data loss" color="#16a34a" />
      </div>
    </section>
  );
}

function RecoveryTile({ label, big, sub, color = 'var(--ink-strong)' }: { label: string; big: string; sub: string; color?: string }) {
  return (
    <div className="p-5">
      <div className="text-[10px] uppercase tracking-[0.16em] text-[var(--ink-soft)] font-bold">{label}</div>
      <div className="mt-1.5 font-display font-extrabold leading-none" style={{ fontSize: 26, color, fontVariantNumeric: 'tabular-nums' }}>
        {big}
      </div>
      <div className="mt-2 text-xs text-[var(--ink-muted)] leading-snug">{sub}</div>
    </div>
  );
}

// =============================================================================
// BeforeAfterPanel
// =============================================================================
function BeforeAfterPanel() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div className="broadcast-card p-6 border-l-4" style={{ borderLeftColor: '#dc2626' }}>
        <div className="eyebrow" style={{ color: '#dc2626' }}>Before · Legacy Stats Stack</div>
        <h3 className="mt-1 font-display text-xl font-extrabold text-[var(--ink-strong)] uppercase tracking-tight">14 hops · 3 copies of the bytes</h3>
        <pre className="font-mono text-[10.5px] leading-relaxed mt-4 p-3 rounded-sm overflow-x-auto" style={{ background: '#fef2f2', color: '#7f1d1d', border: '1px solid #fecaca' }}>{`Source → SFTP → Stitch → Snowflake (raw)
       → dbt → Snowflake (silver) → Snowflake (gold)
       → Census reverse-ETL → Hightouch → 3rd-party AI store
       → Looker materialised view → BI extract → scout laptop`}</pre>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div><div className="text-[var(--ink-soft)] text-xs">Copies of the data</div><div className="font-display text-2xl font-extrabold text-[var(--ink-strong)]">3</div></div>
          <div><div className="text-[var(--ink-soft)] text-xs">Avg end-to-end latency</div><div className="font-display text-2xl font-extrabold text-[var(--ink-strong)]">14 hr</div></div>
          <div><div className="text-[var(--ink-soft)] text-xs">Daily run-rate</div><div className="font-display text-2xl font-extrabold text-[var(--ink-strong)]">$17.80</div></div>
          <div><div className="text-[var(--ink-soft)] text-xs">Schema change</div><div className="font-display text-lg font-extrabold text-[var(--ink-strong)]">6-min lock</div></div>
        </div>
      </div>
      <div className="broadcast-card p-6 border-l-4" style={{ borderLeftColor: 'var(--gold)' }}>
        <div className="eyebrow" style={{ color: 'var(--gold-dim)' }}>After · Open Data Infrastructure</div>
        <h3 className="mt-1 font-display text-xl font-extrabold text-[var(--ink-strong)] uppercase tracking-tight">5 hops · 1 copy of the bytes</h3>
        <pre className="font-mono text-[10.5px] leading-relaxed mt-4 p-3 rounded-sm overflow-x-auto" style={{ background: '#fef9c3', color: '#713f12', border: '1px solid #fde047' }}>{`Source → Fivetran CDC → Iceberg bronze
       → dbt → Iceberg silver
       → dbt → Iceberg gold
       ↳ Snowflake · Athena · DuckDB · Trino · Spark
         (all reading the same bytes, no copies)`}</pre>
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div><div className="text-[var(--ink-soft)] text-xs">Copies of the data</div><div className="font-display text-2xl font-extrabold" style={{ color: 'var(--gold-dim)' }}>1</div></div>
          <div><div className="text-[var(--ink-soft)] text-xs">Avg end-to-end latency</div><div className="font-display text-2xl font-extrabold" style={{ color: 'var(--gold-dim)' }}>6 min</div></div>
          <div><div className="text-[var(--ink-soft)] text-xs">Daily run-rate</div><div className="font-display text-2xl font-extrabold" style={{ color: 'var(--gold-dim)' }}>$6.52</div></div>
          <div><div className="text-[var(--ink-soft)] text-xs">Schema change</div><div className="font-display text-lg font-extrabold" style={{ color: 'var(--gold-dim)' }}>milliseconds</div></div>
        </div>
      </div>
    </section>
  );
}
