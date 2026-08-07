# Magic-Link-Admin ohne Auth-Stack für den Workshop-Pilot

## Kontext

Der Workshop „KI-Souveränität" (Pilot, 5 Plätze) braucht eine minimale Admin-Funktion: Daniel muss nach Zahlungseingang eine Anmeldung als „bezahlt" markieren (→ Termin/Pre-Work-Mail an Teilnehmer, TrackMySales-Revenue-Konversion), stornieren, und alle Anmeldungen eines Termins einsehen können. Das Repo hat keinen Auth-Stack, und für einen 5-Platz-Piloten ist der Bau eines Login-Systems unverhältnismäßig.

## Entscheidung

Admin-Aktionen laufen über **scoped Magic-Links in E-Mails an Daniel**, nicht über ein Login. Jede Anmeldungs-Mail enthält:

- einen **Zahlung-bestätigt-Link** (pro Anmeldung, single-use-Token) → Status `reserved → booked`, triggert Teilnehmer-Mail + TrackMySales-Revenue-Webhook
- einen **Storno-Link** (pro Anmeldung, single-use-Token) → Status `cancelled`, Slot frei
- die Tokens sind lang, kryptographisch zufällig, gehasht in der DB; jeder Token ist auf eine Aktion und eine Anmeldung beschränkt (least-privilege)

Die **Übersichts-Seite** läuft über einen **separaten, pro-Workshop wiederverwendbaren Token** (Link in derselben Mail oder in einer separaten Admin-Mail). Keine Passwort-Authentifizierung, kein Admin-Login-Framework.

## Alternativen, die wir verworfen haben

- **Globaler Admin-Token in jeder Mail**: ein Leak = Vollzugriff auf alle Anmeldungen. Abgelehnt (least-privilege).
- **Login-Stack (Auth-Anbieter / Basic-Auth)**: Unverhältnismäßig für einen Piloten mit 5 Anmeldungen und einem Admin. Nicht ausgeschlossen für Folge-Runden oder das langfristige Verwaltungs-MVP; für den Piloten bewusst nicht gebaut.
- **Manuelles DB-Update ohne Code-Trigger**: TrackMySales-Revenue-Konversion und Teilnehmer-Mail würden dann keinen automatischen Trigger haben. Der Magic-Link löst genau diesen Übergang sauber im Code.

## Konsequenzen

- Keine Admin-UI im Pilot — die drei Aktionen (bestätigen, stornieren, Übersicht) reichen.
- Ein Token-Leak (weitergeleitete Mail) betrifft maximal eine Anmeldung, nicht alle. Der Übersichts-Token ist wiederverwendbar und damit höherwertig — er sollte nicht in denselben Mails landen wie die Action-Tokens, oder nur in einer klar als „Daniel only" markierten Admin-Sektion.
- Wenn das Verwaltungs-MVP kommt, wird der Magic-Link-Flow durch eine echte Admin-UI mit Login ersetzt; das Datenmodell (Status-Felder, Token-Spalten) bleibt bestehen.
