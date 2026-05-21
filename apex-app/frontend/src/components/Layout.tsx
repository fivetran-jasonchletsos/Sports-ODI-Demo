import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';

const NAV: [string, string][] = [
  ['/', 'Home'],
  ['/ticketing', 'Ticketing'],
  ['/streaming', 'ApexTV'],
  ['/players', 'Player Perf'],
  ['/sponsorship', 'Sponsorship'],
  ['/integrity', 'Integrity'],
  ['/architecture', 'Architecture'],
  ['/pipeline', 'Pipeline'],
  ['/policy', 'Policy'],
  ['/about', 'About'],
];

const DEMOS = [
  { key: 'sports',         name: 'Apex Sports League',   industry: 'Pro sports + media',                   url: 'https://fivetran-jasonchletsos.github.io/Sports-ODI-Demo/', accent: '#facc15' },
  { key: 'finserv',        name: 'Meridian Capital',     industry: 'Financial Services',                   url: 'https://fivetran-jasonchletsos.github.io/FinServ-ODI-Demo/', accent: '#1d4ed8' },
  { key: 'insurance',      name: 'Atlas Risk',           industry: 'Insurance',                            url: 'https://fivetran-jasonchletsos.github.io/Insurance-ODI-Demo/', accent: '#0369a1' },
  { key: 'healthcare',     name: 'Epic Clarity',         industry: 'Healthcare',                           url: 'https://fivetran-jasonchletsos.github.io/Healthcare-EPIC-Snowflake-Demo/', accent: '#0d9488' },
  { key: 'media',          name: 'Lighthouse Media',     industry: 'Media',                                url: 'https://fivetran-jasonchletsos.github.io/Media-ODI-Demo/', accent: '#7c3aed' },
  { key: 'retail',         name: 'Storefront Analytics', industry: 'Retail / e-commerce',                  url: 'https://fivetran-jasonchletsos.github.io/RetailEcom-ODI-Demo/', accent: '#ea580c' },
  { key: 'techsaas',       name: 'SaaS Pulse',           industry: 'SaaS analytics',                       url: 'https://fivetran-jasonchletsos.github.io/TechSaaS-ODI-Demo/', accent: '#059669' },
  { key: 'supplychain',    name: 'Manifest',             industry: 'Supply chain',                         url: 'https://fivetran-jasonchletsos.github.io/SupplyChain-ODI-Demo/', accent: '#0891b2' },
  { key: 'lifesci',        name: 'Cohort',               industry: 'Life sciences',                        url: 'https://fivetran-jasonchletsos.github.io/LifeSci-ODI-Demo/', accent: '#be185d' },
  { key: 'tax',            name: 'Allegheny County Tax', industry: 'Public sector',                        url: 'https://fivetran-jasonchletsos.github.io/tax-assessment-databricks-demo/', accent: '#dc2626' },
];
const CURRENT = 'sports';

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  return (
    <div className="min-h-full flex flex-col bg-[var(--paper)]">
      <div className="broadcast-rail" />

      <header className="bg-[var(--court-black)] text-white sticky top-0 z-30 border-b border-white/5">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
          <div className="flex h-16 sm:h-18 items-center justify-between gap-2 sm:gap-6">
            <Link to="/" className="flex items-center gap-3 shrink-0 min-w-0 group">
              <div className="h-10 w-10 rounded-sm flex items-center justify-center" style={{ background: 'var(--gold)' }}>
                <ApexMark className="h-6 w-6 text-[var(--court-black)]" />
              </div>
              <div className="leading-tight min-w-0">
                <div className="font-display font-extrabold text-xl sm:text-2xl tracking-tight truncate text-white">
                  APEX SPORTS LEAGUE
                </div>
                <div className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--gold)]">
                  League Office · Data Intelligence
                </div>
              </div>
            </Link>

            <nav className="hidden xl:flex items-center gap-0.5 text-sm">
              {NAV.map(([to, label]) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) =>
                    `relative px-2.5 py-2 font-display font-semibold uppercase tracking-wider text-[12px] transition-colors ${
                      isActive ? 'text-[var(--gold)]' : 'text-white/75 hover:text-white'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {label}
                      {isActive && <span className="absolute left-2.5 right-2.5 -bottom-[2px] h-[2px]" style={{ background: 'var(--gold)' }} />}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center gap-1 sm:gap-2">
              <DemoSwitcher />
              <button
                type="button"
                onClick={() => setMobileOpen((o) => !o)}
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                className="xl:hidden h-9 w-9 inline-flex items-center justify-center rounded-sm text-white/80 hover:bg-white/10"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                  {mobileOpen ? <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" /> : <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />}
                </svg>
              </button>
            </div>
          </div>

          {mobileOpen && (
            <div className="xl:hidden pb-4 border-t border-white/10 pt-3">
              <nav className="grid grid-cols-2 gap-1 text-sm">
                {NAV.map(([to, label]) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={to === '/'}
                    className={({ isActive }) =>
                      `px-3 py-2 rounded-sm text-center font-display font-semibold uppercase tracking-wider border ${
                        isActive ? 'bg-[var(--gold)] text-[var(--court-black)] border-[var(--gold)]' : 'border-white/15 text-white/80 hover:bg-white/10'
                      }`
                    }
                  >
                    {label}
                  </NavLink>
                ))}
              </nav>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-[var(--hairline)] bg-[var(--court-black)] text-white/80 mt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-7 w-7 rounded-sm flex items-center justify-center" style={{ background: 'var(--gold)' }}>
                <ApexMark className="h-4 w-4 text-[var(--court-black)]" />
              </div>
              <div className="font-display font-extrabold text-white text-lg">APEX SPORTS LEAGUE</div>
            </div>
            <p className="leading-relaxed text-white/60">
              League-office data intelligence built on Fivetran Open Data Infrastructure.
              All data shown is synthetic. Apex Sports League is a fictional 24-team league.
            </p>
          </div>
          <div>
            <div className="eyebrow-light mb-2">Data Pipeline</div>
            <p className="leading-relaxed text-white/70">
              Ticketing, streaming, player tracking, sponsorship, social, sportsbook
              into S3 + Apache Iceberg via Fivetran. dbt builds bronze, silver, gold.
              Snowflake reads the same Iceberg tables. Cortex powers the agents.
            </p>
          </div>
          <div>
            <div className="eyebrow-light mb-2">Open Standards</div>
            <p className="leading-relaxed text-white/70">
              Apache Iceberg, AWS Glue Catalog, ANSI SQL, dbt semantic layer.
              Any compute engine. No lock-in. Agents read the same gold tables humans do.
            </p>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 text-[11px] text-white/50 flex flex-col sm:flex-row gap-1 sm:items-center sm:justify-between">
            <div>2026 Apex Sports League ODI Demo · Fivetran Open Data Infrastructure</div>
            <div>Synthetic data · For demonstration only</div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function DemoSwitcher() {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [open]);
  return (
    <div ref={wrapRef} className="relative hidden sm:block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider border bg-[var(--gold)]/15 text-[var(--gold)] border-[var(--gold)]/30 hover:bg-[var(--gold)]/25"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold)] animate-pulse" />
        Snapshot
        <svg viewBox="0 0 24 24" className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-[280px] rounded-sm border border-[var(--hairline)] bg-white shadow-xl z-40 overflow-hidden">
          <div className="px-3 pt-3 pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--ink-soft)] border-b border-[var(--hairline)]">
            Switch demo
          </div>
          <div className="py-1 max-h-[420px] overflow-y-auto">
            {DEMOS.map((d) => {
              const current = d.key === CURRENT;
              const inner = (
                <div className="flex items-center gap-2.5 px-3 py-2">
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: d.accent }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-[var(--ink-strong)] truncate">{d.name}</div>
                    <div className="text-[11px] text-slate-500 truncate">{d.industry}</div>
                  </div>
                  {current && (
                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm bg-slate-100 text-slate-600 border border-slate-200">
                      Current
                    </span>
                  )}
                </div>
              );
              return current
                ? <div key={d.key} className="opacity-60 cursor-default">{inner}</div>
                : <a key={d.key} href={d.url} className="block hover:bg-slate-50 transition-colors" onClick={() => setOpen(false)}>{inner}</a>;
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function ApexMark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 2 L22 21 L2 21 Z" />
      <circle cx="12" cy="16" r="2.5" fill="var(--gold)" />
    </svg>
  );
}
