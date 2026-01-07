// High-impact economic events that should block signals
// Format: minute of day when event occurs (e.g., 480 = 8:00 AM UTC)
// These are approximate times - add/remove based on your trading calendar

export interface NewsEvent {
  name: string;
  timeUTC: number; // minutes from midnight UTC
  impactLevel: "HIGH" | "MEDIUM";
  blockMinutes: number; // minutes to block before and after
}

const MAJOR_NEWS_EVENTS: NewsEvent[] = [
  // US Economic Data (typically 13:30 UTC / 8:30 AM EST)
  { name: "NFP (Non-Farm Payroll)", timeUTC: 810, impactLevel: "HIGH", blockMinutes: 30 },
  { name: "CPI (Consumer Price Index)", timeUTC: 810, impactLevel: "HIGH", blockMinutes: 30 },
  { name: "PPI (Producer Price Index)", timeUTC: 810, impactLevel: "HIGH", blockMinutes: 30 },
  { name: "Jobless Claims", timeUTC: 810, impactLevel: "MEDIUM", blockMinutes: 20 },
  { name: "Retail Sales", timeUTC: 810, impactLevel: "MEDIUM", blockMinutes: 20 },
  { name: "Industrial Production", timeUTC: 810, impactLevel: "MEDIUM", blockMinutes: 20 },
  
  // FOMC Decisions (typically 18:00 UTC / 1:00 PM EST)
  { name: "FOMC Decision", timeUTC: 1080, impactLevel: "HIGH", blockMinutes: 60 },
  { name: "Fed Chair Press Conference", timeUTC: 1140, impactLevel: "HIGH", blockMinutes: 60 },
  
  // ECB Events (typically 13:45 UTC)
  { name: "ECB Decision", timeUTC: 825, impactLevel: "HIGH", blockMinutes: 60 },
  
  // UK Economic Data (typically 10:30 UTC)
  { name: "UK Inflation", timeUTC: 630, impactLevel: "HIGH", blockMinutes: 30 },
  { name: "UK Jobs Report", timeUTC: 630, impactLevel: "HIGH", blockMinutes: 30 },
];

export function isNewsEventTime(timeUTC: number = Date.now()): { blocked: boolean; event?: NewsEvent; remainingMinutes?: number; allowWithWarning?: boolean } {
  const now = new Date(timeUTC);
  const minutesFromMidnight = now.getUTCHours() * 60 + now.getUTCMinutes();

  for (const event of MAJOR_NEWS_EVENTS) {
    const eventStart = event.timeUTC - event.blockMinutes;
    const eventEnd = event.timeUTC + event.blockMinutes;

    if (minutesFromMidnight >= eventStart && minutesFromMidnight <= eventEnd) {
      const remainingMinutes = eventEnd - minutesFromMidnight;
      // If we are in the "after" period of the news (0 to blockMinutes after event)
      const isPostEvent = minutesFromMidnight >= event.timeUTC;
      return { blocked: true, event, remainingMinutes, allowWithWarning: false, isPostEvent };
    }
  }

  return { blocked: false };
}

export function getNextNewsEvent(timeUTC: number = Date.now()): NewsEvent | null {
  const now = new Date(timeUTC);
  const minutesFromMidnight = now.getUTCHours() * 60 + now.getUTCMinutes();

  const upcomingEvents = MAJOR_NEWS_EVENTS.filter(e => e.timeUTC > minutesFromMidnight);
  return upcomingEvents.length > 0 ? upcomingEvents[0] : null;
}
