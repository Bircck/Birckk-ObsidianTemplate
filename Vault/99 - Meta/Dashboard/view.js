try {
/* Sunset Dashboard. Deliberately selected content; no task or recent-note queries. */
const { FuzzySuggestModal, Notice, requestUrl, setIcon } = input.obsidian;
const app = dv.app;
const weatherSettings = { city: 'Copenhagen', latitude: 55.6761, longitude: 12.5683, timeZone: 'Europe/Copenhagen', ...input.weather };
const weatherKey = 'weather:' + [weatherSettings.latitude, weatherSettings.longitude, weatherSettings.timeZone].join(':');
const host = dv.container;
// Dataview clears this container when unrelated vault metadata changes.
// Reattach the same live view instead of rebuilding it and multiplying callbacks.
const version = 'sunset-template-v1:' + JSON.stringify(weatherSettings);
const previous = host.__sunsetInstance;
if (previous?.version === version && previous.component === dv.component && !previous.disposed) {
  host.replaceChildren(previous.root);
  previous.resume();
  return;
}
if (host.__sunsetCleanup) host.__sunsetCleanup();
host.replaceChildren();
const doc = host.ownerDocument;
const win = doc.defaultView;
const storageKey = `sunset-dashboard:v1:${app.vault.getName()}:`;
const read = (key, fallback) => { try { return JSON.parse(win.localStorage.getItem(storageKey + key)) ?? fallback; } catch { return fallback; } };
const save = (key, value) => { try { win.localStorage.setItem(storageKey + key, JSON.stringify(value)); } catch {} };
const root = host.createDiv({ cls: 'sd-dashboard' });
root.setAttribute('aria-label', 'Sunset Dashboard');
const asset = app.vault.getAbstractFileByPath('98 - Attachments/Dashboard/sunset.png');
if (asset) root.style.setProperty('--sd-art', `url("${app.vault.getResourcePath(asset)}")`);
let disposed = false;
const cleanups = [];
const cleanup = () => { if (disposed) return; disposed = true; cleanups.forEach(fn => fn()); if (host.__sunsetCleanup === cleanup) { delete host.__sunsetCleanup; delete host.__sunsetInstance; } };
host.__sunsetCleanup = cleanup;
dv.component.register(cleanup);
let onScreen = true;
const visible = () => !disposed && onScreen && root.isConnected && doc.visibilityState !== 'hidden';
const text = (el, value) => { if (el.textContent !== value) el.textContent = value; };
const listen = (el, event, fn) => { el.addEventListener(event, fn); cleanups.push(() => el.removeEventListener(event, fn)); };
function button(parent, text, icon, callback, cls = '') {
  const b = parent.createEl('button', { cls: `sd-button ${cls}`, attr: { type: 'button', 'aria-label': text, title: text } });
  if (icon) { const i = b.createSpan({ cls: 'sd-icon' }); setIcon(i, icon); }
  if (text) b.createSpan({ text });
  listen(b, 'click', callback);
  return b;
}
function panel(parent, label, icon, cls = '') {
  const p = parent.createEl('section', { cls: `sd-panel ${cls}`, attr: { 'aria-label': label } });
  const head = p.createDiv({ cls: 'sd-panel-heading' });
  if (icon) setIcon(head.createSpan({ cls: 'sd-icon' }), icon);
  head.createEl('h2', { text: label });
  return p;
}
function external(parent, text, href, cls = '') {
  return parent.createEl('a', { text, cls: `sd-external ${cls}`, href, attr: { target: '_blank', rel: 'noopener noreferrer' } });
}
function openFile(path) {
  const file = app.vault.getAbstractFileByPath(path);
  if (!file || !('extension' in file)) { new Notice(`File not found: ${path}`); return; }
  app.workspace.getLeaf('tab').openFile(file);
}
class FolderPicker extends FuzzySuggestModal {
  constructor(folder, label) { super(app); this.folder = folder; this.setPlaceholder(`Find a note in ${label}…`); this.modalEl.addClass('sunset-dashboard-modal'); }
  getItems() { return app.vault.getFiles().filter(f => (f.extension === 'md' || f.extension === 'base' || f.extension === 'canvas') && f.path.startsWith(this.folder + '/')); }
  getItemText(file) { return file.path.slice(this.folder.length + 1).replace(/\.(md|base|canvas)$/, ''); }
  onChooseItem(file) { app.workspace.getLeaf('tab').openFile(file); }
}
// Header: local time, no activity statistics.
const header = root.createEl('header', { cls: 'sd-header' });
const brand = header.createDiv({ cls: 'sd-brand' });
brand.createDiv({ cls: 'sd-eyebrow', text: 'A LITTLE SPACE TO LAND' });
brand.createEl('h1', { text: 'Sunset' });
brand.createDiv({ cls: 'sd-subtitle', text: 'Your notes. A quieter view.' });
const clock = header.createDiv({ cls: 'sd-clock' });
clock.createDiv({ cls: 'sd-eyebrow', text: 'LOCAL TIME' });
const clockTime = clock.createEl('time', { cls: 'sd-clock-time' });
const clockDate = clock.createDiv({ cls: 'sd-clock-date' });
const layout = root.createDiv({ cls: 'sd-layout' });
const left = layout.createDiv({ cls: 'sd-left' });
const center = layout.createDiv({ cls: 'sd-center' });
const right = layout.createDiv({ cls: 'sd-right' });

// Weather uses the configured location and time zone; advice is a simple clothing hint.
const weather = panel(left, 'Outside', 'cloud-sun', 'sd-weather');
const weatherNow = weather.createDiv({ cls: 'sd-weather-now' });
const weatherSummary = weatherNow.createDiv({ cls: 'sd-weather-summary' });
weatherSummary.createDiv({ cls: 'sd-location', text: weatherSettings.city });
const currentStamp = weatherSummary.createDiv({ cls: 'sd-current-stamp' });
const weatherMain = weatherNow.createDiv({ cls: 'sd-weather-main' });
const weatherIcon = weatherMain.createSpan({ cls: 'sd-weather-icon' });
const weatherTemp = weatherMain.createSpan({ cls: 'sd-temperature', text: '—' });
const weatherText = weatherSummary.createDiv({ cls: 'sd-weather-description', text: 'Loading weather…' });
const feelsLike = weatherSummary.createDiv({ cls: 'sd-muted' });
const advice = weather.createDiv({ cls: 'sd-weather-advice' });
const advicePeriod = advice.createDiv({ cls: 'sd-advice-period' });
const adviceTitle = advice.createDiv({ cls: 'sd-advice-title', text: 'Checking the day ahead…' });
const adviceDetail = advice.createDiv({ cls: 'sd-advice-detail' });
const hourlyLabel = weather.createDiv({ cls: 'sd-hourly-label' });
const hourlyChart = weather.createDiv({ cls: 'sd-hourly-chart' });
const hourlyStrip = weather.createDiv({ cls: 'sd-hourly-strip' });
weather.appendChild(advice);
const weatherStatus = weather.createDiv({ cls: 'sd-micro' });
external(weather, 'Open-Meteo ↗', 'https://open-meteo.com/', 'sd-weather-credit');
const localFormatter = new Intl.DateTimeFormat('en-GB', { timeZone: weatherSettings.timeZone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23' });
function localDay(now = new Date()) {
  const parts = Object.fromEntries(localFormatter.formatToParts(now).map(p => [p.type, p.value]));
  return { date: parts.year + '-' + parts.month + '-' + parts.day, hour: Number(parts.hour) };
}
function weatherDate(date) {
  return new Date(date + 'T12:00:00Z').toLocaleDateString('en-GB', { timeZone: weatherSettings.timeZone, weekday: 'short', day: 'numeric', month: 'short' });
}
function forecastRows(data, now = new Date()) {
  const local = localDay(now);
  const tomorrow = local.hour >= 18;
  const date = tomorrow ? new Date(Date.parse(local.date + 'T12:00:00Z') + 86400000).toISOString().slice(0, 10) : local.date;
  const h = data?.hourly;
  const rows = (h?.time || []).flatMap((time, i) => {
    const hour = Number(time.slice(11, 13));
    if (!time.startsWith(date) || hour < 6 || hour > 18) return [];
    return [{ hour, temperature: h.temperature_2m?.[i], feels: h.apparent_temperature?.[i], rain: h.precipitation_probability?.[i], wet: h.precipitation?.[i], snow: h.snowfall?.[i], wind: h.wind_speed_10m?.[i], gust: h.wind_gusts_10m?.[i], code: h.weather_code?.[i] }];
  });
  return { rows, upcoming: rows.filter(r => tomorrow || r.hour >= Math.max(6, local.hour)), tomorrow, date, local };
}
function clothingHint(rows) {
  if (!rows.length) return ['Forecast unavailable', 'Try again when weather reconnects.'];
  const has = (key) => rows.every(r => Number.isFinite(r[key]));
  if (!['feels', 'rain', 'wet', 'snow', 'wind', 'gust', 'code'].every(has)) return ['Forecast incomplete', 'Clothing hint will return with the next update.'];
  const coldest = Math.min(...rows.map(r => r.feels));
  const wet = rows.filter(r => r.rain >= 50 || r.wet >= 0.2);
  const snow = rows.some(r => r.snow > 0 || [71, 73, 75, 77, 85, 86].includes(r.code));
  const wind = Math.max(...rows.map(r => r.wind));
  const gust = Math.max(...rows.map(r => r.gust));
  const windy = wind >= 7 || gust >= 12;
  const details = [];
  if (snow) details.push('Snow possible');
  else if (wet.length) details.push('Rain possible around ' + String(wet[0].hour).padStart(2, '0') + ':00');
  if (windy) details.push('Gusts up to ' + Math.round(gust) + ' m/s');
  details.push('Feels as low as ' + Math.round(coldest) + '°');
  const title = snow ? 'Warm coat + grippy shoes' : wet.length ? (coldest <= 5 ? 'Warm, waterproof coat' : 'Grab a raincoat') : windy ? 'Take a windproof layer' : coldest <= 5 ? 'Take a warm coat' : coldest <= 13 ? 'A light jacket helps' : 'Light layers should do';
  return [title, details.join(' · ')];
}
function weatherCondition(code, day = true) {
  if (!Number.isFinite(code)) return ['Conditions unavailable', 'cloud'];
  if (code === 0) return [day ? 'Clear sky' : 'Clear night', day ? 'sun' : 'moon'];
  if (code <= 3) return [code === 3 ? 'Overcast' : 'Partly cloudy', code === 3 ? 'cloud' : 'cloud-sun'];
  if (code <= 48) return ['Foggy', 'cloud-fog'];
  if (code <= 57) return ['Drizzle', 'cloud-drizzle'];
  if (code <= 67) return ['Rain', 'cloud-rain'];
  if (code <= 77) return ['Snow', 'cloud-snow'];
  if (code <= 82) return ['Rain showers', 'cloud-rain'];
  if (code <= 86) return ['Snow showers', 'cloud-snow'];
  return ['Thunderstorms', 'cloud-lightning'];
}
function svgElement(parent, tag, attrs) {
  const el = doc.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [key, value] of Object.entries(attrs || {})) el.setAttribute(key, String(value));
  parent.appendChild(el);
  return el;
}
function paintHourly(rows, local) {
  hourlyChart.replaceChildren(); hourlyStrip.replaceChildren();
  if (!rows.length) { hourlyStrip.createSpan({ cls: 'sd-muted', text: 'Hourly forecast unavailable' }); return; }
  const values = rows.map(r => r.temperature).filter(Number.isFinite);
  if (!values.length) { hourlyStrip.createSpan({ cls: 'sd-muted', text: 'Temperatures unavailable' }); return; }
  const low = Math.min(...values) - 2, range = Math.max(...values) + 2 - low;
  const x = hour => 26 + (hour - 6) * (208 / 12);
  const y = temperature => 42 - ((temperature - low) / range) * 32;
  const svg = svgElement(hourlyChart, 'svg', { viewBox: '0 0 260 50', preserveAspectRatio: 'none', 'aria-hidden': 'true' });
  let segment = [];
  const finish = () => { if (segment.length) svgElement(svg, 'polyline', { points: segment.join(' '), fill: 'none', stroke: 'currentColor', 'stroke-width': 1.8, 'vector-effect': 'non-scaling-stroke', 'stroke-linejoin': 'round' }); segment = []; };
  for (const row of rows) { if (Number.isFinite(row.temperature)) segment.push(x(row.hour) + ',' + y(row.temperature)); else finish(); }
  finish();
  for (const row of rows.filter(r => r.hour % 3 === 0)) {
    if (Number.isFinite(row.temperature)) svgElement(svg, 'circle', { cx: x(row.hour), cy: y(row.temperature), r: 2.4, fill: 'currentColor' });
    const col = hourlyStrip.createDiv({ cls: 'sd-hour' });
    col.createSpan({ cls: 'sd-hour-time', text: String(row.hour).padStart(2, '0') + ':00' });
    const [condition, icon] = weatherCondition(row.code);
    const conditionIcon = col.createSpan({ cls: 'sd-hour-icon', attr: { title: condition, 'aria-hidden': 'true' } });
    setIcon(conditionIcon, icon);
    col.createSpan({ cls: 'sd-hour-temp', text: Number.isFinite(row.temperature) ? Math.round(row.temperature) + '°' : '—' });
    col.createSpan({ cls: 'sd-hour-rain', text: Number.isFinite(row.rain) ? row.rain + '%' : '—', attr: { title: 'Chance of precipitation' } });
    col.setAttribute('aria-label', String(row.hour).padStart(2, '0') + ':00, ' + condition + ', ' + col.querySelector('.sd-hour-temp').textContent + ', precipitation chance ' + col.querySelector('.sd-hour-rain').textContent);
  }
}
let weatherCache = read(weatherKey, null), lastWeatherPaint = '';
function paintWeather(data, stale = false) {
  if (!data?.current || !Number.isFinite(data.current.temperature_2m)) return false;
  const forecast = forecastRows(data);
  const paintKey = [data.savedAt, stale, forecast.date, forecast.local.hour].join(':');
  if (lastWeatherPaint === paintKey) return true;
  lastWeatherPaint = paintKey;
  const [description, icon] = weatherCondition(data.current.weather_code, !!data.current.is_day);
  setIcon(weatherIcon, icon);
  text(weatherTemp, Math.round(data.current.temperature_2m) + '°');
  const observed = data.current.time;
  text(currentStamp, observed ? (stale ? 'Saved · ' : 'Now · ') + weatherDate(observed.slice(0, 10)) + ' · ' + observed.slice(11, 16) : 'Current conditions');
  text(weatherText, description);
  text(feelsLike, Number.isFinite(data.current.apparent_temperature) ? 'Feels like ' + Math.round(data.current.apparent_temperature) + '°' : '');
  const [title, detail] = clothingHint(forecast.upcoming);
  text(adviceTitle, title); text(adviceDetail, detail);
  const dayLabel = (forecast.tomorrow ? 'Tomorrow' : 'Today') + ' · ' + weatherDate(forecast.date);
  text(advicePeriod, dayLabel + ' · ' + String(forecast.tomorrow ? 6 : Math.max(6, forecast.local.hour)).padStart(2, '0') + '–18h');
  text(hourlyLabel, dayLabel);
  hourlyLabel.setAttribute('title', '06:00–18:00 · Temperature in °C and chance of rain in % · ' + weatherSettings.timeZone);
  paintHourly(forecast.rows, forecast.local);
  const stamp = new Date(data.savedAt).toLocaleString('en-GB', { timeZone: weatherSettings.timeZone, day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  text(weatherStatus, (stale ? 'Offline · saved ' : 'Updated ') + stamp + ' · °C / rain %');
  return true;
}
let weatherBusy = false, nextWeatherAt = 0;
async function refreshWeather() {
  if (!visible() || weatherBusy || Date.now() < nextWeatherAt) return;
  if (weatherCache && Date.now() - weatherCache.savedAt < 20 * 60 * 1000) { paintWeather(weatherCache); nextWeatherAt = Date.now() + 60000; return; }
  weatherBusy = true; nextWeatherAt = Date.now() + 60000;
  try {
    const response = await requestUrl({ url: `https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(weatherSettings.latitude)}&longitude=${encodeURIComponent(weatherSettings.longitude)}&current=temperature_2m,apparent_temperature,weather_code,is_day&hourly=temperature_2m,apparent_temperature,precipitation_probability,precipitation,snowfall,wind_speed_10m,wind_gusts_10m,weather_code&wind_speed_unit=ms&timezone=${encodeURIComponent(weatherSettings.timeZone)}&forecast_days=2`, throw: false });
    if (response.status !== 200 || !response.json?.current || !response.json?.hourly?.time?.length) throw new Error('Weather unavailable');
    if (disposed) return;
    weatherCache = { ...response.json, savedAt: Date.now() };
    save(weatherKey, weatherCache); paintWeather(weatherCache);
  } catch {
    if (disposed) return;
    if (!paintWeather(weatherCache, true)) { text(weatherText, 'Weather unavailable'); text(adviceTitle, 'Forecast unavailable'); text(adviceDetail, ''); text(weatherStatus, 'Will retry automatically'); }
  } finally { weatherBusy = false; }
}
if (weatherCache) paintWeather(weatherCache, Date.now() - weatherCache.savedAt >= 20 * 60 * 1000);

// Illustrated navigation cards, with local vector artwork.
const areas = panel(center, 'Your spaces', 'layout-grid', 'sd-areas');
const cards = areas.createDiv({ cls: 'sd-cards' });
const destinations = [
  ['Projects', '01 - Projects', 'peach'], ['Areas', '02 - Areas', 'rose'],
  ['Resources', '03 - Resources', 'lavender'], ['Permanent', '04 - Permanent', 'blue'],
  ['Fleeting', '05 - Fleeting', 'mint'], ['Daily', '06 - Daily', 'sand'],
];
// Original generated illustrations traced to real SVG paths with VTracer.
const spaceArtwork = ['projects','areas-v3','resources','permanent','fleeting','daily'];
function cardArt(parent, index) {
  const path = '98 - Attachments/Dashboard/spaces/' + spaceArtwork[index] + '.svg';
  const file = app.vault.getAbstractFileByPath(path);
  if (file) parent.createEl('img', { cls: 'sd-card-art', attr: { src: app.vault.getResourcePath(file), alt: '', 'aria-hidden': 'true', decoding: 'async' } });
}
for (const [index, [label, path, color]] of destinations.entries()) {
  const card = button(cards, '', null, () => new FolderPicker(path, label).open(), 'sd-card sd-' + color);
  card.setAttribute('aria-label', 'Browse ' + label); card.title = 'Browse ' + path;
  cardArt(card, index);
  const caption = card.createDiv({ cls: 'sd-card-caption' });
  caption.createSpan({ cls: 'sd-card-label', text: label });
  caption.createSpan({ cls: 'sd-card-arrow', text: '↗' });
}

// Calendar is a small month overview, not an additional daily-note workflow.
const calendar = panel(right, 'Calendar', 'calendar-days', 'sd-calendar');
let month = new Date(); month.setDate(1);
const calBar = calendar.createDiv({ cls: 'sd-cal-bar' });
const calTitle = calBar.createDiv({ cls: 'sd-cal-title' });
const calNav = calBar.createDiv({ cls: 'sd-cal-nav' });
const calGrid = calendar.createDiv({ cls: 'sd-cal-grid' });
button(calNav, '', 'chevron-left', () => { month.setMonth(month.getMonth() - 1); renderCalendar(); }, 'sd-icon-button').setAttribute('aria-label', 'Previous month');
button(calNav, '', 'chevron-right', () => { month.setMonth(month.getMonth() + 1); renderCalendar(); }, 'sd-icon-button').setAttribute('aria-label', 'Next month');
function renderCalendar() {
  calTitle.textContent = month.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  calGrid.replaceChildren();
  for (const day of ['M', 'T', 'W', 'T', 'F', 'S', 'S']) calGrid.createSpan({ cls: 'sd-cal-weekday', text: day });
  const today = new Date();
  const offset = (new Date(month.getFullYear(), month.getMonth(), 1).getDay() + 6) % 7;
  const count = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  for (let i = 0; i < offset; i++) calGrid.createSpan({ cls: 'sd-cal-empty' });
  for (let d = 1; d <= count; d++) {
    const isToday = today.getFullYear() === month.getFullYear() && today.getMonth() === month.getMonth() && today.getDate() === d;
    const cell = calGrid.createSpan({ cls: `sd-cal-day${isToday ? ' sd-today' : ''}`, text: String(d) });
    if (isToday) cell.setAttribute('aria-current', 'date');
  }
}
renderCalendar();

// Countdown uses a real deadline, so suspended windows do not accumulate drift.
const timerPanel = panel(right, 'Timer', 'timer', 'sd-timer');
const freshTimer = () => ({ duration: 25 * 60, remaining: 25 * 60, deadline: null, sound: false });
let timer = read('timer', freshTimer());
if (!Number.isFinite(timer.duration) || timer.duration < 60 || timer.duration > 59940 || !Number.isFinite(timer.remaining) || timer.remaining < 0 || (timer.deadline !== null && !Number.isFinite(timer.deadline))) timer = freshTimer();
const timerReadout = timerPanel.createDiv({ cls: 'sd-timer-readout' });
const timerValue = timerReadout.createDiv({ cls: 'sd-timer-value', attr: { role: 'timer', 'aria-label': 'Countdown remaining' } });
const timerSettings = timerPanel.createDiv({ cls: 'sd-timer-settings' });
const presets = timerSettings.createDiv({ cls: 'sd-presets' });
function setDuration(minutes) { timer.duration = minutes * 60; timer.remaining = timer.duration; timer.deadline = null; save('timer', timer); renderTimer(); scheduleTick(); }
for (const minutes of [5, 25, 50]) button(presets, `${minutes}m`, null, () => setDuration(minutes), 'sd-preset');
const custom = timerSettings.createDiv({ cls: 'sd-custom-time' });
const durationLabel = custom.createEl('label');
const durationInput = durationLabel.createEl('input', { cls: 'sd-duration', attr: { type: 'number', min: '1', max: '999', step: '1', 'aria-label': 'Custom timer minutes' } });
durationLabel.createSpan({ text: 'min' });
durationInput.value = String(timer.duration / 60);
listen(durationInput, 'change', () => { const value = Number(durationInput.value); if (Number.isInteger(value) && value >= 1 && value <= 999) setDuration(value); else durationInput.value = String(timer.duration / 60); });
const timerActions = timerPanel.createDiv({ cls: 'sd-timer-actions' });
const startButton = button(timerActions, 'Start', 'play', () => {
  if (timer.deadline) { timer.remaining = Math.max(0, Math.ceil((timer.deadline - Date.now()) / 1000)); timer.deadline = null; }
  else { if (timer.remaining <= 0) timer.remaining = timer.duration; timer.deadline = Date.now() + timer.remaining * 1000; }
  save('timer', timer); renderTimer(); scheduleTick();
}, 'sd-primary');
button(timerActions, '', 'rotate-ccw', () => setDuration(timer.duration / 60), 'sd-icon-button').setAttribute('aria-label', 'Reset countdown');
let previousTimerIcon = '';
function renderTimer() {
  const remaining = timer.deadline ? Math.max(0, Math.ceil((timer.deadline - Date.now()) / 1000)) : timer.remaining;
  if (timer.deadline && remaining === 0) { timer.deadline = null; timer.remaining = 0; save('timer', timer); if (visible()) new Notice('Sunset — your timer is finished.'); }
  text(timerValue, `${String(Math.floor(remaining / 60)).padStart(2, '0')}:${String(remaining % 60).padStart(2, '0')}`);
  text(startButton.querySelector('span:last-child'), timer.deadline ? 'Pause' : remaining < timer.duration && remaining > 0 ? 'Resume' : 'Start');
  const icon = timer.deadline ? 'pause' : 'play';
  if (previousTimerIcon !== icon) { setIcon(startButton.querySelector('.sd-icon'), icon); startButton.setAttribute('aria-label', timer.deadline ? 'Pause countdown' : 'Start countdown'); previousTimerIcon = icon; }
  if (doc.activeElement !== durationInput && durationInput.value !== String(timer.duration / 60)) durationInput.value = String(timer.duration / 60);
}
renderTimer();

// Spotify Control owns authorization and credentials. This view reads no tokens.
const music = panel(center, 'Now playing', 'music-2', 'sd-music');
const musicBody = music.createDiv({ cls: 'sd-music-body' });
const albumPlaceholder = musicBody.createDiv({ cls: 'sd-album-placeholder' });
setIcon(albumPlaceholder, 'disc-3');
const albumImage = musicBody.createEl('img', { cls: 'sd-album', attr: { alt: 'Album artwork', hidden: '' } });
const musicDetails = musicBody.createDiv({ cls: 'sd-music-details' });
const songTitle = musicDetails.createDiv({ cls: 'sd-song-title', text: 'Your soundtrack, here' });
const songArtist = musicDetails.createDiv({ cls: 'sd-song-artist', text: 'Connect Spotify once to see what’s playing.' });
const musicStatus = musicDetails.createDiv({ cls: 'sd-micro' });
const progress = musicDetails.createEl('progress', { cls: 'sd-track-progress', attr: { max: '1', value: '0', 'aria-label': 'Track progress', hidden: '' } });
const musicControls = musicBody.createDiv({ cls: 'sd-music-controls' });
let playback = null, playbackAt = 0, spotifyBusy = false, controlBusy = false, nextSpotifyAt = 0, spotifyMode = '', lastPlaybackPaint = '';
const spotify = () => app.plugins.getPlugin('spotify-control');
const setup = button(musicControls, 'Connect Spotify', 'link', () => { const p = spotify(); if (p?.openSettings) p.openSettings(); else new Notice('Enable Spotify Control in Community plugins.'); }, 'sd-connect');
const transport = musicControls.createDiv({ cls: 'sd-transport' });
transport.hidden = true;
const prev = button(transport, '', 'skip-back', () => commandSpotify('previous'), 'sd-icon-button'); prev.setAttribute('aria-label', 'Previous Spotify track');
const play = button(transport, '', 'play', () => commandSpotify(playback?.is_playing ? 'pause' : 'play'), 'sd-icon-button sd-play'); play.setAttribute('aria-label', 'Play Spotify');
const next = button(transport, '', 'skip-forward', () => commandSpotify('next'), 'sd-icon-button'); next.setAttribute('aria-label', 'Next Spotify track');
external(musicControls, 'Open Spotify ↗', 'https://open.spotify.com/', 'sd-open-spotify');
function setArtwork(url) {
  const valid = typeof url === 'string' && /^https:\/\//.test(url);
  albumImage.hidden = !valid; albumPlaceholder.hidden = valid;
  if (valid && albumImage.getAttribute('src') !== url) albumImage.src = url;
  if (!valid) albumImage.removeAttribute('src');
}
function paintPlayback(state) {
  playback = state; playbackAt = Date.now();
  const item = state?.item;
  const paintKey = JSON.stringify([item?.id, item?.name, item?.artists, item?.show?.name, item?.album?.images?.[0]?.url, item?.images?.[0]?.url, state?.is_playing, state?.device?.name]);
  if (paintKey === lastPlaybackPaint && spotifyMode === 'connected') { if (item?.duration_ms) progress.value = state.progress_ms || 0; return; }
  lastPlaybackPaint = paintKey; spotifyMode = 'connected';
  setup.hidden = true; transport.hidden = false;
  if (!item) { songTitle.textContent = 'Nothing playing right now'; songArtist.textContent = 'Start a song in Spotify on any device.'; musicStatus.textContent = 'Connected'; progress.hidden = true; setArtwork(null); }
  else {
    songTitle.textContent = item.name || 'Spotify';
    songArtist.textContent = item.artists?.map(a => a.name).join(', ') || item.show?.name || '';
    musicStatus.textContent = `${state.is_playing ? 'Playing' : 'Paused'}${state.device?.name ? ` · ${state.device.name}` : ''}`;
    progress.hidden = !item.duration_ms; progress.max = item.duration_ms || 1; progress.value = state.progress_ms || 0;
    setArtwork(item.album?.images?.[0]?.url || item.images?.[0]?.url);
  }
  setIcon(play.querySelector('.sd-icon'), state?.is_playing ? 'pause' : 'play');
  play.setAttribute('aria-label', state?.is_playing ? 'Pause Spotify' : 'Play Spotify');
}
async function refreshSpotify(force = false) {
  if (!visible() || spotifyBusy || (!force && Date.now() < nextSpotifyAt)) return;
  const p = spotify();
  if (!p?.auth?.isAuthed) {
    nextSpotifyAt = Date.now() + 15000;
    if (spotifyMode === 'disconnected') return;
    spotifyMode = 'disconnected';
    playback = null; setup.hidden = false; transport.hidden = true; progress.hidden = true; setArtwork(null);
    songTitle.textContent = 'Your soundtrack, here'; songArtist.textContent = 'Connect Spotify once to see what’s playing.'; musicStatus.textContent = '';
    nextSpotifyAt = Date.now() + 10000; return;
  }
  if (typeof p.api?.getPlaybackState !== 'function') { text(songArtist, 'Spotify Control needs a compatible version.'); nextSpotifyAt = Date.now() + 60000; return; }
  spotifyBusy = true;
  try {
    const state = await p.api.getPlaybackState();
    if (disposed) return;
    paintPlayback(state); nextSpotifyAt = Date.now() + 15000;
  } catch {
    if (disposed) return;
    spotifyMode = 'error'; text(musicStatus, 'Connection unavailable · retrying shortly');
    playback = null; transport.hidden = true; setup.hidden = false; progress.hidden = true;
    nextSpotifyAt = Date.now() + 60000;
  } finally { spotifyBusy = false; }
}
async function commandSpotify(method) {
  if (controlBusy || typeof spotify()?.api?.[method] !== 'function') return;
  controlBusy = true; [prev, play, next].forEach(b => b.disabled = true);
  try { await spotify().api[method](); nextSpotifyAt = 0; await refreshSpotify(true); }
  catch { new Notice('Spotify command unavailable. Check that Spotify is open on a device.'); }
  finally { controlBusy = false; if (!disposed) [prev, play, next].forEach(b => b.disabled = false); }
}
const footer = root.createEl('footer', { cls: 'sd-footer' });
footer.createSpan({ text: 'SUNSET / a view into your vault' });
button(footer, 'About & setup', null, () => openFile('99 - Meta/Dashboard/README.md'), 'sd-about');
let previousDay = '', previousMinute = '', tickTimeout = null;
const clockFormatter = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
function tick() {
  if (!visible()) return;
  const now = new Date();
  const minute = Math.floor(now.getTime() / 60000);
  if (previousMinute !== minute) { previousMinute = minute; text(clockTime, clockFormatter.format(now)); clockTime.dateTime = now.toISOString(); }
  if (previousDay !== now.toDateString()) {
    previousDay = now.toDateString();
    text(clockDate, now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }));
    renderCalendar();
  }
  if (timer.deadline) renderTimer();
  refreshSpotify(); refreshWeather();
}
function scheduleTick() {
  win.clearTimeout(tickTimeout);
  if (!visible()) return;
  // Idle: 15-second wakeups, with no unchanged DOM writes. Countdown: 1 second.
  tickTimeout = win.setTimeout(() => { tick(); scheduleTick(); }, timer.deadline ? 1000 : Math.min(15000, 60000 - Date.now() % 60000));
}
function resume() { tick(); scheduleTick(); }
host.__sunsetInstance = { version, component: dv.component, root, resume, get disposed() { return disposed; } };
cleanups.push(() => win.clearTimeout(tickTimeout));
listen(doc, 'visibilitychange', resume);
if (win.IntersectionObserver) {
  const observer = new win.IntersectionObserver(entries => {
    const inView = entries.some(entry => entry.isIntersecting);
    if (inView !== onScreen) { onScreen = inView; resume(); }
  });
  observer.observe(root); cleanups.push(() => observer.disconnect());
}
const frame = win.requestAnimationFrame(resume);
cleanups.push(() => win.cancelAnimationFrame(frame));

} catch (error) {
  dv.container.createEl("pre", { cls: "sd-load-error", text: "Sunset Dashboard could not load: " + (error?.message || String(error)) });
}
