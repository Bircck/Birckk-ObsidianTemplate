---
cssclasses:
  - sunset-dashboard
---

```dataviewjs
await dv.view("99 - Meta/Dashboard", {
  obsidian: require("obsidian"),
  weather: {
    city: "Copenhagen",
    latitude: 55.6761,
    longitude: 12.5683,
    timeZone: "Europe/Copenhagen"
  }
});
```
