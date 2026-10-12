# Implementation Plan - Real-Time Geolocation & India Weather Integration

We will upgrade the Weather Casting App to integrate real-time weather fetching via the free Open-Meteo API. It will dynamically detect the user's location via browser Geolocation, map global weather codes to our premium visual animations (Sunny, Rainy, Cold), and introduce an "India Weather Hub" showing current conditions across major Indian cities.

## Proposed Changes

We will modify our existing three files to migrate from mock data to real-time API integrations:

### 1. Structure Updates

#### [MODIFY] [index.html](file:///C:/Users/kaushik/.gemini/antigravity/scratch/weather-app/index.html)
- Add a **"Locate Me" GPS button** in the header.
- Add an **"India Weather Hub"** section containing a grid of major cities across India (Mumbai, New Delhi, Bengaluru, Kolkata, Chennai, Shimla) to satisfy "all over India's weather".
- Add loading indicator overlays to indicate API fetch progress.

### 2. Styling Additions

#### [MODIFY] [style.css](file:///C:/Users/kaushik/.gemini/antigravity/scratch/weather-app/style.css)
- Style the "Locate Me" button with glowing hover transitions.
- Create CSS styles for the "India Weather Hub" grid showing micro-cards for Indian cities.
- Add styles for loading skeletons and loading animations to make transitions feel premium.

### 3. Logic & API Integration

#### [MODIFY] [app.js](file:///C:/Users/kaushik/.gemini/antigravity/scratch/weather-app/app.js)
- **Geolocation handler**: Request user GPS coordinate permissions via `navigator.geolocation`.
- **Open-Meteo API Integrator**: Fetch real-time weather from Open-Meteo (no API keys required).
- **Reverse Geocoder**: Query OpenStreetMap's Nominatim endpoint to translate GPS coordinates into readable city/town names.
- **WMO Weather Code Parser**: Map Open-Meteo weather codes (0-99) to our three dynamic animations (Sunny, Rainy, Cold).
- **India Weather Loader**: Fetch real-time temperature and condition codes for Mumbai, Delhi, Bengaluru, Chennai, Kolkata, and Shimla, and display them in the India Hub grid.

## Verification Plan

### Manual Verification
1. Open the app and allow GPS access. Verify the app correctly detects your current city name and retrieves your actual local weather.
2. Verify that moving coordinates (simulated in DevTools) changes the weather display accordingly.
3. Check the **India Weather Hub** to see current real-time temperatures for Mumbai and other key Indian cities.
4. Verify the manual Weather State Demo buttons still override animations correctly for demonstration.
