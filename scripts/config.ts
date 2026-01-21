// Configuration for /physical skill
// Edit this file to match your setup

export const CONFIG = {
  // Your GitHub repo containing location data
  // Format: "owner/repo-name"
  LOCATION_REPO: "YOUR_USERNAME/location-data",

  // CSV filenames in your repo
  CURRENT_FILE: "current.csv",
  HISTORY_FILE: "history.csv",

  // Your known places (customize these)
  KNOWN_PLACES: [
    { name: "home", lat: 0, lon: 0, type: "home" },
    { name: "work", lat: 0, lon: 0, type: "office" },
    // Add more places...
  ] as const,

  // Primary device to show (usually iPhone)
  PRIMARY_DEVICE: "iPhone",
};
