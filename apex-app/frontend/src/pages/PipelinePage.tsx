import { useEffect, useMemo, useState } from 'react';
import { api, fmtNumber } from '../api/queries';
import type { Pipeline } from '../types';

type FailureKey = 'connectors' | 's3_iceberg' | 'dbt' | 'snowflake';

export default function PipelinePage() {
  const [data, setData] = useState<Pipeline | null>(null);
  const [failures, setFailures] = useState<Set<FailureKey>>(new Set());

  useEffect(() => { api.getPipeline().then(setData).catch(() => {}); }, []);

  const toggle = (k: FailureKey) => setFailures((p) => { const n = new Set(p); n.has(k) ? n.delete(k) : n.add(k); return n; });

  const layers = useMemo(() => ({
    connectors: failures.has('connectors')
      ? { ok: false, status: 'sync failed', detail: 'Fivetran connector layer', failureDetail: 'Simulated: Ticketmaster connector rate-limited on box-office sync. 11 of 11 connectors otherwise healthy. Retry in 12m.' }
      : { ok: true, status: 'on schedule', detail: 'Fivetran · 11 connectors across ticketing, CRM, streaming, social, sportsbook. Sync window 15 minutes.' },
    s3_iceberg: failures.has('s3_iceberg')
      ? { ok: false, status: 'commit failed', detail: 'S3 + AWS Glue Iceberg catalog', failureDetail: 'Simulated: Glue catalog returned 503 during last Iceberg commit on raw_apex_tv_play_events. Last good snapshot held; replay queued.' }
      : { ok: true, status: 'committed', detail: 'apex-odi-lake bucket. 22 Iceberg tables across bronze, silver, gold.' },
    dbt: failures.has('dbt')
      ? { ok: false, status: 'run failed', detail: 'dbt build — integrity signals gold model', failureDetail: 'Simulated: model compilation failed. Test "unique_flag_id" returned 2 failures in silver.stg_sportsbook_wagers. Held the gold deploy.' }
      : { ok: true, status: 'last run passed', detail: 'dbt build completed 8m ago. 13 silver + 6 gold models passed all tests.' },
    snowflake: failures.has('snowflake')
      ? { ok: false, status: 'query failed', detail: 'Snowflake reading Iceberg externals', failureDetail: 'Simulated: warehouse APEX_AGENTS_XS hit credit limit on the integrity-agent query. Auto-suspend triggered. Scale out queued.' }
      : { ok: true, status: 'operational', detail: 'Warehouse APEX_AGENTS_M serving Cortex agents. Avg query 1.8s on Iceberg gold.' },
  }), [failures]);

  const anyDown = !Object.values(layers).every((l) => l.ok);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-8 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <div className="eyebrow mb-1">Pipeline operations</div>
          <h1 className="font-display text-4xl font-extrabold text-[var(--ink-strong)] tracking-tight">Bronze → silver → gold</h1>
          <p className="mt-2 text-[var(--ink-muted)] max-w-2xl">
            The four-stage build, the connector list, and a failure simulator. Toggle a layer to
            see how a presenter walks through observability without making it real.
          </p>
        </div>
        <div className={`status-pill ${anyDown ? 'bear' : 'bull'}`}>{anyDown ? 'Demo · incident in flight' : 'All systems operational'}</div>
      </header>

      {/* Layer cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
        <LayerCard k="connectors" title="01 · Fivetran connectors" state={layers.connectors} onToggle={toggle} />
        <LayerCard k="s3_iceberg" title="02 · S3 + Iceberg" state={layers.s3_iceberg} onToggle={toggle} />
        <LayerCard k="dbt"        title="03 · dbt (silver + gold)" state={layers.dbt} onToggle={toggle} />
        <LayerCard k="snowflake"  title="04 · Snowflake + Cortex" state={layers.snowflake} onToggle={toggle} />
      </section>

      {/* Layer flow stats */}
      <section className="mb-10">
        <h2 className="font-display text-2xl font-extrabold text-[var(--ink-strong)] border-b border-[var(--hairline)] pb-2 mb-4 uppercase tracking-tight">Row counts through the lake</h2>
        <div className="broadcast-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[var(--paper-deep)] text-[10px] font-display font-bold uppercase tracking-wider text-[var(--ink-soft)]">
              <tr>
                <th className="text-left px-4 py-2">Layer</th>
                <th className="text-right px-4 py-2">Rows in</th>
                <th className="text-right px-4 py-2">Rows out</th>
                <th className="text-right px-4 py-2">Tables</th>
                <th className="text-left px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--hairline-soft)]">
              {(data?.layers ?? []).map((l) => (
                <tr key={l.layer}>
                  <td className="px-4 py-2"><span className={`layer-chip ${l.layer === 'connector' ? 'bronze' : l.layer}`}>{l.layer}</span></td>
                  <td className="px-4 py-2 text-right stat-mono">{fmtNumber(l.rows_in)}</td>
                  <td className="px-4 py-2 text-right stat-mono">{fmtNumber(l.rows_out)}</td>
                  <td className="px-4 py-2 text-right stat-mono">{l.tables}</td>
                  <td className="px-4 py-2"><span className="status-pill bull">{l.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Connectors */}
      <section>
        <h2 className="font-display text-2xl font-extrabold text-[var(--ink-strong)] border-b border-[var(--hairline)] pb-2 mb-4 uppercase tracking-tight">Fivetran connectors</h2>
        <div className="broadcast-card overflow-hidden bg-[var(--court-black)] text-white">
          <table className="w-full text-sm">
            <thead className="text-[10px] font-display font-bold uppercase tracking-wider text-white/60 bg-white/5">
              <tr>
                <th className="text-left px-4 py-2">Source</th>
                <th className="text-left px-4 py-2">Connector ID</th>
                <th className="text-right px-4 py-2">Rows · 24h</th>
                <th className="text-left px-4 py-2">Last sync</th>
                <th className="text-left px-4 py-2">Status</th>
                <th className="text-left px-4 py-2">Fivetran</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {(data?.connectors ?? []).map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-2 font-display font-bold uppercase tracking-wide">{c.name}</td>
                  <td className="px-4 py-2 font-mono text-[11px] text-[var(--gold)]">{c.fivetran_id}</td>
                  <td className="px-4 py-2 text-right stat-mono">{fmtNumber(c.rows_24h)}</td>
                  <td className="px-4 py-2 text-[11px] text-white/60 stat-mono">{new Date(c.last_sync).toLocaleString()}</td>
                  <td className="px-4 py-2"><span className="status-pill bull">{c.status}</span></td>
                  <td className="px-4 py-2">
                    <a
                      href={`https://fivetran.com/dashboard/connectors/${c.fivetran_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="fivetran-cta inline-flex items-center gap-1 text-[10px] font-display font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm border border-[var(--gold)]/40 text-[var(--gold)] transition-colors"
                    >
                      Open in Fivetran
                      <svg viewBox="0 0 12 12" className="h-2.5 w-2.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                        <path d="M2 10 L10 2M6 2h4v4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </a>
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

function LayerCard({ k, title, state, onToggle }: { k: FailureKey; title: string; state: { ok: boolean; status: string; detail: string; failureDetail?: string }; onToggle: (k: FailureKey) => void }) {
  return (
    <div className="broadcast-card p-5 flex flex-col">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-display text-base font-extrabold text-[var(--ink-strong)] uppercase tracking-tight">{title}</h3>
        <span className={`status-pill ${state.ok ? 'bull' : 'bear'}`}>{state.status}</span>
      </div>
      <p className="text-sm text-[var(--ink-muted)] leading-relaxed flex-1">{state.detail}</p>
      {!state.ok && state.failureDetail && (
        <div className="mt-3 text-[12px] bg-[var(--bear-bg)] border border-[#fecaca] rounded-sm p-2 text-[var(--bear)] leading-relaxed">
          {state.failureDetail}
        </div>
      )}
      <button
        onClick={() => onToggle(k)}
        className="mt-3 text-[10px] font-display font-bold uppercase tracking-wider self-start px-2.5 py-1 rounded-sm border border-[var(--hairline)] hover:border-[var(--gold)] hover:bg-[var(--gold-bg)] text-[var(--ink-muted)] hover:text-[var(--ink-strong)] transition-colors"
      >
        {state.ok ? 'Simulate failure' : 'Restore'}
      </button>
    </div>
  );
}
