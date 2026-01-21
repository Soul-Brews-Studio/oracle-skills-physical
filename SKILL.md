---
name: physical
description: Physical location awareness from FindMy. Use when user says "physical", "where am I", "location", or needs to check current physical location.
---

# /physical - Physical Location Awareness

Check current physical location from FindMy data using DuckDB.

## Usage

```
/physical              # Show current location
/physical history      # Show today's movement
```

## Data Source

- Repo: Configure in `~/.physical-config` or edit REPO below
- Files: `current.csv` (now), `history.csv` (today's log)
- Updated: Every 5 minutes via cron
- Source: FindMy

## Step 0: Timestamp

```bash
date "+🕐 %H:%M (%A %d %B %Y)"
```

## Step 1: Fetch & Query (DuckDB)

```bash
# Config: edit this or use ~/.physical-config
REPO="${PHYSICAL_REPO:-$(cat ~/.physical-config 2>/dev/null || echo 'YOUR_USERNAME/location-data')}"

# Fetch current location
gh api repos/$REPO/contents/current.csv --jq '.content' | base64 -d > /tmp/loc.csv

# Query with DuckDB
duckdb -c "
SELECT
  device,
  ROUND(lat, 4) as lat,
  ROUND(lon, 4) as lon,
  battery || '%' as battery,
  accuracy || 'm' as precision,
  COALESCE(NULLIF(place, ''), locality) as location,
  address,
  strftime(updated::TIMESTAMP, '%H:%M') as time
FROM read_csv('/tmp/loc.csv')
ORDER BY device LIKE '%iPhone%' DESC, accuracy ASC
"
```

## Step 2: Display Output

```
📍 Physical Status
═══════════════════

🏠 Currently At: [location column]

| Device | Battery | Precision | Updated |
|--------|---------|-----------|---------|
[one row per device from query]

📍 [address from iPhone row]
🗺️ Map: https://maps.google.com/?q=[lat],[lon]
```

## Step 3: Time at Location (if history requested)

```bash
gh api repos/$REPO/contents/history.csv --jq '.content' | base64 -d > /tmp/hist.csv

duckdb -c "
SELECT
  strftime(MIN(updated::TIMESTAMP), '%H:%M') as first_seen,
  strftime(MAX(updated::TIMESTAMP), '%H:%M') as last_seen,
  COUNT(*) as records,
  ROUND((EXTRACT(EPOCH FROM MAX(updated::TIMESTAMP)) -
         EXTRACT(EPOCH FROM MIN(updated::TIMESTAMP))) / 3600, 1) as hours
FROM read_csv('/tmp/hist.csv')
WHERE device LIKE '%iPhone%'
"
```

Output: `⏱️ At this location: [hours] hours (since [first_seen])`

## Setup (First Time)

```bash
# 1. Configure repo
echo "YOUR_USERNAME/location-data" > ~/.physical-config

# 2. Or set env var
export PHYSICAL_REPO="YOUR_USERNAME/location-data"
```

## Directions

If user asks "how far to X":

```
🛫 To [destination]:
- 🗺️ https://maps.google.com/maps?saddr=[lat],[lon]&daddr=[dest_lat],[dest_lon]
```

---

ARGUMENTS: $ARGUMENTS
