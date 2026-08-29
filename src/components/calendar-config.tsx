import { useState } from "react";

interface CalendarConfigProps {
  onConfigure: (caldavUrl: string, username: string, password: string) => void;
  isConfigured: boolean;
}

export function CalendarConfig({
  onConfigure,
  isConfigured,
}: CalendarConfigProps) {
  const [caldavUrl, setCaldavUrl] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showForm, setShowForm] = useState(!isConfigured);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (caldavUrl && username && password) {
      onConfigure(caldavUrl, username, password);
      setShowForm(false);
    }
  };

  if (!showForm && isConfigured) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex justify-between items-center">
        <p className="text-green-800">✓ Apple Calendar configured</p>
        <button
          onClick={() => setShowForm(true)}
          className="text-sm text-green-700 hover:text-green-900 underline"
        >
          Edit
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 max-w-md">
      <h2 className="text-xl font-bold mb-4">Configure Apple Calendar</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="caldavUrl"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            CalDAV URL *
          </label>
          <input
            id="caldavUrl"
            type="url"
            value={caldavUrl}
            onChange={(e) => setCaldavUrl(e.target.value)}
            placeholder="https://caldav.icloud.com/..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Export your calendar as .ics or use your iCloud CalDAV endpoint
          </p>
        </div>

        <div>
          <label
            htmlFor="username"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Apple ID / Username *
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="your.email@icloud.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Password / App Password *
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Use an app-specific password for better security
          </p>
        </div>

        <button
          type="submit"
          disabled={!caldavUrl || !username || !password}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          Connect Calendar
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="font-semibold text-sm mb-3">Setup Instructions:</h3>
        <ol className="text-xs text-gray-600 space-y-2">
          <li>
            <strong>1. Get CalDAV URL:</strong> In Apple Calendar (Mac),
            right-click calendar → Get sharing settings → Copy the Private
            Calendar URL
          </li>
          <li>
            <strong>2. Use App Password:</strong> Generate one at
            appleid.apple.com → Security → App Passwords
          </li>
          <li>
            <strong>3. Or Export:</strong> File → Export → Save calendar as .ics
            and host publicly
          </li>
        </ol>
      </div>
    </div>
  );
}
