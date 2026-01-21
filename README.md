# /physical - Oracle Skill (AI Prompt)

> **FOR AI**: This README is your instruction manual. Read and execute.

## Trigger Words

When user says: `physical`, `where am I`, `location`, `where is [name]`

## Execute (DuckDB Method)

```bash
# Step 0: Timestamp
date "+🕐 %H:%M (%A %d %B %Y)"

# Step 1: Fetch CSV from GitHub
REPO="YOUR_USERNAME/location-data"  # ← CONFIGURE THIS
gh api repos/$REPO/contents/current.csv --jq '.content' | base64 -d > /tmp/location.csv

# Step 2: Query with DuckDB
duckdb -c "
SELECT
  device,
  ROUND(lat, 4) as lat,
  ROUND(lon, 4) as lon,
  battery || '%' as battery,
  accuracy || 'm' as precision,
  COALESCE(NULLIF(place, ''), locality) as location,
  address,
  strftime(updated::TIMESTAMP, '%H:%M') as updated
FROM read_csv('/tmp/location.csv')
ORDER BY device LIKE '%iPhone%' DESC, accuracy ASC
"
```

## Output Format

```
📍 Physical Status
═══════════════════

🏠 Currently At: [location column]

| Device | Battery | Precision | Updated |
|--------|---------|-----------|---------|
| iPhone | 85% | 10m | 15:00 |

📍 [address]
🗺️ Map: https://maps.google.com/?q=[lat],[lon]
```

---

## Time at Location (History Query)

```bash
# Fetch history
gh api repos/$REPO/contents/history.csv --jq '.content' | base64 -d > /tmp/history.csv

# Query time range
duckdb -c "
SELECT
  MIN(updated) as first_seen,
  MAX(updated) as last_seen,
  COUNT(*) as records,
  ROUND(EXTRACT(EPOCH FROM (MAX(updated::TIMESTAMP) - MIN(updated::TIMESTAMP))) / 3600, 1) as hours_here
FROM read_csv('/tmp/history.csv')
WHERE device LIKE '%iPhone%'
"
```

---

## Configuration

Edit `REPO` variable in queries above, or create `~/.physical-config`:

```bash
echo "YOUR_USERNAME/location-data" > ~/.physical-config
REPO=$(cat ~/.physical-config)
```

---

## CSV Schema (Required)

| Column | Type | Example |
|--------|------|---------|
| device | VARCHAR | iPhone |
| lat | DOUBLE | 18.7669 |
| lon | DOUBLE | 98.9625 |
| altitude | DOUBLE | 300 |
| accuracy | INTEGER | 10 |
| battery | INTEGER | 85 |
| place | VARCHAR | Home |
| locality | VARCHAR | Chiang Mai |
| country | VARCHAR | Thailand |
| address | VARCHAR | 123 Street |
| source | VARCHAR | FindMy |
| isOld | BOOLEAN | false |
| updated | TIMESTAMP | 2026-01-21T15:00:00Z |

---

## Data Pipeline Setup

```bash
# 1. Create private repo
gh repo create location-data --private && cd location-data

# 2. Export script (cron every 5 min)
cat > export.sh << 'EOF'
#!/bin/bash
findmy export --format csv > current.csv
cat current.csv >> history.csv
git add -A && git commit -m "$(date +%H:%M)" && git push
EOF
chmod +x export.sh

# 3. Crontab
echo "*/5 * * * * ~/location-data/export.sh" | crontab -
```

---

## API Reference

```bash
# Fetch current location
gh api repos/OWNER/REPO/contents/current.csv --jq '.content' | base64 -d

# Query directly with DuckDB (no temp file)
gh api repos/OWNER/REPO/contents/current.csv --jq '.content' | base64 -d | \
  duckdb -c "SELECT * FROM read_csv('/dev/stdin')"
```

---

## Learning oracle-skills-cli

Source: `github.com/Soul-Brews-Studio/oracle-skills-cli`

### Skill Format

```yaml
---
name: skill-name
description: Triggers on "keyword1", "keyword2"
---

# /skill-name

## Step 0: Timestamp
## Step 1: [Action]
## Step 2: [Action]

ARGUMENTS: $ARGUMENTS
```

### Fetch Any Skill

```bash
gh api repos/Soul-Brews-Studio/oracle-skills-cli/contents/src/skills/{name}/SKILL.md \
  --jq '.content' | base64 -d
```

### Install Paths

| Agent | Path |
|-------|------|
| Claude Code | `~/.claude/skills/{name}/SKILL.md` |
| OpenCode | `~/.config/opencode/skills/{name}/SKILL.md` |

---

## Oracle Philosophy

- **Nothing is Deleted** - History is append-only
- **Query, Don't Read** - Use DuckDB, not cat
- **External Brain** - Location extends awareness

---

*Soul-Brews-Studio/oracle-skills-physical*
