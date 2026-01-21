---
name: physical
description: Physical location awareness from FindMy. Use when user says "physical", "where am I", "location", or needs to check current physical location.
---

# /physical - Physical Location Awareness

Check your current physical location from FindMy data.

## Usage

```
/physical              # Show current location
/physical history      # Show today's movement history
```

## Data Source

- Repo: `YOUR_USERNAME/location-data` (GitHub - EDIT IN config.ts)
- Files: `current.csv` (now), `history.csv` (today's log)
- Updated: Every 5 minutes via cron
- Source: FindMy

## Step 0: Timestamp

```bash
date "+🕐 %H:%M (%A %d %B %Y)"
```

## Step 1: Run Script

```bash
# Locate the script
LOCATIONS=(
  "$HOME/.claude/skills/physical/scripts/location-query.ts"
  "$HOME/.config/opencode/skills/physical/scripts/location-query.ts"
  "./.claude/skills/physical/scripts/location-query.ts"
)

SCRIPT=""
for loc in "${LOCATIONS[@]}"; do
  if [ -f "$loc" ]; then
    SCRIPT="$loc"
    break
  fi
done

if [ -z "$SCRIPT" ]; then
  echo "Error: location-query.ts not found. Install: oracle-skills install physical"
else
  bun "$SCRIPT" all
fi
```

## Step 2: Display Output

Parse and display:

```
📍 Physical Status
═══════════════════

🏠 Currently At: [place column, or locality if empty]

| Device | Battery | Precision | Updated |
|--------|---------|-----------|---------|
[one row per device, sorted by accuracy]

📍 [address from iPhone row]
🗺️ Map: https://maps.google.com/?q=[lat],[lon]

⏱️ At this location: [X hours] (from TIME_AT_LOCATION section)
```

## Setup Required

**First time only:**

1. Create private repo: `gh repo create location-data --private`
2. Setup FindMy export cron (see README.md)
3. Edit `scripts/config.ts` with your repo name

## Known Places (customize in config.ts)

| Place | Lat | Lon | Type |
|-------|-----|-----|------|
| home | YOUR_LAT | YOUR_LON | home |
| work | YOUR_LAT | YOUR_LON | office |

## Directions

If user asks "how far to X":

```
🛫 To [destination]:
- Distance: [calculate km]
- 🗺️ Directions: https://maps.google.com/maps?saddr=[lat],[lon]&daddr=[dest_lat],[dest_lon]
```

---

ARGUMENTS: $ARGUMENTS
