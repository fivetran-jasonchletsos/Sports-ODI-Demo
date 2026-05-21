# Apex Sports League — ODI Demo

A reference build for **Fivetran Open Data Infrastructure (ODI)** in the professional sports + media industry.

**Apex Sports League** is a fictional 24-team professional sports league with a league-owned
streaming service ("ApexTV"), an integrated sportsbook partnership program, and an annual
revenue of approximately $11B. The demo speaks to a Chief Data Officer of the league office
and a VP of Ticketing & Fan Engagement.

Live: https://fivetran-jasonchletsos.github.io/Sports-ODI-Demo/

## Architecture

- **Sources**: Ticketmaster (primary), StubHub (secondary), Salesforce Marketing Cloud, ApexTV streaming telemetry, ApexTrack player tracking, sponsorship management, X / Instagram / Reddit / TikTok, sportsbook partner feeds.
- **Ingest**: Fivetran lands raw bronze tables to S3 as Apache Iceberg via the AWS Glue catalog.
- **Transform**: dbt builds silver (conformed) then gold (business-ready) marts.
- **Query**: Snowflake reads the same Iceberg tables a Trino notebook or DuckDB would.
- **Agents**: Snowflake Cortex agents (pricing, content, load-management, ROI, integrity) read gold directly.

## App

- Frontend: `apex-app/frontend/` — React 19 + Vite + Tailwind v4.
- Build: `cd apex-app/frontend && npm ci && npm run build`.
- Synthetic data builder: `python3 scripts/build_data.py` — regenerates the JSON snapshot.

## Synthetic data only

Apex Sports League, ApexTV, ApexTrack, the 24 franchises, players, and sponsors are all
invented. No real league, team, person, or partner is referenced.
