import ICAL from 'ical.js';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  location?: string;
  isAllDay: boolean;
}

interface AppleCalendarConfig {
  caldavUrl: string;
  username: string;
  password: string;
}

/**
 * Service for synchronizing with Apple Calendar via CalDAV protocol
 */
class AppleCalendarService {
  private config: AppleCalendarConfig | null = null;
  private events: CalendarEvent[] = [];
  private lastSyncTime: Date | null = null;

  /**
   * Initialize the service with Apple Calendar credentials
   * Note: In production, use OAuth2 instead of storing plain credentials
   */
  setConfig(caldavUrl: string, username: string, password: string) {
    this.config = { caldavUrl, username, password };
  }

  /**
   * Fetch calendar events from Apple Calendar
   * @param startDate - Start date for filtering events
   * @param endDate - End date for filtering events
   */
  async fetchEvents(startDate: Date, endDate: Date): Promise<CalendarEvent[]> {
    if (!this.config) {
      throw new Error('Apple Calendar not configured. Call setConfig() first.');
    }

    try {
      console.log('[Calendar] Fetching from:', this.config.caldavUrl.substring(0, 50) + '...');
      
      // Use allorigins CORS proxy - more reliable than cors-anywhere
      const corsProxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(this.config.caldavUrl)}`;
      
      const response = await fetch(corsProxyUrl, {
        method: 'GET',
        headers: {
          'Accept': 'text/calendar',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch calendar (${response.status}): ${response.statusText}`);
      }

      const icsData = await response.text();
      console.log('[Calendar] Received data, parsing...');
      const events = this.parseICalendar(icsData, startDate, endDate);
      console.log(`[Calendar] Parsed ${events.length} events`);
      
      this.events = events;
      this.lastSyncTime = new Date();
      
      return events;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('[Calendar] Error fetching:', message);
      throw error;
    }
  }

  /**
   * Parse iCalendar format and extract events
   */
  private parseICalendar(icsData: string, startDate: Date, endDate: Date): CalendarEvent[] {
    const events: CalendarEvent[] = [];

    try {
      const jcalData = ICAL.parse(icsData);
      const component = new ICAL.Component(jcalData);
      const vevent = component.getAllSubcomponents('vevent');

      for (const event of vevent) {
        const summary = event.getFirstPropertyValue('summary') || 'No Title';
        const description = event.getFirstPropertyValue('description');
        const location = event.getFirstPropertyValue('location');
        const uid = event.getFirstPropertyValue('uid');
        
        const startProp = event.getFirstProperty('dtstart');
        const endProp = event.getFirstProperty('dtend');
        
        let eventStart: Date;
        let eventEnd: Date;
        let isAllDay = false;

        if (startProp) {
          const startValue = startProp.getFirstValue();
          if (startValue && typeof startValue === 'object' && 'toJSDate' in startValue) {
            eventStart = (startValue as any).toJSDate();
          } else if (startValue instanceof ICAL.Time) {
            eventStart = startValue.toJSDate();
          } else {
            continue;
          }
        } else {
          continue;
        }

        if (endProp) {
          const endValue = endProp.getFirstValue();
          if (endValue && typeof endValue === 'object' && 'toJSDate' in endValue) {
            eventEnd = (endValue as any).toJSDate();
          } else if (endValue instanceof ICAL.Time) {
            eventEnd = endValue.toJSDate();
          } else {
            eventEnd = new Date(eventStart.getTime() + 60 * 60 * 1000);
          }
        } else {
          eventEnd = new Date(eventStart.getTime() + 60 * 60 * 1000); // Default 1 hour
        }

        // Check if event is all-day
        const dtstart = event.getFirstProperty('dtstart');
        if (dtstart?.getParameter('value') === 'date') {
          isAllDay = true;
        }

        // Filter events within date range
        if (eventStart <= endDate && eventEnd >= startDate) {
          events.push({
            id: uid as string,
            title: summary as string,
            description: description as string | undefined,
            start: eventStart,
            end: eventEnd,
            location: location as string | undefined,
            isAllDay,
          });
        }
      }

      // Sort events by start time
      events.sort((a, b) => a.start.getTime() - b.start.getTime());
      
      return events;
    } catch (error) {
      console.error('Error parsing iCalendar data:', error);
      return [];
    }
  }

  /**
   * Get cached events
   */
  getEvents(): CalendarEvent[] {
    return this.events;
  }

  /**
   * Get last sync time
   */
  getLastSyncTime(): Date | null {
    return this.lastSyncTime;
  }

  /**
   * Clear cached events
   */
  clearCache() {
    this.events = [];
    this.lastSyncTime = null;
  }
}

// Export singleton instance
export const appleCalendarService = new AppleCalendarService();
