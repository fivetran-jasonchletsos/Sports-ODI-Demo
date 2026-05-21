#!/usr/bin/env python3
"""Generate synthetic JSON snapshots for the Apex Sports League ODI demo.

All data is invented. Team names, player names, sponsor names, and metrics
do not correspond to any real league, franchise, or person.
"""
import json
import math
import random
from datetime import datetime, timezone
from pathlib import Path

random.seed(42)
OUT = Path(__file__).resolve().parent.parent / "apex-app" / "frontend" / "public" / "data"
OUT.mkdir(parents=True, exist_ok=True)
NOW = datetime.now(timezone.utc).isoformat()

TEAMS = [
    {"id": "BAY", "city": "Bay Area",      "name": "Argonauts",  "state": "CA", "lat": 37.78, "lon": -122.42, "conf": "West"},
    {"id": "DEN", "city": "Denver",        "name": "Sentinels",  "state": "CO", "lat": 39.74, "lon": -104.99, "conf": "West"},
    {"id": "AUS", "city": "Austin",        "name": "Lonestars",  "state": "TX", "lat": 30.27, "lon": -97.74,  "conf": "South"},
    {"id": "HOU", "city": "Houston",       "name": "Voyagers",   "state": "TX", "lat": 29.76, "lon": -95.37,  "conf": "South"},
    {"id": "MIA", "city": "Miami",         "name": "Tides",      "state": "FL", "lat": 25.76, "lon": -80.19,  "conf": "South"},
    {"id": "ATL", "city": "Atlanta",       "name": "Foundry",    "state": "GA", "lat": 33.75, "lon": -84.39,  "conf": "South"},
    {"id": "NSH", "city": "Nashville",     "name": "Pickers",    "state": "TN", "lat": 36.16, "lon": -86.78,  "conf": "South"},
    {"id": "CHI", "city": "Chicago",       "name": "Ironworks",  "state": "IL", "lat": 41.88, "lon": -87.63,  "conf": "Central"},
    {"id": "DET", "city": "Detroit",       "name": "Assembly",   "state": "MI", "lat": 42.33, "lon": -83.05,  "conf": "Central"},
    {"id": "MSP", "city": "Twin Cities",   "name": "Northstars", "state": "MN", "lat": 44.98, "lon": -93.27,  "conf": "Central"},
    {"id": "KCM", "city": "Kansas City",   "name": "Stockyards", "state": "MO", "lat": 39.10, "lon": -94.58,  "conf": "Central"},
    {"id": "STL", "city": "St. Louis",     "name": "Riverkings", "state": "MO", "lat": 38.63, "lon": -90.20,  "conf": "Central"},
    {"id": "PHX", "city": "Phoenix",       "name": "Coyotes FC", "state": "AZ", "lat": 33.45, "lon": -112.07, "conf": "West"},
    {"id": "LAX", "city": "Los Angeles",   "name": "Mavericks",  "state": "CA", "lat": 34.05, "lon": -118.24, "conf": "West"},
    {"id": "SEA", "city": "Seattle",       "name": "Tidewater",  "state": "WA", "lat": 47.61, "lon": -122.33, "conf": "West"},
    {"id": "POR", "city": "Portland",      "name": "Cascades",   "state": "OR", "lat": 45.51, "lon": -122.68, "conf": "West"},
    {"id": "BOS", "city": "Boston",        "name": "Harborfront","state": "MA", "lat": 42.36, "lon": -71.06,  "conf": "East"},
    {"id": "NYC", "city": "New York",      "name": "Bridges",    "state": "NY", "lat": 40.71, "lon": -74.01,  "conf": "East"},
    {"id": "PHI", "city": "Philadelphia",  "name": "Liberty",    "state": "PA", "lat": 39.95, "lon": -75.17,  "conf": "East"},
    {"id": "WAS", "city": "Washington",    "name": "Monuments",  "state": "DC", "lat": 38.91, "lon": -77.04,  "conf": "East"},
    {"id": "CLT", "city": "Charlotte",     "name": "Hornets FC", "state": "NC", "lat": 35.23, "lon": -80.84,  "conf": "South"},
    {"id": "ORL", "city": "Orlando",       "name": "Starliners", "state": "FL", "lat": 28.54, "lon": -81.38,  "conf": "South"},
    {"id": "TOR", "city": "Toronto",       "name": "Sovereigns", "state": "ON", "lat": 43.65, "lon": -79.38,  "conf": "East"},
    {"id": "MTL", "city": "Montreal",      "name": "Royale",     "state": "QC", "lat": 45.50, "lon": -73.57,  "conf": "East"},
]

assert len(TEAMS) == 24

# ---------- summary.json ----------
summary = {
    "generated_at": NOW,
    "source": "demo",
    "league_name": "Apex Sports League",
    "season": "2025-26",
    "total_teams": 24,
    "regular_season_attendance": 5_214_800,
    "regular_season_attendance_yoy": 0.041,
    "avg_ticket_price_usd": 78.40,
    "avg_ticket_price_yoy": 0.063,
    "apex_tv_subscribers": 14_120_000,
    "apex_tv_subscribers_yoy": 0.182,
    "apex_tv_avg_concurrent": 612_400,
    "sponsorship_revenue_ytd_usd": 1_842_000_000,
    "sponsorship_revenue_yoy": 0.094,
    "social_followers_total": 184_500_000,
    "social_followers_yoy": 0.121,
    "top_trending_player": {
        "player_id": "P-2041",
        "name": "Marcus Reaves",
        "team_id": "DEN",
        "trend_score": 94.7,
        "mentions_24h": 412_800,
    },
    "iceberg_table_count": 22,
    "s3_bytes": 4_812_300_000_000,
    "last_sync_at": NOW,
    "annual_revenue_usd": 11_000_000_000,
    "sportsbook_handle_ytd_usd": 9_420_000_000,
    "sportsbook_handle_yoy": 0.236,
}
(OUT / "summary.json").write_text(json.dumps(summary, indent=2))

# ---------- teams.json ----------
teams_data = []
for i, t in enumerate(TEAMS):
    rng = random.Random(hash(t["id"]) & 0xFFFFFFFF)
    wins = rng.randint(8, 34)
    losses = 42 - wins
    base_att = rng.randint(14000, 21500)
    att_yoy = round(rng.uniform(-0.08, 0.14), 3)
    teams_data.append({
        "team_id": t["id"],
        "city": t["city"],
        "name": t["name"],
        "market": f"{t['city']}, {t['state']}",
        "state": t["state"],
        "conference": t["conf"],
        "lat": t["lat"],
        "lon": t["lon"],
        "avg_attendance": base_att,
        "attendance_yoy_pct": att_yoy,
        "capacity": rng.randint(17000, 24500),
        "sellout_rate": round(rng.uniform(0.42, 0.98), 3),
        "apex_tv_avg_viewers": rng.randint(180_000, 1_240_000),
        "local_broadcast_rating": round(rng.uniform(0.6, 4.2), 2),
        "sponsorship_inventory_sold_pct": round(rng.uniform(0.61, 0.99), 3),
        "payroll_usd": rng.randint(78_000_000, 184_000_000),
        "salary_cap_usd": 165_000_000,
        "wins": wins,
        "losses": losses,
        "win_pct": round(wins / 42, 3),
        "social_followers": rng.randint(820_000, 14_200_000),
        "season_ticket_renewal_rate": round(rng.uniform(0.71, 0.94), 3),
        "no_show_rate": round(rng.uniform(0.06, 0.22), 3),
    })
teams_data.sort(key=lambda x: -x["win_pct"])
(OUT / "teams.json").write_text(json.dumps({"generated_at": NOW, "teams": teams_data}, indent=2))

# ---------- tickets.json ----------
markets = [{"team_id": t["team_id"], "city": t["city"], "avg_primary_usd": round(random.uniform(48, 142), 2),
            "avg_secondary_usd": round(random.uniform(58, 220), 2),
            "secondary_premium_pct": round(random.uniform(0.08, 0.62), 3)} for t in teams_data]

games = []
matchups = [(teams_data[i], teams_data[(i+1) % 24]) for i in range(20)]
for i, (home, away) in enumerate(matchups):
    base = random.uniform(60, 240)
    games.append({
        "game_id": f"G-{2600+i}",
        "date": f"2026-0{(i % 5)+1}-{(i % 27)+1:02d}",
        "home_team_id": home["team_id"],
        "away_team_id": away["team_id"],
        "matchup": f"{away['name']} at {home['name']}",
        "venue": f"{home['city']} Arena",
        "demand_index": round(random.uniform(72, 99), 1),
        "current_avg_price_usd": round(base, 2),
        "agent_recommended_price_usd": round(base * random.uniform(1.04, 1.34), 2),
        "expected_attendance": random.randint(16500, 22800),
        "capacity": random.randint(17500, 24500),
    })

pricing_recs = [
    {"team_id": "BAY", "game_id": "G-2608", "current_price": 88.00, "recommended_price": 112.00,
     "lift_pct": 0.273, "rationale": "Bay Argonauts vs Denver Sentinels — secondary market trading 38% premium; concurrent live demand signal +2.1 sigma; tier-A premium suites already 96% sold."},
    {"team_id": "NYC", "game_id": "G-2611", "current_price": 142.00, "recommended_price": 168.00,
     "lift_pct": 0.183, "rationale": "Bridges home opener — weather forecast clear, no competing local events, social anticipation index trending +47% week-over-week."},
    {"team_id": "MIA", "game_id": "G-2604", "current_price": 96.00, "recommended_price": 84.00,
     "lift_pct": -0.125, "rationale": "Tides midweek — soft demand cohort, no-show rate trending 19% in section 200s. Discount lifts paid attendance and concession revenue projection."},
    {"team_id": "TOR", "game_id": "G-2613", "current_price": 74.00, "recommended_price": 92.00,
     "lift_pct": 0.243, "rationale": "Sovereigns vs Montreal Royale rivalry — historic 98% sellout, secondary pricing already at 2.4x face value 72 hours out."},
    {"team_id": "DEN", "game_id": "G-2606", "current_price": 102.00, "recommended_price": 138.00,
     "lift_pct": 0.353, "rationale": "Sentinels with Marcus Reaves return from injury — social mention velocity 4.2x normal, secondary market last-trade $186."},
]

tickets = {
    "generated_at": NOW,
    "season_ticket_avg_retention": 0.821,
    "league_avg_no_show": 0.118,
    "markets": markets,
    "top_demand_games": games,
    "agent_pricing_recommendations": pricing_recs,
    "agent_name": "Apex Ticket Pricing Agent v2.4",
    "agent_decisions_24h": 1_842,
    "agent_revenue_lift_ytd_usd": 28_400_000,
}
(OUT / "tickets.json").write_text(json.dumps(tickets, indent=2))

# ---------- streaming.json ----------
top_streams = []
for i, t in enumerate(teams_data[:10]):
    top_streams.append({
        "game_id": f"S-{3100+i}",
        "matchup": f"{t['name']} home broadcast",
        "concurrent_peak": random.randint(420_000, 1_840_000),
        "total_minutes_watched": random.randint(38_000_000, 124_000_000),
        "completion_rate": round(random.uniform(0.62, 0.91), 3),
    })

streaming = {
    "generated_at": NOW,
    "subscribers_total": 14_120_000,
    "subscribers_yoy": 0.182,
    "monthly_churn_pct": 0.034,
    "cac_usd": 28.40,
    "ltv_usd": 412.00,
    "ltv_cac_ratio": 14.5,
    "arpu_usd_monthly": 14.99,
    "avg_concurrent_viewers": 612_400,
    "peak_concurrent_24h": 2_140_000,
    "top_concurrent_games": top_streams,
    "cohort_a_churn_spike": {
        "cohort": "Cohort A · 2025-Q3 acquired via Tier-3 markets",
        "current_churn_pct": 0.072,
        "baseline_churn_pct": 0.034,
        "delta_pct_points": 3.8,
        "subscribers_at_risk": 142_800,
        "estimated_arr_at_risk_usd": 25_700_000,
        "agent_action": "Personalization agent surfacing highlight reels from 5 favorite teams + free preview of Apex+ tier for 30 days.",
    },
    "content_agent": {
        "name": "ApexTV Content Recommendation Agent v3.1",
        "personalized_recs_24h": 18_400_000,
        "click_through_rate": 0.247,
        "avg_session_lift_minutes": 11.4,
    },
    "personalization_agent": {
        "name": "ApexTV Personalization Agent v2.0",
        "highlight_reels_per_user_daily": 4.2,
        "watch_completion_rate": 0.71,
        "sample_recommendation": "Subscriber S-218492 (Denver market, Sentinels season-pass holder) — surfacing 4-minute Marcus Reaves highlight reel and condensed Sentinels vs Argonauts game from 2 nights ago.",
    },
}
(OUT / "streaming.json").write_text(json.dumps(streaming, indent=2))

# ---------- player_perf.json ----------
first_names = ["Marcus", "Devon", "Kai", "Jaylen", "Tobias", "Andre", "Rafael", "Ezekiel", "Jamarion", "Quincy",
               "Mateo", "Lucian", "Davion", "Tariq", "Bennett", "Cyrus", "Roman", "Ezra", "Khalil", "Soren",
               "Nikolai", "Pascal", "Theo", "Gideon", "Holden", "Felix", "Augustin", "Mauricio", "Reese", "Anders",
               "Bjorn", "Caleb", "Diego", "Emiliano", "Finn", "Hayden", "Idris", "Jericho", "Kelvin", "Lars",
               "Maxim", "Nolan", "Otis", "Preston", "Quentin", "Rowan", "Silas", "Tate", "Uriel", "Vance"]
last_names = ["Reaves", "Okafor", "Sterling", "Vasquez", "Chen", "Adebayo", "Lindqvist", "Moreau", "Petrov", "Yamamoto",
              "Castellanos", "Hayward", "Ofori", "Bjornsson", "Diallo", "Marchetti", "Konstantinou", "Singh", "Aronov", "Velasquez",
              "Foster", "Holloway", "Rasmussen", "Toussaint", "Mwangi", "Larsen", "Espinoza", "Sundgren", "Ndiaye", "Carmichael",
              "Beaumont", "Cisneros", "Donovan", "Eklund", "Fontaine", "Galarraga", "Hartwell", "Inozemtsev", "Jorgensen", "Korhonen",
              "LaSalle", "Maitland", "Naranjo", "Ostrowski", "Pendergast", "Quintero", "Ramberg", "Stenhouse", "Thibodeau", "Underwood"]

players = []
for i in range(50):
    rng = random.Random(i + 1000)
    team = rng.choice(teams_data)
    fn = first_names[i]
    ln = last_names[i]
    players.append({
        "player_id": f"P-{2000+i}",
        "name": f"{fn} {ln}",
        "team_id": team["team_id"],
        "team_name": team["name"],
        "position": rng.choice(["F", "G", "C", "D", "M"]),
        "jersey": rng.randint(1, 99),
        "apex_metric": round(rng.uniform(12.4, 38.7), 1),
        "apex_metric_rank": i + 1,
        "minutes_played": rng.randint(420, 1840),
        "load_index": round(rng.uniform(0.42, 0.97), 3),
        "injury_status": rng.choices(["healthy", "questionable", "out", "day-to-day"], weights=[70, 12, 8, 10])[0],
        "biometric_trend": rng.choice(["stable", "rising fatigue", "improving recovery", "spike detected"]),
        "social_mentions_24h": rng.randint(2_400, 412_800),
    })
players.sort(key=lambda p: -p["apex_metric"])
for i, p in enumerate(players):
    p["apex_metric_rank"] = i + 1

load_mgmt_recs = [
    {"player_id": "P-2041", "name": "Marcus Reaves", "team_id": "DEN", "rest_days_recommended": 1,
     "rationale": "Load index 0.94 (97th percentile season). Biometric HRV trending -12% over 5-day window. Next game low-stakes vs CLT (currently 11-31). Recommend rest; projected playoff EV gain +0.4 wins."},
    {"player_id": "P-2007", "name": "Devon Okafor", "team_id": "BAY", "rest_days_recommended": 0,
     "rationale": "Load index 0.81 with stable recovery markers. Cleared for full minutes vs Phoenix Coyotes FC."},
    {"player_id": "P-2018", "name": "Kai Sterling", "team_id": "NYC", "rest_days_recommended": 2,
     "rationale": "Returning from hamstring (out 9 days). Optical tracking shows asymmetric stride pattern in walkthrough — recommend 2 additional rehab days before live action."},
    {"player_id": "P-2033", "name": "Rafael Vasquez", "team_id": "MIA", "rest_days_recommended": 1,
     "rationale": "Spike in collision frequency last 3 games (+34% vs baseline). Preventive rest recommended; team has favorable matchup margin."},
]

player_perf = {
    "generated_at": NOW,
    "tracking_system": "ApexTrack optical (synthetic, anonymized)",
    "players_tracked": 612,
    "data_points_per_player_per_game": 250_000,
    "top_50": players,
    "injury_list_count": sum(1 for p in players if p["injury_status"] in ("out", "questionable")),
    "load_management_agent": {
        "name": "Apex Load Management Agent v1.6",
        "rest_recommendations_24h": 14,
        "recommendations": load_mgmt_recs,
    },
}
(OUT / "player_perf.json").write_text(json.dumps(player_perf, indent=2))

# ---------- sponsorship.json ----------
sponsor_names = [
    "Vantage Auto", "Northrise Bank", "Pacific Insurance", "Stellar Wireless", "Pinnacle Air",
    "Coastline Beverage", "Summit Energy", "Atlas Logistics", "Beacon Mortgage", "Quantum Health",
    "Lumen Apparel", "Falcon Foods", "Granite Capital", "Horizon Hotels", "Ironclad Software",
    "Juno Streaming", "Keystone Pharma", "Lighthouse Retail", "Meridian Watches", "Nimbus Cloud",
    "Olympus Athletic", "Pioneer Outdoor", "Quartz Spirits", "Redwood Builders", "Sapphire Jewelers",
    "Tempest Energy Drinks", "Umbra Telecom", "Vertex Fitness", "Westmark Realty", "Zenith Eyewear",
]
sponsors = []
for i, n in enumerate(sponsor_names):
    rng = random.Random(i + 5000)
    val = rng.randint(2_400_000, 48_000_000)
    sponsors.append({
        "sponsor_id": f"SP-{100+i}",
        "name": n,
        "tier": rng.choices(["League partner", "Official sponsor", "Team sponsor"], weights=[3, 7, 14])[0],
        "category": rng.choice(["Automotive", "Financial", "Telecom", "Beverage", "Apparel", "Healthcare", "Travel", "Technology", "Energy", "Retail"]),
        "annual_value_usd": val,
        "contract_years_remaining": rng.randint(1, 5),
        "fulfillment_pct": round(rng.uniform(0.62, 1.0), 3),
        "banner_impressions_ytd": rng.randint(48_000_000, 1_840_000_000),
        "social_mentions_ytd": rng.randint(8_400, 412_000),
        "in_venue_activations_ytd": rng.randint(12, 184),
        "roi_score": round(rng.uniform(1.4, 4.8), 2),
    })
sponsors.sort(key=lambda s: -s["annual_value_usd"])

sponsorship = {
    "generated_at": NOW,
    "total_sponsorship_revenue_ytd_usd": 1_842_000_000,
    "active_partners": 248,
    "top_30": sponsors,
    "roi_agent": {
        "name": "Apex Sponsorship ROI Agent v1.3",
        "audits_24h": 612,
        "flagged_underdelivery": 8,
        "flagged_overdelivery": 14,
        "recommendation": "Vantage Auto contract trending 14% underdelivered on banner impressions — recommend adding 2 broadcast windows + 6 social posts to cure by Q3. Pinnacle Air overdelivered 22% on activations — opportunity to renegotiate renewal at +18% with documented value proof.",
    },
}
(OUT / "sponsorship.json").write_text(json.dumps(sponsorship, indent=2))

# ---------- social_sentiment.json ----------
trending_players = []
for p in sorted(players, key=lambda x: -x["social_mentions_24h"])[:10]:
    trending_players.append({
        "player_id": p["player_id"],
        "name": p["name"],
        "team_id": p["team_id"],
        "mentions_24h": p["social_mentions_24h"],
        "sentiment_score": round(random.uniform(-0.4, 0.92), 3),
        "primary_topic": random.choice(["game performance", "trade rumor", "highlight clip", "off-field news", "injury update"]),
    })

team_sentiment = []
for t in teams_data:
    rng = random.Random(hash(t["team_id"] + "sent") & 0xFFFFFFFF)
    team_sentiment.append({
        "team_id": t["team_id"],
        "name": t["name"],
        "sentiment_volume_24h": rng.randint(14_000, 412_000),
        "sentiment_score": round(rng.uniform(-0.3, 0.78), 3),
        "trend_7d_pct": round(rng.uniform(-0.32, 0.41), 3),
    })

controversies = [
    {"id": "C-411", "team_id": "PHI", "subject": "Liberty front-office decision",
     "summary": "Coaching staff change announcement generated -0.42 sentiment shift; mention volume +218% over 6 hours.",
     "severity": "elevated", "first_detected": "2026-05-19T22:14:00Z"},
    {"id": "C-412", "team_id": "LAX", "subject": "Officiating dispute",
     "summary": "End-of-game call vs Mavericks drawing sustained negative sentiment; volume normalizing after 48h.",
     "severity": "moderate", "first_detected": "2026-05-18T03:42:00Z"},
    {"id": "C-413", "team_id": "DEN", "subject": "Player health concern",
     "summary": "Marcus Reaves visible discomfort in 2nd half — sentiment positive but anxious; agent flagged for player perf desk.",
     "severity": "moderate", "first_detected": "2026-05-20T01:08:00Z"},
]

social = {
    "generated_at": NOW,
    "platforms_monitored": ["X/Twitter", "Instagram", "Reddit", "TikTok"],
    "posts_processed_24h": 18_400_000,
    "trending_players": trending_players,
    "team_sentiment": team_sentiment,
    "controversy_alerts": controversies,
}
(OUT / "social_sentiment.json").write_text(json.dumps(social, indent=2))

# ---------- sportsbook.json ----------
markets_handle = [
    {"market": "Moneyline", "handle_ytd_usd": 3_412_000_000, "yoy": 0.184},
    {"market": "Point spread", "handle_ytd_usd": 2_840_000_000, "yoy": 0.211},
    {"market": "Player props", "handle_ytd_usd": 1_614_000_000, "yoy": 0.412},
    {"market": "Live in-game", "handle_ytd_usd": 1_142_000_000, "yoy": 0.638},
    {"market": "Parlays", "handle_ytd_usd": 412_000_000, "yoy": 0.178},
]

integrity_flags = [
    {"flag_id": "INT-2026-014", "severity": "high", "game_id": "G-2547", "matchup": "Foundry at Stockyards",
     "market": "Player props · K. Sterling assists o4.5",
     "summary": "Anomalous handle concentration on under: 78% of dollar volume in final 45 minutes from 3 IP clusters not historically active in this market. Z-score 3.8. Routed to integrity desk + sportsbook partner compliance.",
     "detected_at": "2026-05-20T01:42:00Z", "status": "under review"},
    {"flag_id": "INT-2026-013", "severity": "elevated", "game_id": "G-2538", "matchup": "Coyotes FC at Tides",
     "market": "1st half total points under 48.5",
     "summary": "Line moved 4.5 points in 12 minutes with handle 2.4x normal pre-game; concentration of large bets ($25k+) from new accounts. Z-score 2.6.",
     "detected_at": "2026-05-18T17:08:00Z", "status": "monitoring"},
]

sportsbook = {
    "generated_at": NOW,
    "partner_count": 6,
    "handle_ytd_usd": 9_420_000_000,
    "handle_yoy": 0.236,
    "hold_pct": 0.084,
    "top_markets": markets_handle,
    "integrity_agent": {
        "name": "Apex Integrity Monitoring Agent v1.1",
        "wagers_scored_24h": 24_800_000,
        "flagged_24h": 12,
        "high_severity_open": 1,
        "flags": integrity_flags,
        "false_positive_rate": 0.062,
        "avg_detection_latency_seconds": 22,
    },
}
(OUT / "sportsbook.json").write_text(json.dumps(sportsbook, indent=2))

# ---------- pipeline.json ----------
pipeline = {
    "generated_at": NOW,
    "layers": [
        {"layer": "connector", "rows_in": 0, "rows_out": 184_200_000, "tables": 11, "last_run": NOW, "status": "ok"},
        {"layer": "bronze",    "rows_in": 184_200_000, "rows_out": 184_200_000, "tables": 11, "last_run": NOW, "status": "ok"},
        {"layer": "silver",    "rows_in": 184_200_000, "rows_out": 142_800_000, "tables": 8,  "last_run": NOW, "status": "ok"},
        {"layer": "gold",      "rows_in": 142_800_000, "rows_out": 38_400_000,  "tables": 3,  "last_run": NOW, "status": "ok"},
    ],
    "connectors": [
        {"id": "ticketmaster", "name": "Ticketmaster (primary)", "service": "connector_sdk", "last_sync": NOW, "rows_24h": 412_000, "status": "ok"},
        {"id": "stubhub",      "name": "StubHub (secondary)",    "service": "connector_sdk", "last_sync": NOW, "rows_24h": 184_000, "status": "ok"},
        {"id": "sfmc",         "name": "Salesforce Marketing Cloud", "service": "salesforce_marketing_cloud", "last_sync": NOW, "rows_24h": 84_000, "status": "ok"},
        {"id": "apex_tv",      "name": "ApexTV streaming telemetry", "service": "connector_sdk", "last_sync": NOW, "rows_24h": 142_800_000, "status": "ok"},
        {"id": "apex_track",   "name": "ApexTrack player tracking",  "service": "connector_sdk", "last_sync": NOW, "rows_24h": 38_400_000,  "status": "ok"},
        {"id": "sponsorship",  "name": "Sponsorship management system", "service": "connector_sdk", "last_sync": NOW, "rows_24h": 12_400, "status": "ok"},
        {"id": "twitter_x",    "name": "X/Twitter API", "service": "twitter_ads", "last_sync": NOW, "rows_24h": 8_400_000, "status": "ok"},
        {"id": "instagram",    "name": "Instagram (Meta)", "service": "instagram_business", "last_sync": NOW, "rows_24h": 2_400_000, "status": "ok"},
        {"id": "reddit",       "name": "Reddit API", "service": "connector_sdk", "last_sync": NOW, "rows_24h": 1_840_000, "status": "ok"},
        {"id": "tiktok",       "name": "TikTok for Business", "service": "tiktok_ads", "last_sync": NOW, "rows_24h": 5_800_000, "status": "ok"},
        {"id": "sportsbook",   "name": "Sportsbook partner feeds", "service": "connector_sdk", "last_sync": NOW, "rows_24h": 24_800_000, "status": "ok"},
    ],
}
(OUT / "pipeline.json").write_text(json.dumps(pipeline, indent=2))

# ---------- iceberg.json ----------
def tbl(db, t, rows, src, cols, parts):
    return {"database": db, "table": t, "rows": rows, "bytes": rows * 184, "partitions": parts,
            "source_system": src, "last_updated_at": NOW, "schema_columns": cols}

iceberg = {"generated_at": NOW, "tables": [
    tbl("bronze", "raw_ticketmaster_orders",  84_200_000, "ticketmaster", 18, ["event_date"]),
    tbl("bronze", "raw_stubhub_listings",     14_800_000, "stubhub",      14, ["listed_date"]),
    tbl("bronze", "raw_sfmc_journey_events",   8_400_000, "sfmc",         22, ["event_date"]),
    tbl("bronze", "raw_apex_tv_play_events", 142_800_000, "apex_tv",      28, ["play_date"]),
    tbl("bronze", "raw_apex_track_frames",    38_400_000, "apex_track",   34, ["game_date"]),
    tbl("bronze", "raw_sponsorship_activations", 184_000, "sponsorship",  16, ["activation_date"]),
    tbl("bronze", "raw_social_posts",         18_400_000, "derived",      24, ["post_date", "platform"]),
    tbl("bronze", "raw_sportsbook_wagers",    24_800_000, "sportsbook",   26, ["wager_date"]),
    tbl("silver", "stg_ticket_orders",        84_200_000, "derived",      22, ["event_date"]),
    tbl("silver", "stg_apex_tv_sessions",     42_800_000, "derived",      18, ["session_date"]),
    tbl("silver", "stg_player_game_metrics",   1_240_000, "derived",      32, ["game_date"]),
    tbl("silver", "stg_social_sentiment",     18_400_000, "derived",      14, ["post_date"]),
    tbl("silver", "stg_sportsbook_wagers",    24_800_000, "derived",      24, ["wager_date"]),
    tbl("silver", "dim_teams",                       24, "derived",       18, []),
    tbl("silver", "dim_players",                    612, "derived",       22, []),
    tbl("silver", "dim_games",                    1_008, "derived",       18, []),
    tbl("gold",   "fct_team_performance",            24, "derived",       42, []),
    tbl("gold",   "fct_player_performance",         612, "derived",       38, []),
    tbl("gold",   "fct_ticket_demand",            1_008, "derived",       28, []),
    tbl("gold",   "fct_apex_tv_subscriber_health", 14_120_000, "derived", 26, ["cohort_month"]),
    tbl("gold",   "fct_sponsorship_fulfillment",    248, "derived",       32, []),
    tbl("gold",   "fct_integrity_signals",           412, "derived",      28, ["detection_date"]),
]}
(OUT / "iceberg.json").write_text(json.dumps(iceberg, indent=2))

print(f"Wrote {len(list(OUT.glob('*.json')))} JSON files to {OUT}")
