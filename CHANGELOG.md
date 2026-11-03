## v0.5.6 – PV-, Akku- und Netzanteil je Verbraucher (2026-11-03)

- Jeder Verbraucher zeigt unter seiner Leistung die individuelle, rechnerisch zugeteilte Quellenaufteilung: **PV % · Akku % · Netz %**.
- PV-/Akku-/Netzlinien verwenden genau dieselben Watt-Zuweisungen wie die Prozentangaben; bei 0 W Anteil gibt es keinen entsprechenden Quellfluss und keinen Prozent-Eintrag.
- Priorität: Verbraucher absteigend nach Leistung, Quellenbudget der Reihe nach PV → Akku (nur beim Entladen) → Netz. Quellenleistungen werden nicht mehrfach verteilt.
- Sind Quellenwerte unvollständig, wird ein nicht zugeordneter Rest als „offen“ ausgewiesen, statt ihn fälschlich dem Netz zuzuschlagen.
- Prozentanzeige **unter dem Leistungswert**, im grauen Hintergrund horizontal/vertikal zentriert, Schrift gegenüber vorher +2 px, auf schmalen Geräten mehrzeilig statt abgeschnitten.
- Regressionstests für ein Gerät mit 10 % PV / 90 % Netz, PV/Akku/Netz-Mix, fehlende Messdeckung, Priorisierung und 0-W-Gerät.
- Bestehende YAML-Konfiguration und das klassische/Radial-Layout bleiben unverändert nutzbar; Home-Assistant-Livetest noch ausständig.

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
