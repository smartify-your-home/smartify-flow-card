## v0.5.9 – Verbraucher sortieren und Schriftgröße prozentuell einstellen (2026-11-03)

- Klassische Listenansicht sortiert nun **alle** sichtbaren Verbraucherkacheln nach aktueller Leistung (W), einschließlich **Sonstige** (zusammengefasste Verbraucher) und **Nicht erfasst** (Restlast). Größter Verbraucher steht oben, stabile Reihenfolge bei Gleichstand.
- Die Quellen-Zuordnung (PV, Akku, Netz), Linien und Prozentwerte bleiben von der visuellen Sortierung unabhängig.
- Neuer Schieberegler und Zahlenfeld **Schriftgröße aller Kartentexte (%)** in *Darstellung & Animation*: 50–200 %, Standard 100 %. Skaliert Namen, Titel, Werte, Einheiten, Quell-Badges und Statistiken; klassische und radiale Ansicht.
- Kompatibel mit bestehendem `font_scale` in YAML (1.0 = 100 %). Zusätzliche Regressionstests gegen Sortierungs- und Schriftgrößenfehler.
- Keine Änderungen der gespeicherten Verbraucher-Konfiguration; HA-Live-Test noch ausstehend.

## v0.5.8 – Prozentwerte linksbündig und ganzzahlig (2026-11-03)

- Kleines Quellen-Badge oben rechts: PV-, Akku-, Netz- und offene Anteile linksbündig, auch bei einer einzigen Zeile.
- Prozentwerte auf ganze Zahlen (0 Nachkommastellen) gerundet.
- Badge-Größe und Position bleiben unverändert; Leistungswert und Tagesenergie ebenfalls.
- Regressionstest für Ausrichtung und Rundung erweitert. Keine Änderung der Wattverteilung oder Dashboard-Konfiguration.

## v0.5.7 – Kompakte Quellanteile wiederhergestellt (2026-11-03)

- Rücknahme des unbeabsichtigten Vollbreiten-Blocks für Quellen-Prozentwerte aus v0.5.6.
- Ursprüngliches **kleines graues Badge oben rechts** neben dem Gerätenamen wiederhergestellt; PV-, Akku- und Netzanteile stehen innerhalb des Badges untereinander.
- Leistungswert und Tagesenergie behalten ihre ursprünglichen Positionen; keine breite graue Leiste unter dem Leistungswert.
- Bestehende Quellenverteilung aus v0.5.6 bleibt erhalten. Neuer Regressionstest verhindert zukünftiges Ausweiten/Versetzen des Badges.
- Keine Änderung an gespeicherten Geräte- oder Dashboard-Konfigurationen. HA-Live- und Mobiltests stehen noch aus.

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
