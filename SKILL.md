---
name: physical
description: Physical location awareness from FindMy. Use when user says "physical", "where am I", "location", "where is nat", or needs to check current physical location.
---

# /physical - Physical Location Awareness

Check Nat's current physical location from FindMy data using DuckDB.

## Usage

```
/physical              # Show current location
/physical history      # Show today's movement
```

## Data Source

- Repo: `laris-co/nat-location-data` (GitHub - authorized friends only)
- Files: `current.csv` (now), `history.csv` (today's log)
- Updated: Every 5 minutes via white.local cron
- Source: FindMy via Sate's iMac

## Step 0: Timestamp

```bash
date "+🕐 %H:%M (%A %d %B %Y)"
```

## Step 1: Fetch & Query (DuckDB)

```bash
REPO="laris-co/nat-location-data"

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

## Known Places

| Place | Lat | Lon | Type |
|-------|-----|-----|------|
| cnx | 18.7669 | 98.9625 | airport |
| bkk | 13.6900 | 100.7501 | airport |
| dmk | 13.9126 | 100.6067 | airport |
| bitkub | 13.7563 | 100.5018 | office |
| maya | 18.8024 | 98.9676 | mall |
| central-cnx | 18.8072 | 98.9847 | mall |
| cmu | 18.8028 | 98.9531 | university |

## Directions

If user asks "how far to X":

```
🛫 To [destination]:
- 🗺️ https://maps.google.com/maps?saddr=[lat],[lon]&daddr=[dest_lat],[dest_lon]
```

## Access

Authorized collaborators on `laris-co/nat-location-data` can use this skill.
Contact Nat to request access.

---

ARGUMENTS: $ARGUMENTS
