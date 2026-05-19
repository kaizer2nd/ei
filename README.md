# DroneFarm AI Dashboard

Production-style smart agriculture dashboard for IoT telemetry monitoring, analytics, and decision intelligence.

## Stack

- React + TypeScript + Vite
- Tailwind CSS v4
- Recharts
- Framer Motion
- Sonner notifications
- PapaParse CSV export

## Core Features

- Live monitoring cards for temperature, humidity, light intensity, and rain status
- Dynamic farm intelligence score (0-100) with condition badge (Optimal/Moderate/Critical)
- Smart recommendations with priority levels
- Predictive cards with confidence levels
- Vertical event timeline
- Historical trend charts with filters (1h / 24h / 7d)
- Zone-based simulated farm scan (Zone A/B/C)
- System status panel (connection, sync time, latency, transport)
- Multi-view layout (Dashboard, Analytics, Intelligence, Settings)

## Bonus Features Included

- Language toggle (English/Hindi)
- CSV export for telemetry history
- Alert notifications
- Sound alert on critical conditions

## Data Shape

```json
{
  "temp": 25.1,
  "humidity": 59.4,
  "light": 620,
  "rain": false,
  "timestamp": 1776701760000
}
```

## Run Locally

```bash
npm install
npm run dev
```

Open the URL shown in terminal (typically http://localhost:5173).

## Build and Quality Checks

```bash
npm run lint
npm run build
```

## Project Structure

```text
src/
  components/
    Card.tsx
    FarmScore.tsx
    HistoricalCharts.tsx
    PredictionPanel.tsx
    RecommendationPanel.tsx
    SensorCard.tsx
    SettingsPanel.tsx
    Sidebar.tsx
    SystemStatusPanel.tsx
    TimelinePanel.tsx
    TopBar.tsx
    ZoneView.tsx
  hooks/
    useDroneFarmData.ts
  services/
    dataSource.ts
  App.tsx
  i18n.ts
  index.css
  main.tsx
  types.ts
  utils.ts
```

## Backend Integration (Firebase or MQTT)

Current implementation streams mock data from `sourceByTransport` in `src/services/dataSource.ts`.

### Arduino UNO Local Bridge

For a direct Arduino Uno integration, run the local bridge script:

```bash
npm run bridge
```

The bridge reads `COM7` at `9600` baud by default and exposes a browser WebSocket at `ws://127.0.0.1:8787`.

Supported Arduino serial line formats:

```text
{"temp":25.1,"humidity":59.4,"light":620,"rain":false}
temp=25.1;humidity=59.4;light=620;rain=false
25.1,59.4,620,false
```

In the app, go to Settings and select `serial-bridge`.

To connect Firebase:

1. Install Firebase SDK.
2. Replace `createFutureFirebaseSource` with a real listener.
3. Map incoming payload to `SensorReading` shape.

To connect MQTT:

1. Install an MQTT client (browser-safe).
2. Replace `createFutureMqttSource` with topic subscribe logic.
3. Parse messages and emit `SensorReading` to the listener callback.

Important integration rule: Keep data transport logic inside `src/services/dataSource.ts` so UI components remain unchanged.

## What I Need From You

To make the Arduino parser exact for your sketch, send me:

1. The exact serial output your Uno prints in the Arduino IDE Serial Monitor.
2. The baud rate used in `Serial.begin(...)`.
3. Whether the rain sensor sends `0/1`, `true/false`, or a custom word like `Detected`.
4. Whether you want the app to stay on the local WebSocket bridge or publish to MQTT/HiveMQ as well.

## Notes

- Current build may show a large chunk warning due to charting and UI libraries. This is expected for now.
- Add route-level code splitting later if bundle size optimization is required.
