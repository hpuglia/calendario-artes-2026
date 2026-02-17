# **App Name**: Santa Fé Arts Calendar

## Core Features:

- Monthly Calendar View: Display a navigable monthly calendar with event markers, with visual cues for past/present/future dates, 'make art' status, and 'done' status.
- Event Modal: Open a modal on date click, displaying event information (title, summary, scope, type) and editable fields: 'Make Art' switch, 'Description/Briefing' text, and 'Done' checkbox. Enable creating 'special date' events.
- Data Loading: Load event data from a local `events_2026_santafe_sp_br.json` file on first use and display markers on calendar days with events.
- Local Persistence: Save all user choices (make_art, description, done, custom events, timestamps) to local storage (IndexedDB preferred) for a single user without login. Ensure offline functionality.
- Data Export: Add an 'Export' function to download calendar data as CSV (Google Sheets compatible) and JSON, with a filter for 'make_art = true' events. Include columns: date, title, scope, type, make_art, done, description, is_custom, updated_at, done_at.
- Filtering and Search: Include a toggle filter for 'Only Marked' events and a search functionality (optional but desirable) by event title.

## Style Guidelines:

- Primary color: Soft Blue (#A0CFEC) to create a calm and organized feel reminiscent of planning and reflection. The hue is loosely based on the idea of visualizing future dates on a calendar, and avoids a direct association with visual art, in favor of something softer and more evocative.
- Background color: Very light desaturated blue (#F0F8FF) to complement the primary color and create a clean, uncluttered base.
- Accent color: Muted Purple (#B0A0E0) for interactive elements and highlights, adding depth and drawing user attention without overwhelming the design. This analogous color to the soft blue adds subtle contrast.
- Font pairing: 'Alegreya' (serif) for headlines and 'PT Sans' (sans-serif) for body text, providing a balance of elegance and readability.
- Simple, minimalist icons to represent event types and statuses, ensuring clarity and quick recognition.
- Clean, mobile-first layout, ensuring fast loading and intuitive navigation.
- Subtle animations for transitions and interactions to enhance user experience without being distracting.