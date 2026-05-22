import { useEffect, useState } from 'react';
import { api, fmtNumber, fmtBytes } from '../api/queries';
import type { IcebergTable } from '../types';

const SOURCES = [
  { name: 'Ticketmaster', kind: 'Primary ticketing', desc: 'Box-office, season tickets, on-sale events, holds, comp seats, group sales.', rows: '84M / season' },
  { name: 'StubHub', kind: 'Secondary ticketing', desc: 'Listings, transfers, sold listings, last-trade pricing, fee structure.', rows: '15M / season' },
  { name: 'Salesforce Marketing Cloud', kind: 'Fan CRM + journeys', desc: 'Fan identity graph, journey events, email + SMS + push consent.', rows: '8M / day' },
  { name: 'ApexTV streaming telemetry', kind: 'Streaming product', desc: 'Play events, heartbeat, completion, device, bitrate, drop-off positions.', rows: '143M / day' },
  { name: 'ApexTrack player tracking', kind: 'On-court optical', desc: 'Hawk-Eye / Statcast-style anonymized feed. 250k points per player per game.', rows: '38M / day' },
  { name: 'Sponsorship management system', kind: 'Contract + delivery', desc: 'Contract terms, activation calendar, impression counts, in-venue execution proof.', rows: '184k / day' },
  { name: 'X / Twitter, Instagram, Reddit, TikTok', kind: 'Social listening', desc: 'Posts, mentions, sentiment, engagement, controversy alerts.', rows: '18M / day' },
  { name: 'Sportsbook partner feeds', kind: 'Regulated betting', desc: 'Wagers, lines, line moves, integrity signal candidates.', rows: '25M / day' },
];

export default function ArchitecturePage() {
  const [tables, setTables] = useState<IcebergTable[]>([]);
  useEffect(() => { api.getIceberg().then((r) => setTables(r.tables)).catch(() => {}); }, []);

  const groups = { bronze: [] as IcebergTable[], silver: [] as IcebergTable[], gold: [] as IcebergTable[] };
  for (const t of tables) groups[t.database].push(t);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-10">
        <div className="eyebrow mb-2">ODI Reference Architecture</div>
        <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-[var(--ink-strong)] tracking-tight">
          Sources, lake, compute, agents.
        </h1>
        <p className="mt-3 text-[var(--ink-muted)] max-w-3xl leading-relaxed">
          Eight source domains. One open lake. dbt builds the gold semantic layer. Snowflake reads
          the same Iceberg tables a Trino notebook or a Cortex agent would. The diagram below mirrors
          the actual table list a presenter can show the league CDO.
        </p>
      </header>

      {/* Architecture diagram */}
      <section className="broadcast-card overflow-hidden mb-10">
        <div className="broadcast-card-header flex items-center justify-between">
          <div className="eyebrow">Reference flow</div>
          <span className="text-[10px] font-bold text-[var(--ink-soft)] uppercase tracking-wider font-display">Sources → Lake → Compute → Agents</span>
        </div>
        <div className="p-6 bg-[var(--paper)]">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-stretch">
            <Stage tag="01 · Sources" tone="bronze" title="Eight source domains" body="Ticketing (primary + secondary), CRM, streaming, player tracking, sponsorship, social, sportsbook." />
            <Stage tag="02 · Ingest" tone="bronze" title="Fivetran" body="Custom + native connectors writing raw bronze Iceberg tables into S3 via the AWS Glue catalog." />
            <Stage tag="03 · Transform" tone="silver" title="dbt — silver and gold" body="Conformed entities (dim_teams, dim_players, dim_games) and business facts (fct_ticket_demand, fct_apex_tv_subscriber_health, fct_integrity_signals)." />
            <Stage tag="04 · Reason" tone="gold" title="Snowflake + Cortex agents" body="Snowflake reads Iceberg directly. Cortex agents (pricing, content, load, ROI, integrity) read the same gold tables an analyst would." />
          </div>
        </div>
      </section>

      {/* Sources */}
      <section className="mb-10">
        <h2 className="font-display text-2xl font-extrabold text-[var(--ink-strong)] border-b border-[var(--hairline)] pb-2 mb-4 uppercase tracking-tight">Sources</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {SOURCES.map((s) => (
            <div key={s.name} className="broadcast-card p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--gold-dim)] font-display">{s.kind}</div>
                  <h3 className="font-display text-lg font-extrabold text-[var(--ink-strong)] uppercase tracking-tight mt-1">{s.name}</h3>
                </div>
                <span className="status-pill neutral stat-mono">{s.rows}</span>
              </div>
              <p className="mt-2 text-sm text-[var(--ink-muted)] leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Iceberg table list */}
      <section className="mb-10">
        <h2 className="font-display text-2xl font-extrabold text-[var(--ink-strong)] border-b border-[var(--hairline)] pb-2 mb-4 uppercase tracking-tight">Iceberg tables</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {(['bronze', 'silver', 'gold'] as const).map((layer) => (
            <div key={layer} className="broadcast-card overflow-hidden">
              <div className="broadcast-card-header flex items-center justify-between">
                <span className={`layer-chip ${layer}`}>{layer}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--ink-soft)] font-display">{groups[layer].length} tables</span>
              </div>
              <ul className="divide-y divide-[var(--hairline-soft)]">
                {groups[layer].map((t) => (
                  <li key={t.table} className="px-4 py-3">
                    <div className="font-mono text-[12px] font-bold text-[var(--ink-strong)]">{t.table}</div>
                    <div className="mt-1 flex items-center gap-3 text-[11px] text-[var(--ink-soft)] stat-mono">
                      <span>{fmtNumber(t.rows)} rows</span>
                      <span>·</span>
                      <span>{fmtBytes(t.bytes)}</span>
                      <span>·</span>
                      <span>{t.schema_columns} cols</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Compute engines */}
      <section>
        <h2 className="font-display text-2xl font-extrabold text-[var(--ink-strong)] border-b border-[var(--hairline)] pb-2 mb-4 uppercase tracking-tight">Compute engines</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Engine name="Snowflake" status="primary" desc="Reads the gold-layer Iceberg externals. Powers the league office BI and the Cortex agent layer." sample="SELECT * FROM fct_integrity_signals WHERE severity = 'high';" />
          <Engine name="AWS Athena" status="available" desc="Ad-hoc queries from the data-eng team. Same Iceberg files, no extraction." sample="SELECT team_id, AVG(no_show_rate) FROM fct_ticket_demand GROUP BY team_id;" />
          <Engine name="DuckDB" status="demo" desc="Analyst notebook on a laptop reading the same Iceberg partition. Zero infra." sample="SELECT * FROM iceberg_scan('s3://apex-odi-lake/gold/fct_team_performance');" />
        </div>
      </section>
    </div>
  );
}

function Stage({ tag, tone, title, body }: { tag: string; tone: 'bronze' | 'silver' | 'gold'; title: string; body: string }) {
  return (
    <div className="bg-white border border-[var(--hairline)] rounded-sm p-4 flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <span className={`layer-chip ${tone}`}>{tone}</span>
        <span className="text-[10px] font-mono font-bold text-[var(--ink-soft)]">{tag}</span>
      </div>
      <h3 className="font-display text-lg font-extrabold text-[var(--ink-strong)] uppercase tracking-tight">{title}</h3>
      <p className="mt-2 text-xs text-[var(--ink-muted)] leading-relaxed flex-1">{body}</p>
    </div>
  );
}

function Engine({ name, status, desc, sample }: { name: string; status: string; desc: string; sample: string }) {
  return (
    <div className="broadcast-card p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-extrabold text-[var(--ink-strong)] uppercase tracking-tight">{name}</h3>
        <span className="status-pill gold">{status}</span>
      </div>
      <p className="mt-2 text-sm text-[var(--ink-muted)] leading-relaxed">{desc}</p>
      <pre className="mt-3 text-[11px] bg-[var(--court-black)] text-[var(--gold)] p-3 rounded-sm overflow-x-auto font-mono">{sample}</pre>
    </div>
  );
}
