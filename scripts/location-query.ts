import { $ } from 'bun';
import { CONFIG } from './config';

const MODE = process.argv[2] || 'all';

async function fetchCsv(filename: string): Promise<string> {
  const response = await $`gh api repos/${CONFIG.LOCATION_REPO}/contents/${filename} --jq '.content' | base64 -d`.text();
  return response;
}

// Simple CSV parser that respects quotes
function parseCSVLine(line: string): string[] {
  const res: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      res.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  res.push(current);
  return res;
}

function parseCSV(csv: string): Record<string, string>[] {
  const lines = csv.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]);
  return lines.slice(1).map(line => {
    const values = parseCSVLine(line);
    const record: Record<string, string> = {};
    headers.forEach((h, i) => {
      record[h] = values[i] || '';
    });
    return record;
  });
}

if (MODE === 'current' || MODE === 'all') {
  try {
    const current = await fetchCsv(CONFIG.CURRENT_FILE);
    console.log('---CURRENT_LOCATION---');
    console.log(current);
  } catch (e) {
    console.error(`Error fetching current location: ${e}`);
    console.log('Make sure CONFIG.LOCATION_REPO is set correctly in config.ts');
  }
}

if (MODE === 'time' || MODE === 'all') {
  console.log('---TIME_AT_LOCATION---');
  try {
    const history = await fetchCsv(CONFIG.HISTORY_FILE);
    const lines = history.trim().split('\n');

    const records = lines.map(line => {
      const cols = parseCSVLine(line);
      if (cols.length < 13) return null;
      return {
        device: cols[0],
        updated: new Date(cols[12])
      };
    }).filter(r => r && r.device && r.device.includes(CONFIG.PRIMARY_DEVICE));

    if (records.length > 0) {
      records.sort((a, b) => a!.updated.getTime() - b!.updated.getTime());

      const firstSeen = records[0]!.updated;
      const lastSeen = records[records.length - 1]!.updated;
      const hoursHere = ((lastSeen.getTime() - firstSeen.getTime()) / (1000 * 60 * 60)).toFixed(1);

      console.log(`first_seen = ${firstSeen.toISOString().replace('T', ' ').slice(0, 19)}`);
      console.log(`last_seen = ${lastSeen.toISOString().replace('T', ' ').slice(0, 19)}`);
      console.log(`records = ${records.length}`);
      console.log(`hours_here = ${hoursHere}`);
    } else {
      console.log('No records found in history.');
    }
  } catch (e) {
    console.error(`Error fetching history: ${e}`);
  }
}

if (MODE === 'help') {
  console.log(`
/physical - Physical Location Awareness

Usage:
  bun location-query.ts [mode]

Modes:
  all      - Show current location + time at location (default)
  current  - Show current location only
  time     - Show time at current location only
  help     - Show this help

Configuration:
  Edit scripts/config.ts to set your location repo
`);
}
