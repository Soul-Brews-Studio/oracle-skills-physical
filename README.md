# /physical - Oracle Skill (AI Prompt)

> **FOR AI**: Read and execute. Tracks Nat's physical location.

## Trigger Words

`physical`, `where am I`, `location`, `where is nat`

## Data Source

```
laris-co/nat-location-data (GitHub)
├── current.csv   ← Latest location
└── history.csv   ← Today's movement
```

**Access**: Authorized collaborators only. Contact Nat.

## Execute (DuckDB)

```bash
# Step 0: Timestamp
date "+🕐 %H:%M (%A %d %B %Y)"

# Step 1: Fetch & Query
REPO="laris-co/nat-location-data"
gh api repos/$REPO/contents/current.csv --jq '.content' | base64 -d > /tmp/loc.csv

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

## Output Format

```
📍 Physical Status
═══════════════════

🏠 Currently At: [location]

| Device | Battery | Precision | Updated |
|--------|---------|-----------|---------|
| iPhone | 85% | 10m | 15:00 |

📍 [address]
🗺️ Map: https://maps.google.com/?q=[lat],[lon]
```

## History Query

```bash
gh api repos/$REPO/contents/history.csv --jq '.content' | base64 -d > /tmp/hist.csv

duckdb -c "
SELECT
  strftime(MIN(updated::TIMESTAMP), '%H:%M') as first_seen,
  strftime(MAX(updated::TIMESTAMP), '%H:%M') as last_seen,
  ROUND((EXTRACT(EPOCH FROM MAX(updated::TIMESTAMP)) -
         EXTRACT(EPOCH FROM MIN(updated::TIMESTAMP))) / 3600, 1) as hours
FROM read_csv('/tmp/hist.csv')
WHERE device LIKE '%iPhone%'
"
```

## Known Places

| Place | Lat | Lon |
|-------|-----|-----|
| cnx | 18.7669 | 98.9625 |
| bkk | 13.6900 | 100.7501 |
| dmk | 13.9126 | 100.6067 |
| bitkub | 13.7563 | 100.5018 |
| maya | 18.8024 | 98.9676 |
| cmu | 18.8028 | 98.9531 |

## CSV Schema

| Column | Type | Example |
|--------|------|---------|
| device | VARCHAR | iPhone |
| lat | DOUBLE | 18.7669 |
| lon | DOUBLE | 98.9625 |
| battery | INTEGER | 85 |
| accuracy | INTEGER | 10 |
| place | VARCHAR | Home |
| locality | VARCHAR | Chiang Mai |
| address | VARCHAR | 123 Street |
| updated | TIMESTAMP | 2026-01-21T15:00:00Z |

## Install

```bash
# Clone and copy to skills
gh repo clone Soul-Brews-Studio/oracle-skills-physical
cp -r oracle-skills-physical ~/.claude/skills/physical
```

**Requirement**: Must be collaborator on `laris-co/nat-location-data`

---

*Soul-Brews-Studio/oracle-skills-physical*
