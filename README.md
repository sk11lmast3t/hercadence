# HerCadence: Period Tracker — Mobile Web & PWA Application

An elegant, serene menstrual cycle and wellness tracking application designed with high-craft mobile UI, calendar views, daily symptom logging, phase predictions, and holistic health insights.

---

## Brand Assets, Icons & Illustrations

All branding, custom illustrations, icons, and picture assets are self-contained and versioned directly inside the repository:

- **Official Brand Logo & Icons**:
  - `public/assets/hercadence_logo.jpg`: High-resolution primary brand logo and emblem (serene botanical woman profile with water droplet, moon, and lotus flower).
  - `public/apple-touch-icon.png`: Apple iOS home screen touch icon.
  - `public/pwa-192x192.png`: Android / Chrome PWA install launcher icon (192x192).
  - `public/pwa-512x512.png`: High-definition PWA icon (512x512).
  - `public/pwa-maskable-512x512.png`: Maskable launcher icon for Android adaptive icons.
  - `public/icon.svg`: Vector icon graphic.
- **Illustrations & Photography**:
  - `public/assets/`: 80+ curated watercolor and silk-wave illustrations, phase artwork, doctor/community avatars, and lifestyle graphics.

---

## Quick Start (Running Locally)

### 1. Prerequisites
- **Node.js**: Version 18+ or 20+ recommended
- **npm**: Included with Node.js

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open your browser and navigate to:
```
http://localhost:3000
```

> **Client-Only Dev Alternative:**
> If you prefer standard Vite standalone mode without the Express server, you can run:
> ```bash
> npm run dev:client
> ```

### 4. Production Build & Start
```bash
npm run build
npm start
```

---

## Mobile Application Experience & PWA Installation

This project is built from the ground up as a responsive, touch-optimized mobile application:

1. **Standalone PWA Mode**:
   - Includes a full Web App Manifest (`/public/manifest.json`), touch icons (`192x192`, `512x512`, maskable, and vector SVG), and mobile theme color headers.
   - **iOS (iPhone / iPad)**: Open in Safari, tap the **Share** button, and select **Add to Home Screen**.
   - **Android / Chrome / Edge**: Tap the in-app **Install App** button in the Profile screen or browser address bar to install directly to your device home screen.
2. **Mobile Screen Shell & Safe Areas**:
   - Optimized for mobile device viewports (`viewport-fit=cover`, safe-area insets for notches and home indicators).
   - Smooth gesture navigation, tactile active states, and mobile touch targets exceeding 44px.
3. **Local Offline-Ready Architecture**:
   - All illustrations, backgrounds, textures, and iconography are locally bundled inside `/public/assets` and `/public/` — no broken external CDN image dependencies.
   - Resilient local persistence ensures your logs, cycle settings, and customized parameters stay available offline.

