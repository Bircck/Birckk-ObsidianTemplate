# Appearance and plugins

## Folder colors

The **Colored Sidebar Items** snippet by CyanVoxel assigns colors using numbered folder prefixes. Edit the color variables and prefix groups in `.obsidian/snippets/Colored Sidebar Items.css` to change the palette. Folder names carry the structure even with the snippet disabled.

The optional **Iconize** plugin (`obsidian-icon-folder`) adds the folder symbols. Its supplied configuration contains only the template folder rules and a star for Start here. If icons are missing, check that the Lucide icon set is selected in Iconize settings.

## Note styles

| Snippet | Purpose |
| --- | --- |
| CyanVoxel's General Tweaks | Link styling, spacing, images, and callout details |
| Daily Note Themes | Weekday colors using `daily` plus an English weekday class such as `thursday` |
| Notebook Backgrounds | Paper and pen colors applied through note properties |
| sunset-dashboard | Styling scoped to the Sunset Dashboard and its folder picker |

Try [[99 - Meta/Notebook example|Notebook example]] and [[06 - Daily/2026-01-01|the example daily note]]. Disable individual snippets in Appearance to compare their effects. Daily templates use the built-in `{{date:dddd}}` token; with a non-English locale, replace the generated weekday class with its English name. The daily snippet names optional fonts; system fonts serve as fallbacks.

This template defaults to Obsidian's dark theme. **Vanilla AMOLED**, installed separately through Appearance → Themes, is the theme used in my personal vault. No theme files are redistributed here.

## Plugins

Start with the built-in Daily notes, Templates, Bookmarks, Canvas, and File recovery features already enabled in the supplied settings.

| Community plugin | When it is useful |
| --- | --- |
| [Dataview](https://github.com/blacksmithgu/obsidian-dataview) | Required only for the dashboard; enable JavaScript queries after installation |
| [Iconize](https://github.com/FlorianWoelki/obsidian-iconize) | Folder and note icons |
| [Self-hosted LiveSync](https://github.com/vrtmrz/obsidian-livesync) | Sync through your own server; see [[99 - Meta/Sync|Sync]] |
| [Obsidian Git](https://github.com/Vinzent03/obsidian-git) | Optional private version history |
| [Calendar](https://github.com/liamcain/obsidian-calendar) | Navigate daily notes from a calendar |
| [Tasks](https://github.com/obsidian-tasks-group/obsidian-tasks) | Queries and management beyond basic checkboxes |
| [Templater](https://github.com/SilentVoid13/Templater) | More advanced templates; not needed by the included templates |
| [Excalidraw](https://github.com/zsviczian/obsidian-excalidraw-plugin) | Drawings linked to notes |
| [Homepage](https://github.com/mirnovov/obsidian-homepage) | Open Home or the dashboard when starting Obsidian |
| [Style Settings](https://github.com/mgmeyers/obsidian-style-settings) | Options exposed by themes or snippets that support it |
| [Spotify Control](https://github.com/caezium/obsidian-spotify-control) | Optional dashboard playback integration; see its requirements before installing |

Install only the plugins you want. Each device needs its own working installation and any required authentication.

## Why the baseline stays small

My setup started with CyanVoxel’s template and grew through individual additions. The notebook classes are useful for particular notes; they do not need to be applied everywhere. The dashboard is an optional way into the same folders.

Built-in Bases and ordinary checkboxes cover plenty of everyday organization. Dataview earns its place here for the dashboard; Tasks and advanced templates are optional additions. My setup notes list Linter for Markdown cleanup, and TagFolder, Map View, and Day Planner or Kanban as ideas to try when there is a concrete need. They are not part of this baseline.

AI-assisted note organization remains an experiment in my notes, rather than a requirement for using this vault. Keep your own writing and judgment central. A separate life archive or a published website can have different needs from a working notes vault.

For quick navigation, use the command palette. Meta notes and templates can be excluded from the graph if they make it harder to follow your ideas.
