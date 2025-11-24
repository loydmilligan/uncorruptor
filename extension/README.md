# Accountability Tracker - Chrome Extension

A Chrome extension for quickly capturing accountability events and sources while browsing the web.

## Features

- **Create New Events**: Quickly create accountability events from any webpage
- **Add Sources**: Add article sources to existing events with bias ratings
- **Page Data Extraction**: Automatically extracts metadata (title, date, author, description) from news articles
- **Offline Queue**: Actions are queued when offline and automatically synced when connection is restored
- **Event Search**: Search for existing events to add sources
- **Tag Management**: Select and prioritize tags when creating events

## Installation

### Development Mode

1. Build the extension:
   ```bash
   npm install
   npm run build
   ```

2. Load in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right)
   - Click "Load unpacked"
   - Select the `extension/dist` directory

3. The extension icon should appear in your toolbar

### Production Build

To create a distributable ZIP file:

```bash
npm run build
npm run zip
```

This creates `extension.zip` that can be distributed.

## Configuration

1. Click the extension icon
2. Click the settings (⚙️) icon
3. Enter your backend API URL (default: `http://localhost:3001`)
4. Click "Test Connection" to verify
5. Click "Save"

## Usage

### Creating a New Event

1. Navigate to a news article or webpage
2. Click the extension icon
3. Click "Create New Event"
4. The form will be pre-filled with page metadata
5. Adjust the title, description, and dates as needed
6. Select relevant tags (double-click to mark as primary)
7. Click "Create Event"

### Adding a Source to an Event

1. Navigate to a news article
2. Click the extension icon
3. Click "Add Source to Event"
4. Search for and select the event
5. The URL and article title will be pre-filled
6. Adjust the bias/reliability rating (1-5 scale)
7. Click "Add Source"

### Offline Mode

When the backend is unreachable:
- Actions are automatically queued
- A queue indicator shows pending actions
- Actions are automatically processed every 5 minutes when online
- Manual processing: Click "Process N queued" button

## Development

### Project Structure

```
extension/
├── src/
│   ├── popup/           # Extension popup UI
│   │   ├── App.tsx      # Main app component
│   │   ├── components/  # React components
│   │   └── popup.html   # Popup HTML entry
│   ├── background/      # Background service worker
│   │   ├── serviceWorker.ts
│   │   └── offlineQueue.ts
│   ├── content/         # Content scripts
│   │   └── extractPageData.ts
│   └── lib/             # Shared utilities
│       └── api.ts       # API client
├── icons/               # Extension icons
├── manifest.json        # Chrome extension manifest
└── vite.config.ts       # Build configuration
```

### Development Mode

Run in watch mode for live rebuilds:

```bash
npm run dev
```

Then reload the extension in Chrome after changes.

### Building

```bash
npm run build
```

### Testing

```bash
npm test
```

## Troubleshooting

### Extension not connecting to backend

- Check that the backend is running
- Verify the API URL in settings
- Use "Test Connection" button
- Check browser console for errors

### Metadata not extracting

- Some websites don't provide proper metadata
- Manual entry is always available
- Check browser console for extraction errors

### Queued actions not processing

- Check internet connection
- Verify backend is accessible
- Manually trigger with "Process N queued" button
- Check queue status in Settings

## Permissions

The extension requires:
- `activeTab`: Access current page for metadata extraction
- `storage`: Store settings and offline queue
- `scripting`: Inject content scripts
- Host permissions for `localhost` and local network (`192.168.*`)

## License

Part of the Administration Accountability Tracker project.
