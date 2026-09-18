import { useState, useEffect, useCallback, useRef } from 'react';
import { appleCalendarService } from '../services/apple-calendar.service';
import type { CalendarEvent } from '../services/apple-calendar.service';

interface UseAppleCalendarOptions {
  startDate?: Date;
  endDate?: Date;
  autoSync?: boolean;
  syncInterval?: number; // in milliseconds
}

export function useAppleCalendar(options: UseAppleCalendarOptions = {}) {
  const {
    startDate = new Date(),
    endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    autoSync = false,
    syncInterval = 5 * 60 * 1000, // 5 minutes
  } = options;

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConfigured, setIsConfigured] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const configuredRef = useRef(false);

  /**
   * Configure the service with Apple Calendar credentials
   */
  const configure = useCallback((caldavUrl: string, username: string, password: string) => {
    try {
      appleCalendarService.setConfig(caldavUrl, username, password);
      configuredRef.current = true;
      setIsConfigured(true);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Configuration failed');
    }
  }, []);

  /**
   * Fetch events from Apple Calendar
   */
  const fetchEvents = useCallback(async (start?: Date, end?: Date) => {
    if (!configuredRef.current) {
      const err = 'Apple Calendar not configured. Call setConfig() first.';
      setError(err);
      console.warn(err);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const fetchedEvents = await appleCalendarService.fetchEvents(
        start || startDate,
        end || endDate
      );
      setEvents(fetchedEvents);
      setLastSyncTime(new Date());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch calendar events';
      setError(errorMessage);
      console.error('Calendar fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate]);

  /**
   * Manually sync calendar events
   */
  const sync = useCallback(async () => {
    if (!configuredRef.current) {
      console.warn('Calendar not configured');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const fetchedEvents = await appleCalendarService.fetchEvents(startDate, endDate);
      setEvents(fetchedEvents);
      setLastSyncTime(new Date());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch calendar events';
      setError(errorMessage);
      console.error('Calendar sync error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate]);

  // Auto-sync setup (if enabled)
  useEffect(() => {
    if (!autoSync || !configuredRef.current) return;

    // Fetch immediately
    fetchEvents();

    // Setup periodic sync
    const interval = setInterval(() => {
      fetchEvents();
    }, syncInterval);

    return () => clearInterval(interval);
  }, [autoSync, syncInterval]);

  return {
    events,
    isLoading,
    error,
    isConfigured,
    lastSyncTime,
    configure,
    sync,
    fetchEvents,
  };
}
