# Sunset Dashboard

An optional visual home for the vault: illustrated folder cards, local clock, weather, calendar, focus timer, and Spotify controls.

## Open it

Install and enable **Dataview**, turn on **JavaScript queries** in its settings, and enable the **sunset-dashboard** CSS snippet under Appearance. Open [[00 - Maps of Content/Sunset Dashboard|Sunset Dashboard]] in Reading view. Close and reopen the note if a changed view does not refresh.

## Customize it

Edit the `weather` object in the dashboard note: set the city label, latitude, longitude, and IANA time zone, such as `Europe/Copenhagen`. All weather dates and the forecast request use that zone; the header clock uses the device's local time. No geolocation permission or API key is used.

Weather comes from Open-Meteo and is cached for 20 minutes. The outlook covers 06:00–18:00, switching to tomorrow after 18:00. It uses Celsius and wind speeds in metres per second. Without a connection, saved weather is labeled as offline; with no saved forecast, it shows an unavailable state. Loading weather sends the configured coordinates to Open-Meteo.

Change the `destinations` array in `view.js` to point the six cards at different folders. The cards search Markdown, Base, and Canvas files within those folders. Keep the artwork list in the same order as the cards.

The focus timer offers 5-, 25-, and 50-minute presets and custom minutes. Its state and the weather cache are stored locally per vault and device. Background updates pause while the dashboard is hidden.

## Files

- `00 - Maps of Content/Sunset Dashboard.md` — entry point and weather settings.
- `99 - Meta/Dashboard/view.js` — view code.
- `.obsidian/snippets/sunset-dashboard.css` — scoped styling.
- `98 - Attachments/Dashboard/sunset.png` — background.
- `98 - Attachments/Dashboard/spaces/` — six active SVG illustrations.

Sync these files together and enable Dataview's JavaScript setting on each device. Keep `obsidian: require("obsidian")` in the note's view input.

## Optional Spotify

Install **Spotify Control** by caezium and follow its authentication instructions. The adapter uses its 0.7.4 internal API. That plugin requires a Premium-owned developer app, and playback controls require Premium. Later plugin versions may change the API. Playback happens in Spotify; the dashboard is a remote control.

Without authentication, the panel offers a connection button and the other widgets still work. Authenticated playback and native phone rendering are not verified for this template.

## Remove it

Disable the CSS snippet and remove the dashboard note, view folder, snippet, and Dashboard artwork folder. Ordinary notes and other styles continue to work.

See [[99 - Meta/Credits|Credits]] for the layout inspiration, artwork, and weather attribution.
