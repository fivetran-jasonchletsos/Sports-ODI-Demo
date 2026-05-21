// Apex Sports League — gold-layer dbt model contracts.

export interface Summary {
  generated_at: string;
  source: 'live' | 'demo';
  league_name: string;
  season: string;
  total_teams: number;
  regular_season_attendance: number;
  regular_season_attendance_yoy: number;
  avg_ticket_price_usd: number;
  avg_ticket_price_yoy: number;
  apex_tv_subscribers: number;
  apex_tv_subscribers_yoy: number;
  apex_tv_avg_concurrent: number;
  sponsorship_revenue_ytd_usd: number;
  sponsorship_revenue_yoy: number;
  social_followers_total: number;
  social_followers_yoy: number;
  top_trending_player: {
    player_id: string;
    name: string;
    team_id: string;
    trend_score: number;
    mentions_24h: number;
  };
  iceberg_table_count: number;
  s3_bytes: number;
  last_sync_at: string | null;
  annual_revenue_usd: number;
  sportsbook_handle_ytd_usd: number;
  sportsbook_handle_yoy: number;
}

export interface Team {
  team_id: string;
  city: string;
  name: string;
  market: string;
  state: string;
  conference: string;
  lat: number;
  lon: number;
  avg_attendance: number;
  attendance_yoy_pct: number;
  capacity: number;
  sellout_rate: number;
  apex_tv_avg_viewers: number;
  local_broadcast_rating: number;
  sponsorship_inventory_sold_pct: number;
  payroll_usd: number;
  salary_cap_usd: number;
  wins: number;
  losses: number;
  win_pct: number;
  social_followers: number;
  season_ticket_renewal_rate: number;
  no_show_rate: number;
}

export interface TeamsResponse {
  generated_at: string;
  teams: Team[];
}

export interface PricingRec {
  team_id: string;
  game_id: string;
  current_price: number;
  recommended_price: number;
  lift_pct: number;
  rationale: string;
}

export interface DemandGame {
  game_id: string;
  date: string;
  home_team_id: string;
  away_team_id: string;
  matchup: string;
  venue: string;
  demand_index: number;
  current_avg_price_usd: number;
  agent_recommended_price_usd: number;
  expected_attendance: number;
  capacity: number;
}

export interface Tickets {
  generated_at: string;
  season_ticket_avg_retention: number;
  league_avg_no_show: number;
  markets: { team_id: string; city: string; avg_primary_usd: number; avg_secondary_usd: number; secondary_premium_pct: number }[];
  top_demand_games: DemandGame[];
  agent_pricing_recommendations: PricingRec[];
  agent_name: string;
  agent_decisions_24h: number;
  agent_revenue_lift_ytd_usd: number;
}

export interface Streaming {
  generated_at: string;
  subscribers_total: number;
  subscribers_yoy: number;
  monthly_churn_pct: number;
  cac_usd: number;
  ltv_usd: number;
  ltv_cac_ratio: number;
  arpu_usd_monthly: number;
  avg_concurrent_viewers: number;
  peak_concurrent_24h: number;
  top_concurrent_games: { game_id: string; matchup: string; concurrent_peak: number; total_minutes_watched: number; completion_rate: number }[];
  cohort_a_churn_spike: {
    cohort: string;
    current_churn_pct: number;
    baseline_churn_pct: number;
    delta_pct_points: number;
    subscribers_at_risk: number;
    estimated_arr_at_risk_usd: number;
    agent_action: string;
  };
  content_agent: { name: string; personalized_recs_24h: number; click_through_rate: number; avg_session_lift_minutes: number };
  personalization_agent: { name: string; highlight_reels_per_user_daily: number; watch_completion_rate: number; sample_recommendation: string };
}

export interface Player {
  player_id: string;
  name: string;
  team_id: string;
  team_name: string;
  position: string;
  jersey: number;
  apex_metric: number;
  apex_metric_rank: number;
  minutes_played: number;
  load_index: number;
  injury_status: string;
  biometric_trend: string;
  social_mentions_24h: number;
}

export interface PlayerPerf {
  generated_at: string;
  tracking_system: string;
  players_tracked: number;
  data_points_per_player_per_game: number;
  top_50: Player[];
  injury_list_count: number;
  load_management_agent: {
    name: string;
    rest_recommendations_24h: number;
    recommendations: { player_id: string; name: string; team_id: string; rest_days_recommended: number; rationale: string }[];
  };
}

export interface Sponsor {
  sponsor_id: string;
  name: string;
  tier: string;
  category: string;
  annual_value_usd: number;
  contract_years_remaining: number;
  fulfillment_pct: number;
  banner_impressions_ytd: number;
  social_mentions_ytd: number;
  in_venue_activations_ytd: number;
  roi_score: number;
}

export interface Sponsorship {
  generated_at: string;
  total_sponsorship_revenue_ytd_usd: number;
  active_partners: number;
  top_30: Sponsor[];
  roi_agent: { name: string; audits_24h: number; flagged_underdelivery: number; flagged_overdelivery: number; recommendation: string };
}

export interface SocialSentiment {
  generated_at: string;
  platforms_monitored: string[];
  posts_processed_24h: number;
  trending_players: { player_id: string; name: string; team_id: string; mentions_24h: number; sentiment_score: number; primary_topic: string }[];
  team_sentiment: { team_id: string; name: string; sentiment_volume_24h: number; sentiment_score: number; trend_7d_pct: number }[];
  controversy_alerts: { id: string; team_id: string; subject: string; summary: string; severity: string; first_detected: string }[];
}

export interface IntegrityFlag {
  flag_id: string;
  severity: string;
  game_id: string;
  matchup: string;
  market: string;
  summary: string;
  detected_at: string;
  status: string;
}

export interface Sportsbook {
  generated_at: string;
  partner_count: number;
  handle_ytd_usd: number;
  handle_yoy: number;
  hold_pct: number;
  top_markets: { market: string; handle_ytd_usd: number; yoy: number }[];
  integrity_agent: {
    name: string;
    wagers_scored_24h: number;
    flagged_24h: number;
    high_severity_open: number;
    flags: IntegrityFlag[];
    false_positive_rate: number;
    avg_detection_latency_seconds: number;
  };
}

export interface PipelineLayer {
  layer: 'connector' | 'bronze' | 'silver' | 'gold';
  rows_in: number;
  rows_out: number;
  tables: number;
  last_run: string;
  status: 'ok' | 'running' | 'failed';
}

export interface PipelineConnector {
  id: string;
  name: string;
  service: string;
  last_sync: string;
  rows_24h: number;
  status: string;
}

export interface Pipeline {
  generated_at: string;
  layers: PipelineLayer[];
  connectors: PipelineConnector[];
}

export interface IcebergTable {
  database: 'bronze' | 'silver' | 'gold';
  table: string;
  rows: number;
  bytes: number;
  partitions: string[];
  source_system: string;
  last_updated_at: string;
  schema_columns: number;
}

export interface IcebergResponse {
  generated_at: string;
  tables: IcebergTable[];
}
