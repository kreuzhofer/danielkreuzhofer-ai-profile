# Security — Known & Accepted Risks

Stand: 2026-08-29 (letztes `npm audit` auf `frontend/`)

## Accepted: esbuild 0.18.20 in der drizzle-kit-Dev-Kette

`npm audit` meldet 4 moderate Einträge, die auf eine einzige Root-Cause laufen:

```
drizzle-kit → @esbuild-kit/esm-loader → @esbuild-kit/core-utils → esbuild 0.18.20
```

**Warum akzeptiert:**

- **Nur dev-only:** `drizzle-kit` ist ein CLI-Tool (Migrations/Generate). Die produktive
  Runtime nutzt es ausschließlich als CLI beim Container-Start (`db:migrate:deploy`);
  es wird nicht als Server ausgeliefert.
- **Keine echte Angriffsfläche:** Das Advisory betrifft den *esbuild-Dev-Server*
  (beliebige Webseiten können Requests an ihn senden). drizzle-kit nutzt nur die
  esbuild-Transform-API — der Dev-Server wird nie gestartet.
- **Upstream nicht fixiert:** Das neueste `@esbuild-kit/core-utils` (3.3.2) pinnt
  weiterhin `esbuild ~0.18.20`; das neueste stabile `drizzle-kit` (0.31.10) hängt
  weiter an `@esbuild-kit/esm-loader`. Ein Upgrade auflöst das nicht.
- **Override-Falle (dokumentiert, 2026-08-29):** `overrides` in `package.json`
  greift bei npm 11 nur bei *Erstellung* des Lockfiles, nicht bei Updates eines
  bestehenden. Die einzige saubere Lösung wäre eine komplette Lockfile-Regenerierung
  (massiver, risikoreicher Diff) — für ein Advisory ohne reale Exposition unverhältnismäßig.

**Re-Check-Trigger:** Wenn `drizzle-kit` oder `@esbuild-kit` eine Version mit
gepatchtem esbuild veröffentlicht, oder das Lockfile ohnehin regeneriert wird —
dann audit erneut prüfen und diese Notiz entfernen.
