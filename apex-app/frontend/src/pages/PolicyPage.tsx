export default function PolicyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-8">
        <div className="eyebrow-crimson mb-1">League policy brief</div>
        <h1 className="font-display text-4xl font-extrabold text-[var(--ink-strong)] tracking-tight">Why sports data is fragmented — and what ODI fixes.</h1>
      </header>

      <section className="broadcast-card p-6 mb-8">
        <h2 className="font-display text-xl font-extrabold text-[var(--ink-strong)] uppercase tracking-tight mb-3">The problem</h2>
        <p className="text-[var(--ink-muted)] leading-relaxed">
          The professional sports business is a federation of independently-owned franchises plus a
          league office, layered on top of a media business, a sponsorship book, a regulated
          sportsbook program, and an audience that lives on every social platform at once. Each of
          those surfaces has its own vendor, its own data model, and its own SLA.
        </p>
        <p className="mt-3 text-[var(--ink-muted)] leading-relaxed">
          The result, by default, is six or seven warehouses that never speak. Ticketing data lives
          with the box-office vendor. Streaming telemetry lives with the OTT platform. Player
          tracking lives with the optical-system contractor. Sponsorship fulfillment lives in a
          pitch-deck PDF. Social listening is rented from a third party. Sportsbook handle data is
          locked behind partner APIs. Every analytics question becomes a six-team meeting.
        </p>
      </section>

      <section className="broadcast-card p-6 mb-8">
        <h2 className="font-display text-xl font-extrabold text-[var(--ink-strong)] uppercase tracking-tight mb-3">Why this matters at the league level</h2>
        <ul className="text-[var(--ink-muted)] leading-relaxed space-y-2 text-sm">
          <li>• <strong className="text-[var(--ink-strong)]">Fan identity is one person.</strong> The season-ticket holder who also subscribes to ApexTV and posts about a player on TikTok is one identity. If those three surfaces never join, retention plays fire blind.</li>
          <li>• <strong className="text-[var(--ink-strong)]">Integrity is a real-time problem.</strong> Anomalous betting patterns have to be detected in seconds, not in next-quarter's report. That requires sportsbook handle, line moves, social sentiment, and player tracking landing in the same governed surface.</li>
          <li>• <strong className="text-[var(--ink-strong)]">Player health spans data domains.</strong> Load management blends optical tracking, biometric trends, schedule, travel, and post-game social mentions. No single warehouse owns all of that.</li>
          <li>• <strong className="text-[var(--ink-strong)]">Sponsorship ROI is a chain of custody.</strong> Proving Vantage Auto delivered 1.2B banner impressions requires evidence from three broadcast feeds, two social platforms, and the in-venue activations system. The fulfillment proof has to be reproducible from raw bytes.</li>
        </ul>
      </section>

      <section className="broadcast-card p-6 mb-8" style={{ borderColor: 'var(--gold)' }}>
        <div className="eyebrow mb-2" style={{ color: 'var(--gold-dim)' }}>The ODI bridge</div>
        <h2 className="font-display text-xl font-extrabold text-[var(--ink-strong)] uppercase tracking-tight mb-3">One lake. Every signal.</h2>
        <p className="text-[var(--ink-muted)] leading-relaxed">
          Fivetran lands every source — ticketing, CRM, streaming, player tracking, sponsorship,
          social, sportsbook — into the league office's own S3 bucket as Apache Iceberg tables.
          dbt builds the silver and gold layers. Snowflake reads the same Iceberg tables. Cortex
          agents read the same gold tables an analyst would. The fan identity graph, the integrity
          signals, the load-management recommendations, and the sponsorship fulfillment proof all
          query one governed surface.
        </p>
        <p className="mt-3 text-[var(--ink-muted)] leading-relaxed">
          Open table format means the league can swap compute as workloads evolve. It can give a
          data-science contractor read-only DuckDB access to one Iceberg prefix without granting
          warehouse credentials. It can audit a historical integrity flag at the exact partition
          snapshot the agent saw, because Iceberg time-travel is part of the spec, not a vendor
          feature.
        </p>
      </section>

      <section className="broadcast-card p-6">
        <h2 className="font-display text-xl font-extrabold text-[var(--ink-strong)] uppercase tracking-tight mb-3">What the league gets, concretely</h2>
        <ul className="text-[var(--ink-muted)] leading-relaxed space-y-2 text-sm">
          <li>1. <strong className="text-[var(--ink-strong)]">One fan identity</strong> across ticketing, ApexTV, and social — gold.fct_apex_tv_subscriber_health joined to gold.fct_ticket_demand on subscriber_id.</li>
          <li>2. <strong className="text-[var(--ink-strong)]">Real-time integrity</strong> — gold.fct_integrity_signals updated within seconds of every wager from every sportsbook partner.</li>
          <li>3. <strong className="text-[var(--ink-strong)]">Auditable lineage</strong> — every chart on this site traces to a bronze raw row through dbt to a gold table. Iceberg snapshots give time-travel for free.</li>
          <li>4. <strong className="text-[var(--ink-strong)]">No vendor lock-in</strong> — the lake outlives the compute. Snowflake today, Trino tomorrow, DuckDB on a laptop forever.</li>
        </ul>
      </section>
    </div>
  );
}
