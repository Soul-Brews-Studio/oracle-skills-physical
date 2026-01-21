# /physical Skill Template

Physical location awareness for Oracle using FindMy data.

## Quick Install

```bash
# Copy to your skills directory
cp -r physical-skill-template ~/.claude/skills/physical

# Edit config
nano ~/.claude/skills/physical/scripts/config.ts
```

## Setup Location Data Pipeline

### 1. Create Private Repo

```bash
gh repo create location-data --private
cd location-data
```

### 2. Install FindMy CLI

```bash
# macOS with Homebrew
brew install findmy

# Or use: https://github.com/malmeloo/FindMy.py
```

### 3. Create Export Script

Create `export-location.sh`:

```bash
#!/bin/bash
cd ~/location-data

# Export current location
findmy export --format csv > current.csv

# Append to history (today only)
TODAY=$(date +%Y-%m-%d)
HISTORY_FILE="history-$TODAY.csv"

if [ ! -f "$HISTORY_FILE" ]; then
  head -1 current.csv > "$HISTORY_FILE"
fi
tail -n +2 current.csv >> "$HISTORY_FILE"
cp "$HISTORY_FILE" history.csv

# Push to GitHub
git add -A
git commit -m "location update $(date +%H:%M)" --allow-empty
git push origin main
```

### 4. Setup Cron

```bash
# Run every 5 minutes
crontab -e

# Add:
*/5 * * * * /path/to/export-location.sh >> /tmp/location-export.log 2>&1
```

## CSV Format

| Column | Description |
|--------|-------------|
| device | Device name (iPhone, iPad, etc.) |
| lat | Latitude |
| lon | Longitude |
| altitude | Altitude in meters |
| accuracy | Location accuracy in meters |
| battery | Battery percentage |
| place | Named place (if known) |
| locality | City/area name |
| country | Country |
| address | Full address |
| source | Data source (FindMy) |
| isOld | Whether location is stale |
| updated | ISO timestamp |

## Usage

```bash
# In Claude Code or OpenCode
/physical

# Direct script
bun ~/.claude/skills/physical/scripts/location-query.ts all
```

## Privacy Notes

- Your location data stays in YOUR private repo
- Only accessible via your GitHub token
- Oracle only reads, never writes location data
- Consider who has access to your gh CLI token

## Troubleshooting

**"File not found" error**
- Check CONFIG.LOCATION_REPO in config.ts
- Verify repo exists: `gh repo view YOUR_USERNAME/location-data`

**"No records found"**
- Check if cron job is running: `tail /tmp/location-export.log`
- Verify CSV format matches expected columns

**Old location shown**
- FindMy updates based on device activity
- Check `isOld` column in CSV
