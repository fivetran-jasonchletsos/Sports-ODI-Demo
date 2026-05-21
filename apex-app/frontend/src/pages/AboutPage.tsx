export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Canonical ODI Story block — copied verbatim from FinServ-ODI-Demo / AboutPage */}
      <section className="broadcast-card p-6 mb-10" style={{ borderColor: 'var(--gold)' }}>
        <div className="eyebrow mb-2" style={{ color: 'var(--gold-dim)' }}>The ODI Story</div>
        <h2 className="font-display text-3xl font-extrabold tracking-tight text-[var(--ink-strong)]">
          Data infrastructure for agents you trust.
        </h2>
        <p className="mt-3 text-[var(--ink-muted)] leading-relaxed">
          <em>"MDS was optimized for humans. ODI is designed for a future with humans and
          production agents at scale."</em> This demo is one instance of that architecture:
          Fivetran's 750+ connectors and Managed Data Lake Service (MDLS) land data into open
          table formats; dbt transformations build the governed semantic layer; multiple compute
          engines and AI agents read the same gold tables.
        </p>
        <a
          href="https://fivetran-jasonchletsos.github.io/Fivetran-Demo-Repository/story/"
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex items-center gap-1 text-sm font-bold hover:underline font-display uppercase tracking-wider"
          style={{ color: 'var(--gold-dim)' }}
        >
          Read the full ODI Story →
        </a>
      </section>

      <header className="mb-8">
        <div className="eyebrow mb-1">League-office reference architecture</div>
        <h1 className="font-display text-4xl font-extrabold tracking-tight text-[var(--ink-strong)]">About Apex Sports League</h1>
        <p className="mt-3 text-[var(--ink-muted)] leading-relaxed">
          Apex Sports League is a fictional 24-franchise professional sports league with a league-owned
          streaming service (ApexTV, 14M subscribers), an integrated sportsbook partnership program,
          and a sponsorship book exceeding $1.8B YTD. This site is a reference build that shows how a
          league office and a VP of Ticketing &amp; Fan Engagement run their day on Fivetran ODI: every
          source landed once in customer-owned Iceberg tables on S3, dbt building the governed gold
          layer, Snowflake and Cortex agents reading the same surface.
        </p>
      </header>

      <section className="mt-10">
        <h2 className="font-display text-2xl font-extrabold text-[var(--ink-strong)] border-b border-[var(--hairline)] pb-2 mb-4 uppercase tracking-tight">What this demo shows</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PILLARS.map((p) => (
            <div key={p.title} className="broadcast-card p-5">
              <div className="layer-chip gold inline-flex mb-3">{p.tag}</div>
              <h3 className="font-display text-lg font-extrabold text-[var(--ink-strong)] uppercase tracking-tight">{p.title}</h3>
              <p className="mt-1 text-sm text-[var(--ink-muted)] leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-2xl font-extrabold text-[var(--ink-strong)] border-b border-[var(--hairline)] pb-2 mb-4 uppercase tracking-tight">Audience</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="broadcast-card p-5">
            <div className="eyebrow mb-2">Persona 1</div>
            <h3 className="font-display text-lg font-extrabold text-[var(--ink-strong)] uppercase tracking-tight">Chief Data Officer · league office</h3>
            <p className="mt-2 text-sm text-[var(--ink-muted)] leading-relaxed">
              Owns the governance perimeter across ticketing, streaming, player tracking, sponsorship,
              social, and sportsbook. Needs every agent and every analyst reading from one governed gold
              layer with full lineage back to source.
            </p>
          </div>
          <div className="broadcast-card p-5">
            <div className="eyebrow mb-2">Persona 2</div>
            <h3 className="font-display text-lg font-extrabold text-[var(--ink-strong)] uppercase tracking-tight">VP Ticketing &amp; Fan Engagement</h3>
            <p className="mt-2 text-sm text-[var(--ink-muted)] leading-relaxed">
              Runs primary + secondary ticketing, season-ticket renewal, no-show reduction, and the
              dynamic pricing agent. Lives in ApexTV churn cohort analysis and the streaming personalization
              loop because the fan is one identity across both surfaces.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-2xl font-extrabold text-[var(--ink-strong)] border-b border-[var(--hairline)] pb-2 mb-4 uppercase tracking-tight">Tech stack</h2>
        <div className="broadcast-card p-5">
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
            {STACK.map((s) => (
              <li key={s.name} className="flex items-start gap-3">
                <div className="layer-chip silver shrink-0 mt-0.5">{s.layer}</div>
                <div className="min-w-0">
                  <div className="font-display font-extrabold text-[var(--ink-strong)] uppercase tracking-tight">{s.name}</div>
                  <div className="text-xs text-[var(--ink-muted)]">{s.note}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-2xl font-extrabold text-[var(--ink-strong)] border-b border-[var(--hairline)] pb-2 mb-4 uppercase tracking-tight">ODI vs MDS</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="broadcast-card p-5">
            <div className="eyebrow mb-2">Traditional MDS</div>
            <h3 className="font-display text-lg font-extrabold text-[var(--ink-strong)] uppercase tracking-tight">Warehouse-centric</h3>
            <ul className="mt-3 space-y-2 text-sm text-[var(--ink-muted)]">
              <li>• Single proprietary warehouse owns storage and compute</li>
              <li>• Data exits via expensive egress or replication</li>
              <li>• Compute engine choice locked to vendor roadmap</li>
              <li>• Customer pays for storage twice (lake plus warehouse)</li>
              <li>• Agents reach data through a warehouse round-trip</li>
            </ul>
          </div>
          <div className="broadcast-card p-5" style={{ borderColor: 'var(--gold)' }}>
            <div className="eyebrow mb-2" style={{ color: 'var(--gold-dim)' }}>Open Data Infrastructure</div>
            <h3 className="font-display text-lg font-extrabold text-[var(--ink-strong)] uppercase tracking-tight">Open lake-centric</h3>
            <ul className="mt-3 space-y-2 text-sm text-[var(--ink)]">
              <li>• Customer owns the storage layer (S3 + Iceberg)</li>
              <li>• Any compute engine — Snowflake, Athena, Trino, Spark, DuckDB</li>
              <li>• Catalog is open (Glue, Polaris, Nessie)</li>
              <li>• Pay once for storage; swap compute as workloads evolve</li>
              <li>• Cortex agents read gold-layer Iceberg directly, with lineage</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mt-10 rounded-sm bg-[var(--paper-deep)] border border-[var(--hairline)] p-5 text-sm text-[var(--ink)]">
        <div className="eyebrow mb-2" style={{ color: 'var(--caution)' }}>Disclaimer</div>
        <p className="text-[var(--ink-muted)] leading-relaxed">
          <strong className="text-[var(--ink-strong)]">All data shown is synthetic.</strong>{' '}
          Apex Sports League, ApexTV, ApexTrack, the 24 franchises, the players, and the sponsors
          are invented for this demonstration. No portion of this site reflects any real league,
          team, person, or sponsor.
        </p>
      </section>
    </div>
  );
}

const PILLARS = [
  { tag: 'Pillar 1', title: 'Customer-owned storage',
    body: 'Every source (Ticketmaster, StubHub, SFMC, ApexTV, ApexTrack, sponsorship, social, sportsbook) lands in the league office S3 bucket as Apache Iceberg tables. Fivetran writes; the league reads with any engine.' },
  { tag: 'Pillar 2', title: 'Open table format',
    body: 'Iceberg v2 provides ACID, schema evolution, time-travel, and partition evolution. The integrity desk can audit historical bet patterns at any prior snapshot without an export.' },
  { tag: 'Pillar 3', title: 'Any compute. Same data.',
    body: 'Snowflake queries the same files dbt writes. Add Athena, Trino, or DuckDB for the data-science workbench without re-ingesting a single row. Cortex agents read gold directly.' },
];

const STACK = [
  { layer: 'Ingest',     name: 'Fivetran',                 note: '750+ connectors covering ticketing, CRM, streaming, social, sportsbook.' },
  { layer: 'Storage',    name: 'Amazon S3',                note: 'apex-odi-lake bucket holds bronze / silver / gold prefixes.' },
  { layer: 'Format',     name: 'Apache Iceberg v2',        note: 'Parquet, ZSTD-compressed, AWS Glue catalog.' },
  { layer: 'Catalog',    name: 'AWS Glue Data Catalog',    note: 'Iceberg REST + table-level access control.' },
  { layer: 'Transform',  name: 'dbt',                      note: 'Bronze · silver · gold semantic layer. 22 tested Iceberg-native models.' },
  { layer: 'Query',      name: 'Snowflake',                note: 'Reads Iceberg externals directly. Same SQL would run on Trino or Athena.' },
  { layer: 'Agents',     name: 'Snowflake Cortex',         note: 'Pricing, content, load, ROI, integrity agents reading gold-layer tables.' },
  { layer: 'Frontend',   name: 'React 19 + Vite + Tailwind v4', note: 'Static SPA on GitHub Pages reading JSON snapshot of gold.' },
];
