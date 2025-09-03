# Unified Wishlist

A React Native Expo app with Node.js server for managing wishlists with URL previews.

## Project Structure

```
/app — React Native Expo app (TypeScript)
/server — Node.js server (TypeScript)
schemas/ — JSON Schemas
```

## Setup & Run

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo CLI

### Server Setup
```bash
cd server
npm install
npm run dev
```

### App Setup
```bash
cd app
npm install
npm run start
```

### Root Scripts
```bash
npm run verify  # Typecheck both app and server
```

## Scripts

- **Root**: `npm run verify` (typecheck app & server)
- **Server**: `npm run dev`, `npm run test`, `npm run typecheck`
- **App**: `npm run start` (Expo), `npm run typecheck`

## Features

### Client (React Native + Expo)
- Deep linking: `centscape://add?url=...`
- Add flow: Paste URL → Fetch preview → Add to wishlist
- Wishlist: Virtualized FlatList with items (title, image, price, domain, createdAt)
- Persistence: SQLite with schema migration v1→v2 (adds normalizedUrl)
- Deduplication: Normalized URLs (strip UTM, lowercase host, remove fragments)
- Resilience: Skeleton loaders, retry on error, fallback images
- Accessibility: Labels on tappable controls

### Server (Node.js + Express)
- Endpoint: `POST /preview` { url, raw_html? } → JSON metadata
- Extraction: Open Graph → Twitter Card → oEmbed → fallback
- Security: Timeout 5s, redirects ≤3, HTML ≤512KB, content-type check, SSRF guard, rate-limit 10/min/IP
- Robustness: Invalid URLs → 400, errors handled gracefully
- Limitations: Dynamic sites (e.g., Amazon) may not work as metadata is loaded via JavaScript

## Engineering Tradeoffs & Risks

### Tradeoffs
- **Server**: Simplified oEmbed (no endpoint call) for speed
- **Client**: Basic skeleton (no shimmer) to reduce bundle
- **DB**: SQLite migration assumes no existing data for simplicity
- **Extraction**: Regex fallback for price may miss edge cases

### Risks
- **SSRF**: IP validation may not cover all private ranges
- **Rate-limit**: In-memory, resets on server restart
- **Extraction**: Relies on meta tags; may fail on dynamic sites
- **Deep linking**: Requires app installed; Expo linking may have quirks

## AI Usage Disclosure

- **Prompts used**: Initial code generation for server preview logic and client components
- **Why**: To bootstrap the project quickly and focus on integration/fixes
- **Modifications**: Added SSRF guard, redirect cap, size limit, accessibility labels, DB migration