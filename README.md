# Smartify Flow Card – Home-Assistant-Integration

**Integration v0.6.8 · Karte v0.6.8**

Die Integration liefert `smartify-flow-card.js` direkt aus `custom_components/smartify_flow_card/frontend/` aus und registriert die JavaScript-Modul-Ressource automatisch. Ein manuelles Kopieren nach `www` ist nicht mehr nötig.

## Funktionen

- Einfache Einrichtung über **Einstellungen → Geräte & Dienste → Integration hinzufügen → Smartify Flow Card**.
- Automatische Lovelace-Ressourcenregistrierung im Speicher-Modus (`resource_mode: storage`).
- Versions-URL gegen Browsercache: `/smartify_flow_card/smartify-flow-card.js?v=0.6.8`.
- Updates synchronisieren den vorhandenen Ressourceneintrag, ohne weitere Ressourceneinträge zu ändern.
- Migration eines vorhandenen Ressourceneintrags unter `/local/smartify-flow-card.js` (ggf. mit `?v=...`).
- Doppelte Einträge der **bekannten** Smartify-Pfade werden bereinigt.
- Der Karten-Typ bleibt `custom:smartify-flow-card` – vorhandene Dashboard-Karten müssen nicht umgestellt werden.
- Verbraucher, Entitäten, Labels, Farben und Editor-Einstellungen verbleiben in der **Lovelace-Kartenkonfiguration**. Sie werden beim Update **nicht überschrieben**.

## Installation über HACS bzw. Marketplace

1. In HACS **Benutzerdefinierte Repositories** öffnen und `https://github.com/smartify-your-home/smartify-flow-card` als **Integration** hinzufügen.
2. **Smartify Flow Card** installieren und Home Assistant neu starten.
3. Unter **Einstellungen → Geräte & Dienste → Integration hinzufügen** „Smartify Flow Card“ auswählen und den Einrichtungsdialog bestätigen.
4. **Einstellungen → Dashboards → Ressourcen** kontrollieren. Erwartet wird genau eine Smartify-Ressource vom Typ JavaScript-Modul.
5. Browser beziehungsweise Home-Assistant-App neu laden und `type: custom:smartify-flow-card` verwenden.

> Die Integration wird nicht bereits durch das bloße Installieren in HACS konfiguriert. Der Config-Flow muss einmal abgeschlossen werden.

### Migration von der bisherigen JavaScript-Datei

Die bisherige Karte unter `/config/www/smartify-flow-card.js` **nicht gleich löschen**. Nach Einrichtung unter **Einstellungen → Dashboards → Ressourcen** prüfen, ob jetzt **genau eine** Smartify-Ressource eingetragen ist:

```text
/smartify_flow_card/smartify-flow-card.js?v=0.6.8
```

Ein vorhandener Eintrag `/local/smartify-flow-card.js` wird automatisch in diesen Pfad geändert. Falls du eine alternative Ressource, z. B. über `/hacsfiles/...`, eingerichtet hast, muss diese manuell entfernt werden, damit die Karte nicht doppelt geladen wird. **Andere** Ressourcen verändert die Integration nicht. Danach Browsercache aktualisieren; die alte Datei kann dann entfernt werden.

### Installation ohne HACS

Den Ordner `custom_components/smartify_flow_card` samt Inhalt nach `/config/custom_components/smartify_flow_card` kopieren, Home Assistant neu starten und den Einrichtungsdialog öffnen.

### Lovelace mit YAML-Ressourcen

Bei `lovelace: resource_mode: yaml` verändert die Integration die YAML-Datei **nicht**. Trage die Ressource selbst ein:

```yaml
lovelace:
  resource_mode: yaml
  resources:
    - url: /smartify_flow_card/smartify-flow-card.js?v=0.6.8
      type: module
```

Nach Updates den Parameter `?v=` aktualisieren und die Ressourcen neu laden. Die automatische Eintragung funktioniert ausschließlich im Lovelace-Speicher-Modus.

## Konfiguration einer Karte

```yaml
type: custom:smartify-flow-card
label: verbraucher
solar:
  power: sensor.pv_leistung_gesamt
grid:
  mode: saldo
  saldo_power: sensor.DEIN_NETZSALDO
  positive_import: true
```

Der Karteneditor bietet Schnellsuche, Quellenwahl, Verbraucher-Management, PV-Anteile, Radiallayout und weitere Optionen. `sensor.DEIN_NETZSALDO` muss durch deine Entität ersetzt werden.

## Entwickler-Workflow

Die JavaScript-Quelldatei befindet sich unter:

`custom_components/smartify_flow_card/frontend/smartify-flow-card.js`

Bei einem neuen Release die Versionsangaben in `SFC_VERSION` (JS), `manifest.json`, README, Beispielen und CHANGELOG synchron aktualisieren. Die Veröffentlichung erhält immer einen **GitHub-Tag `vX.Y.Z` und ein GitHub-Release mit derselben Nummer** – dadurch soll HACS eine Versionsnummer statt einer Git-Commit-Kennung anbieten. Der Workflow `.github/workflows/release.yml` veröffentlicht Tags/Releases bei einer Versionsänderung. **Vorher alle Prüfungen bestehen lassen.** Integration per HACS/Marketplace aktualisieren und HA erforderlichenfalls neu starten; bei geladenem Config-Entry synchronisiert sie anschließend die Ressource.

### Prüfungen

```sh
python -m unittest discover -s tests -v
python -m compileall -q custom_components
node --check custom_components/smartify_flow_card/frontend/smartify-flow-card.js
python scripts/check_version.py
```

Die Unit-Tests bilden die Ressourcenverwaltung nach; **ein echter Test auf einer laufenden Home-Assistant-Instanz bleibt erforderlich**.

## Versionsanzeige und Updates

HACS ermittelt bei Repositories ohne GitHub-Releases unter Umständen die Revision anhand des Git-Commit-Hashes. Dieses Projekt veröffentlicht deshalb **versionierte GitHub-Releases und passende Tags**, zum Beispiel `v0.6.8`. Im HACS-Updatebereich ist die aktuelle veröffentlichte Version maßgeblich. Nach einem HACS-Update startet die Integration mit der passenden versionierten Ressource, etwa `/smartify_flow_card/smartify-flow-card.js?v=0.6.8`.

Bei einer neu angelegten Integration bitte zuerst in HACS aktualisieren und dann **Home Assistant neu starten**, bevor du Browser und App neu lädst. Nach einem Release prüfen, ob der Tag, das Release und die angezeigte HACS-Version übereinstimmen. Ein Commit auf `main` allein ist kein Release.

## Fachliche Bedienhinweise

- **PV-Verteilung:** PV-Zuteilung vom kleinsten Verbraucher zum größten (unabhängig von der Anzeige-Sortierung). Jeder Verbraucher hat unten einen **22 px hohen, segmentierten Farbstreifen**: Gelb = PV, Grün = entladender Akku, **individuelle Gerätefarbe = Netzanteil**, neutral = nicht zugeordnet. Die Breite entspricht der individuellen Watt-Zuteilung; die auf ganze Prozentwerte gerundeten Labels stehen mittig **im jeweiligen Farbsegment**, soweit dort Platz ist. Bei sehr kleinen Anteilen bleibt die Farbe sichtbar, der Text entfällt zur Vermeidung von Überlappungen. Segment-Elemente werden nur beim Quellenwechsel neu erstellt; die Textplatzprüfung mit Hysterese verhindert flackernde Prozentangaben, insbesondere beim Netzanteil. Tooltip/Kachelbeschreibung enthält alle Wattwerte. Das Modell ist eine priorisierte Visualisierung und keine physikalische Einzelmessung.
- **Quellen und Netz:** Ein Netzsaldo-Sensor mit wählbarem Vorzeichen oder getrennte Bezugs-/Einspeisesensoren; eine dynamische Netzkachel zeigt immer beide bisherigen Tagesenergiezähler an.
- **Geräte:** Automatische Erkennung von Leistungssensoren mit HA-Label `verbraucher`; manuelle Auswahl mit Schnellsuche und eigenem Namen, Icon und Farbe weiterhin möglich. Beides kann kombiniert werden.
- **Sortierung:** In der klassischen Listenansicht werden alle Verbraucher nach aktueller Leistung absteigend sortiert, inklusive der Sammelkachel **Sonstige** und **Nicht erfasst**. Eine Sammelkachel mit der höchsten Leistung steht ganz oben. Die Quellleistungs-Zuteilung ändert sich durch die Darstellungssortierung nicht.
- **Schriftgröße:** Unter **Darstellung & Animation → Schriftgröße aller Kartentexte (%)** von 50 bis 200 % einstellbar (Standard 100 %). Der Wert skaliert Titel, Namen, Leistungen, Einheiten, Badges und Statistiken einschließlich Radialansicht. Das bisherige YAML-Feld `font_scale: 1` bleibt kompatibel; z. B. `font_scale: 1.2` für 120 %.
- **Einblendung:** Anzeigeleistung und Schalter zum Ausblenden sowie separate Ausgrau-Schwelle. Unsichtbare Geräte bleiben in der Dashboard-Konfiguration gespeichert.
- **Prozentanzeige:** Keine zusätzlichen Prozent-Badges bei Verbrauchern: Stattdessen sind die individuellen PV-/Akku-/Netz-/offen-Prozentwerte in den farbigen Fußstreifen der jeweiligen Gerätekacheln integriert. Kleine Segmente behalten Farbe und Tooltip, aber keinen überlappenden Text. Geräte-Namen, Leistung und Tagesenergie behalten ihre bisherige Anordnung.
- **Darstellung:** Klassisches oder Radiallayout mit animierten Kurven, PV-Verbindungen in dunklem Gelb, Theme-Textfarben, 20 % kleineren Einheiten, Theme-Rundungen und einstellbarer Hintergrundtransparenz.
- **Energiestatistik:** Gesamtenergiezähler werden für Tageswerte verwendet; PV-Eigenverbrauchsquote = `(PV-Ertrag − Einspeisung) / PV-Ertrag × 100`. Bei Akku ist die Autarkie ohne zusätzliche Energiezähler nur eine Näherung.

## Quellenzuordnung und Linienbreite (ab v0.6.7)

Unter **Karte bearbeiten → Darstellung & Animation** stehen drei zusätzliche Funktionsgruppen zur Verfügung:

- **Quellenverteilung:** `smallest_first` (Standard) verteilt PV zuerst an den kleinsten Verbraucher und deckt danach verbleibende Watt mit Akku/Netz. `proportional` verteilt den rechnerischen PV-/Akku-/Netz-Mix gleichmäßig anteilig auf alle erfassten Verbraucher. Beide Modelle begrenzen die Zuteilung auf die tatsächlich verfügbaren Quellenbudgets und den erfassten Geräteverbrauch. Nicht gedeckte Leistungen bleiben als „offen“ ausgewiesen; die Zuordnung ist ein Visualisierungsmodell, keine physikalische Einzelmessung.
- **Skalierung der Linienbreite:** `sqrt` (Standard ab 0.6.7) hebt kleinere Energieflüsse mit der Quadratwurzel-Skalierung hervor; `linear` nutzt eine lineare Skalierung.
- **Minimale/Maximale Linienbreite:** `line_width_min: 1.5` und `line_width_max: 4.5` (Pixel, standardmäßig). Werte werden auf den Bereich 0,5–20 px begrenzt, und die maximale Breite wird nie kleiner als die minimale verwendet.

Die Einstellungen wirken in der klassischen und radialen Ansicht. Die bestehenden Animationszeiten werden bei Sensorupdates nicht ständig zurückgesetzt. Bestehende Karten erhalten weiterhin das bisherige PV-Zuordnungsmodell, aber standardmäßig die neue Quadratwurzel-Optik der Linien; wer die bisherige lineare Optik bevorzugt, wählt `line_scale: linear`. Ein Beispiel für YAML: `allocation: proportional`, `line_scale: sqrt`, `line_width_min: 1.5`, `line_width_max: 6`.

## Einheitliche Entitäten- und Icon-Suche (ab v0.6.7)

**Alle Entitäten-Picker im Karteneditor und in den Plus-/Minus-Verbraucher-Popups** nutzen dieselbe HA-Vorschlagsliste mit Live-Suche nach Anzeigename und Entity-ID, Einheit, Entitätsicon, Pfeiltasten/Enter und scrollbarerer Vorschlagsliste für Maus und Touch. Die Browser-`datalist` wurde aus den Verbraucherdialogen entfernt. Beim Bearbeiten werden Entitäten im Popup **nur vorgemerkt**; erst „Änderungen speichern“ übernimmt sie in die Lovelace-Kartenkonfiguration.

- **Leistung:** ausschließlich `sensor.*` mit `device_class: power` oder ohne Geräteklasse mit Einheit W, kW oder MW. Andere Sensorarten werden nicht vorgeschlagen oder als Leistungsentität gespeichert.
- **Energie:** ausschließlich `sensor.*` mit `device_class: energy` oder ohne Geräteklasse mit Einheit Wh, kWh oder MWh. Unpassende Entitäten lassen sich nicht speichern; der Energiezähler bleibt optional.
- **Icon-Suche für die ganze Karte:** Icon-Felder für PV, Netz, Akku sowie Verbraucher verwenden dieselbe suchbare Vorschlagsliste mit **sichtbaren MDI-Symbolen**. Die Suche versteht Bezeichnungen und `mdi:`-Namen; bekannte Home-Assistant-Icons und ein Katalog mit über 100 häufig genutzten Symbolen stehen bereit. Auch eigene gültige `mdi:icon-name`-Werte sind möglich. Ein benutzerdefiniertes Netzicon ersetzt bei Bedarf das automatisch je Stromrichtung wechselnde Standardsymbol.

## Verbraucher über Plus/Minus verwalten (ab v0.6.5)

**Ab v0.6.8:** Beim Öffnen des Verbraucher-Popups per Plus oder Minus bleibt die Power-Entitätensuche zunächst geschlossen. Der Fokus liegt auf der Dialogüberschrift; die vorhandene Vorschlagsliste öffnet sich erst, wenn das Suchfeld selbst angeklickt bzw. fokussiert wird. Die Suchfunktionen bleiben unverändert.

Im **visuellen Lovelace-Karteneditor → Verbraucher → Verbraucher verwalten** befindet sich rechts oben ein kleines **Plus (+)**. Es öffnet ein Popup zum Anlegen eines Verbrauchers, mit Leistungs-Entity (Suche nach Home-Assistant-Sensoren in W/kW), Anzeigename, MDI-Icon, Gerätefarbe und optionalem Gesamtenergiezähler. Das **Minus (−)** in der zugehörigen Verbraucherkachel öffnet **dasselbe Popup im Bearbeitungsmodus**, mit vorausgefüllten Werten und den Aktionen **Änderungen speichern**, **Abbrechen** und **Verbraucher entfernen**. Entfernen benötigt eine zusätzliche Bestätigung; bloßes Klicken auf das Minus löscht nichts.

Das Speichern läuft über den üblichen `config-changed`-Mechanismus des Lovelace-Editors. Änderungen werden in `consumers` gespeichert; aus der Karte entfernte Label-Verbraucher erscheinen nicht erneut, da sie unter `excluded_consumers` vermerkt werden. Wird ein zuvor ausgeblendeter Sensor erneut über das Plus angelegt, wird diese Sperre aufgehoben. Der Nutzer kann die Einstellungen daher durch erneutes Hinzufügen wiederherstellen. Der allgemeine Karteneditier- und Speichervorgang von Home Assistant ist weiterhin erforderlich. **Im normalen, nicht bearbeiteten Dashboard gibt es keine persistierenden Plus/Minus-Aktionen**; bestehende Verbraucher-Klicks öffnen weiter More-Info. In v0.6.5 sind die Knöpfe absichtlich im visuellen Editor platziert, um die gespeicherte Dashboardkonfiguration zuverlässig zu ändern.

## Quellenkacheln frei anordnen (ab v0.6.5)

Unter **Karte bearbeiten → Darstellung & Animation → Reihenfolge der Quellenkacheln** lassen sich **PV, Akku und Netz** per Ziehgriff mit Maus und Touch nach oben oder unten verschieben. Alternativ gibt es **Auf/Ab-Schaltflächen**; am fokussierten Ziehgriff funktionieren auch die Pfeiltasten. Die neue Reihung wird nur nach dem Loslassen oder einer Tastenbetätigung gespeichert.

Die Einstellung heißt `source_order` (Beispiel: `['_battery', '_solar', '_grid']`). Ohne Einstellung bleibt **PV → Akku → Netz**, ohne Batteriesensor werden nur PV und Netz gezeigt. Auch das Radiallayout übernimmt die Reihung. Auf dem normalen Dashboard bleiben die Quellenkacheln anklickbar und nicht verschiebbar. Stromaufteilung, PV-Priorität und Verbraucher-Sortierung ändern sich nicht.

## PV-Priorität (ab v0.6.5)

Das verfügbare PV-Budget wird **vom kleinsten zum größten Einzelverbraucher** vergeben. Kleine Geräte werden zuerst vollständig mit PV-Leistung zugeordnet; nur die Restleistung geht an größere Geräte. Erst danach wird noch offener Verbrauch rechnerisch aus Akku-Entladung und Netzbezug gedeckt. **Die Listenansicht bleibt weiterhin nach Verbrauch absteigend sortiert** (einschließlich „Sonstige“ und „Nicht erfasst“); diese Reihenfolge beeinflusst die PV-Zuteilung nicht. Die Verteilung ist ein Visualisierungsmodell, kein Messnachweis für die physikalische Stromherkunft pro Gerät.

## Flackerfreie Aktualisierung (ab v0.6.5)

Bei häufigen Home-Assistant-Sensoraktualisierungen werden bestehende Kacheln nach Entity-/Kachelschlüssel wiederverwendet, statt sämtliche Geräte und Flussanimationen neu aufzubauen. Der Radialmodus behält seine Reihenfolge bei Leistungsschwankungen bei und aktualisiert Kachelpositionen/SVG-Kurven nur, wenn sich tatsächlich etwas ändert. ResizeObserver und Sensoraktualisierungen werden zu einem Zeichenaufruf pro Frame zusammengefasst. Bestehende Linienstile und Animationen bleiben erhalten; Leistungswerte und Quellenanteile werden weiterhin live aktualisiert.

**Hinweis:** Beim tatsächlichen Hinzufügen, Ausblenden oder Entfernen eines Verbrauchers muss das Layout weiterhin angepasst werden. Ein HA-Livetest (insbesondere Radialmodus auf iPhone/iPad) steht noch aus.

## Hinweise

- Dashboard-Konfigurationen bleiben getrennt vom Integrationscode in HA gespeichert. Für langfristige Sicherung sind Home-Assistant-Backups sinnvoll.
- Nach Entfernen der Integration kann der Ressourceneintrag manuell gelöscht werden. Beim bloßen Entladen lassen wir ihn bewusst bestehen.
- Die JavaScript-Datei wird wie übliche Dashboard-Ressourcen über eine URL bereitgestellt und enthält keine Zugangsdaten.