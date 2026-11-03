## v0.5.5 – PV-Kachelbadges korrigiert

- PV-Prozentwerte je Verbraucher statt globaler Haus-PV-Quote.
- PV-Badge nur bei tatsächlicher PV-Linie und zugeteilter PV-Leistung.
- Bei kleineren positiven Anteilen Anzeige mit einer Nachkommastelle; keine falsche 0-%-Anzeige.
- NETZ-/AKKU-Hinweis bei Verbrauchern ohne PV-Zuweisung; vorhandene Gerätekonfiguration bleibt erhalten.

# Änderungen

## 0.5.4 – Integration-Paket (2026-11-03)

- Bestehende Smartify Flow Card 0.5.4 unverändert gebündelt.
- Home-Assistant-Integration mit einmaligem Einrichtungsdialog.
- Asynchrone statische Auslieferung der Karte direkt aus der Integration.
- Automatische Registrierung, Aktualisierung und bekannte Legacy-Migration von Lovelace-Ressourcen im Speichermodus.
- Schutz vor versehentlichem Überschreiben anderer Lovelace-Ressourcen durch vorheriges Laden des Resource Store.
- Tests für Neuregistrierung, Updates, Migration, Duplikate und YAML-Modus.
- Lovelace-Geräte- und Dashboard-Konfiguration bleibt unangetastet.
