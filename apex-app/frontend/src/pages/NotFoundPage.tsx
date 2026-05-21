import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-24 sm:px-6 lg:px-8 text-center">
      <div className="eyebrow mb-3">404</div>
      <h1 className="font-display text-5xl font-extrabold text-[var(--ink-strong)] tracking-tight">Off-court.</h1>
      <p className="mt-3 text-[var(--ink-muted)]">That page is not in the playbook.</p>
      <Link to="/" className="mt-8 inline-flex items-center gap-2 rounded-sm font-display font-bold uppercase tracking-wider text-sm text-[var(--court-black)] px-5 py-3" style={{ background: 'var(--gold)' }}>
        Back to home
      </Link>
    </div>
  );
}
