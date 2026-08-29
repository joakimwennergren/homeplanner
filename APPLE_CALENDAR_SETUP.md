# Apple Calendar Synchronization Setup Guide

This guide will help you integrate your Apple Calendar with the Homeplanner application.

## Overview

The Homeplanner now supports one-way synchronization with Apple Calendar via CalDAV protocol. Calendar events will be displayed alongside your tasks and events.

## Prerequisites

- An Apple ID with Calendar access
- macOS, iOS, or access to iCloud Calendar web
- (Optional) An app-specific password for enhanced security

## Setup Instructions

### Step 1: Get Your CalDAV URL

You have two options:

#### Option A: Using CalDAV URL (Recommended for privacy)

**On macOS:**
1. Open Calendar app
2. Right-click on the calendar you want to sync
3. Select "Get Sharing Settings" or "Calendar Settings"
4. Copy the **Private Calendar URL** (it should look like `webcal://p123-caldav.icloud.com/...`)
5. Change `webcal://` to `https://`

**On iCloud Web:**
1. Go to iCloud.com → Calendar
2. Right-click your calendar
3. Select "Copy link" or similar option
4. The URL should start with `https://p[number]-caldav.icloud.com/`

#### Option B: Export as .ics File

1. In Calendar app: File → Export → Save your calendar as `.ics`
2. Upload the file to a web server or cloud storage
3. Get a public, direct link to the `.ics` file
4. Use this URL in the configuration

### Step 2: Create an App Password (Recommended)

For security, use an app-specific password instead of your main Apple ID password:

1. Go to [appleid.apple.com](https://appleid.apple.com)
2. Sign in with your Apple ID
3. Go to "Security" section
4. Under "App Passwords", click "Generate App Password"
5. Select "Calendar" from the app dropdown
6. Generate and copy the password (it will be a 16-character code)

### Step 3: Configure in Homeplanner

1. Open Homeplanner in your browser
2. Click the "Show Apple Calendar" button at the top right (if it's hidden)
3. You should see a "Configure Apple Calendar" form
4. Fill in:
   - **CalDAV URL**: The URL from Step 1
   - **Apple ID / Username**: Your Apple ID email (e.g., user@icloud.com)
   - **Password / App Password**: The app-specific password from Step 2 (or your Apple ID password)
5. Click "Connect Calendar"

### Step 4: Sync and View Events

Once configured:
- Your calendar events will automatically load
- Click "Sync Calendar" to refresh events manually
- Events are displayed in chronological order
- Toggle visibility with "Hide Apple Calendar" button

## Troubleshooting

### "Failed to fetch calendar" Error

**Possible causes:**
- Incorrect CalDAV URL
- Wrong credentials
- Calendar not shared/accessible
- CORS issues (if using web server)

**Solutions:**
1. Verify the CalDAV URL is correct and complete
2. Ensure the password is correct (try app-specific password)
3. Check that the calendar is not private or requires sharing

### Events Not Showing

1. Click "Sync Calendar" to manually refresh
2. Check browser console for detailed errors (F12 → Console tab)
3. Verify the date range: events are shown for current month + 3 months ahead
4. Ensure your calendar has events in this date range

### Browser Compatibility

- Tested on: Chrome, Safari, Firefox
- Requires: Modern browser with fetch API support
- Note: Some browsers may have CORS restrictions with certain CalDAV servers

## Security Notes

⚠️ **Important:**
- Your credentials are only stored temporarily in browser memory
- For production use, consider implementing a backend proxy
- Never share your app passwords with others
- Use app-specific passwords instead of your main Apple ID password

## API Details

For developers:

### Configuration
```typescript
const { configure } = useAppleCalendar();
configure(caldavUrl, username, password);
```

### Fetch Events
```typescript
const { sync, events, isLoading } = useAppleCalendar({
  startDate: new Date(),
  endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  autoSync: false,
});

await sync();
```

### CalendarEvent Type
```typescript
interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  location?: string;
  isAllDay: boolean;
}
```

## Advanced: Backend Proxy (Optional)

For better security and handling more complex CalDAV setups, you can implement a backend proxy:

1. Create a Node.js/Express endpoint that:
   - Accepts credentials securely (HTTPS only)
   - Fetches from CalDAV server
   - Returns parsed events as JSON

2. Update the service to use your backend:
```typescript
// Modify apple-calendar.service.ts to call your backend instead
const response = await fetch('/api/calendar/sync', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ caldavUrl, username, password })
});
```

3. Implement secure storage on your backend (never log credentials)

## Support

- Check browser console for detailed error messages
- Ensure JavaScript is enabled
- Try refreshing the page if events don't load
- Test the CalDAV URL directly in browser's address bar first

---

**Last Updated:** 2026-08-29
**Version:** 1.0
