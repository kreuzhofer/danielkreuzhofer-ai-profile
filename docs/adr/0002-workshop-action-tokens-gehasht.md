# Workshop-Action-Tokens als Hashes in der DB (Abweichung vom Scorecard-Pattern)

## Kontext

Die bestehenden Scorecard-Funnels speichern DOI- und Report-Tokens als Klartext in der DB (`submissions.doi_token`, `scorecard_submissions.doi_token`/`report_token`, generiert via `randomBytes(32).toString("base64url")`). Diese Tokens schalten einen personalisierten Report frei — niedriger Wert, kein Status-Übergang im System.

Der Workshop-Funnel führt Magic-Link-Admin-Tokens ein (ADR-0001), die Status-Übergänge mit Geld- und Kapazitäts-Folgen auslösen: `confirm-payment` markiert eine Anmeldung als `booked` und feuert den TrackMySales-Revenue-Webhook; `cancel` gibt einen Slot frei. Ein Leak dieser Tokens (z. B. weitergeleitete Admin-Mail, DB-Dump) hat direkte geschäftliche Auswirkungen.

## Entscheidung

Workshop-Action-Tokens (`confirm_payment_token`, `cancel_token`) werden **gehasht** in der DB gespeichert (SHA-256, kryptographischer Zufall im Klartext, nur im Mail-Link). Der Lookup bei Klick erfolgt durch Hashen des URL-Tokens und Vergleichen mit dem gespeicherten Hash. Der pro-Workshop-`admin_token` für die Übersichts-Seite wird ebenfalls gehasht gespeichert.

DOI-Tokens für den Workshop-Newsletter folgen demselben Muster (Hash), auch wenn ihr Wert niedriger ist — Konsistenz innerhalb des Workshop-Moduls.

## Alternativen, die wir verworfen haben

- **Klartext wie Scorecards**: einfacher Lookup (`WHERE token = ?`), aber ein DB-Leak kompromittiert alle offenen Action-Links. Bei Admin-Aktionen mit Geld-Folge unverhältnismäßig.
- **JWT statt DB-Tokens**: stateless, aber Revokation (single-use) braucht eh eine DB-Sperrliste, und das `admin_token` ist langlebig — JWT passt hier nicht.

## Konsequenzen

- Lookup ist zweistufig: URL-Token hashen, dann `WHERE token_hash = ?`. Minimaler Code-Overhead.
- Single-use-Tokens werden nach Klick invalide (Token-Spalte wird `null` oder Status-Flag gesetzt). Für erneute Aktion an derselben Anmeldung muss ggf. ein neuer Token generiert werden (Pilot: einfachstatus `booked`/`cancelled` ist terminal, kein Retry nötig).
- Das Scorecard-Pattern bleibt unangetastet — die Abweichung ist bewusst auf das Workshop-Modul beschränkt und hier dokumentiert. Eine spätere Härtung der Scorecard-Tokens ist möglich, aber nicht Teil dieser Entscheidung.
- Die generische `newToken()`-Hilfsfunktion kann reuse werden; eine neue `hashToken()`-Hilfsfunktion ergänzt sie im Workshop-Modul.
