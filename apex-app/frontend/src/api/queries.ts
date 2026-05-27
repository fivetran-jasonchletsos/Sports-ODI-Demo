// API helpers — read the gold layer from the gold-layer build.

import type {
  Summary, TeamsResponse, Tickets, Streaming, PlayerPerf,
  Sponsorship, SocialSentiment, Sportsbook, Pipeline, IcebergResponse,
} from '../types';

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

async function fetchJson<T>(path: string): Promise<T> {
  const url = `${BASE}${path}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return (await res.json()) as T;
}

const cache = new Map<string, unknown>();
async function load<T>(path: string): Promise<T> {
  if (cache.has(path)) return cache.get(path) as T;
  const data = await fetchJson<T>(path);
  cache.set(path, data);
  return data;
}

export const api = {
  getSummary:      () => load<Summary>('/data/summary.json'),
  getTeams:        () => load<TeamsResponse>('/data/teams.json'),
  getTickets:      () => load<Tickets>('/data/tickets.json'),
  getStreaming:    () => load<Streaming>('/data/streaming.json'),
  getPlayerPerf:   () => load<PlayerPerf>('/data/player_perf.json'),
  getSponsorship:  () => load<Sponsorship>('/data/sponsorship.json'),
  getSocial:       () => load<SocialSentiment>('/data/social_sentiment.json'),
  getSportsbook:   () => load<Sportsbook>('/data/sportsbook.json'),
  getPipeline:     () => load<Pipeline>('/data/pipeline.json'),
  getIceberg:      () => load<IcebergResponse>('/data/iceberg.json'),
};

export function fmtNumber(n: number | null | undefined): string {
  if (n == null || Number.isNaN(n)) return '—';
  return new Intl.NumberFormat('en-US').format(Math.round(n));
}

export function fmtCurrency(n: number | null | undefined): string {
  if (n == null || Number.isNaN(n)) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

export function fmtCurrencyShort(n: number | null | undefined): string {
  if (n == null || Number.isNaN(n)) return '—';
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000_000) return `$${(n / 1_000_000_000_000).toFixed(2)}T`;
  if (abs >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(abs >= 100_000_000_000 ? 0 : 1)}B`;
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(abs >= 100_000_000 ? 0 : 1)}M`;
  if (abs >= 1_000) return `$${Math.round(n / 1_000)}k`;
  return `$${Math.round(n)}`;
}

export function fmtNumberShort(n: number | null | undefined): string {
  if (n == null || Number.isNaN(n)) return '—';
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return `${Math.round(n)}`;
}

export function fmtPct(n: number | null | undefined, digits = 1): string {
  if (n == null || Number.isNaN(n)) return '—';
  const pct = n * 100;
  return `${pct >= 0 ? '+' : ''}${pct.toFixed(digits)}%`;
}

export function fmtPctPlain(n: number | null | undefined, digits = 1): string {
  if (n == null || Number.isNaN(n)) return '—';
  return `${(n * 100).toFixed(digits)}%`;
}

export function fmtBytes(n: number | null | undefined): string {
  if (n == null || Number.isNaN(n)) return '—';
  const abs = Math.abs(n);
  if (abs >= 1024 ** 4) return `${(n / 1024 ** 4).toFixed(2)} TB`;
  if (abs >= 1024 ** 3) return `${(n / 1024 ** 3).toFixed(2)} GB`;
  if (abs >= 1024 ** 2) return `${(n / 1024 ** 2).toFixed(1)} MB`;
  return `${n} B`;
}
