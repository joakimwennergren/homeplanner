# Homeplanner Backend Server

This is a backend proxy server for handling Apple Calendar sync on Raspberry Pi and other deployments.

## Setup

### Installation

```bash
cd server
npm install
```

### Running the Server

```bash
npm start
```

The server will start on `http://localhost:3001`

### Endpoints

- `GET /health` - Health check
- `GET /proxy?url=<calendar-url>` - CORS proxy for calendar sync

## Deployment on Raspberry Pi

### Option 1: Using PM2 (Recommended)

```bash
# Install PM2 globally
npm install -g pm2

# Start the server with PM2
pm2 start server/server.js --name "homeplanner-server"

# Make it start on boot
pm2 startup
pm2 save
```

### Option 2: Using systemd

Create `/etc/systemd/system/homeplanner-server.service`:

```ini
[Unit]
Description=Homeplanner Backend Server
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/path/to/homeplanner/server
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Then:
```bash
sudo systemctl enable homeplanner-server
sudo systemctl start homeplanner-server
sudo systemctl status homeplanner-server
```

### Option 3: Using Docker

```bash
docker build -t homeplanner-server -f Dockerfile .
docker run -d -p 3001:3001 --name homeplanner-server homeplanner-server
```

## Configuration

The server runs on port `3001` by default. To change it:

```bash
PORT=8080 npm start
```

## Troubleshooting

If you see 502 or 522 errors:

1. Make sure the proxy server is running: `curl http://localhost:3001/health`
2. Check server logs for errors
3. Verify the Raspberry Pi has internet connectivity
4. Try increasing the timeout in `server.js` if your connection is slow
