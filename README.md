# Smartify Flow Card – Home-Assistant-Integration

**Integration v0.5.7 · Karte v0.5.7**

Die Integration liefert `smartify-flow-card.js` direkt aus `custom_components/smartify_flow_card/frontend/` aus und registriert die JavaScript-Modul-Ressource automatisch. Ein manuelles Kopieren nach `www` ist nicht mehr nötig.

## Funktionen

- Einfache Einrichtung über **Einstellungen → Geräte & Dienste → Integration hinzufügen → Smartify Flow Card**.
- Automatische Lovelace-Ressourcenregistrierung im Speicher-Modus (`resource_mode: storage`).
- Versions-URL gegen Browsercache: `/smartify_flow_card/smartify-flow-card.js?v=0.5.7`.
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
/smartify_flow_card/smartify-flow-card.js?v=0.5.7
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
    - url: /smartify_flow_card/smartify-flow-card.js?v=0.5.7
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

HACS ermittelt bei Repositories ohne GitHub-Releases unter Umständen die Revision anhand des Git-Commit-Hashes. Dieses Projekt veröffentlicht deshalb **versionierte GitHub-Releases und passende Tags**, zum Beispiel `v0.5.7`. Im HACS-Updatebereich ist die aktuelle veröffentlichte Version maßgeblich. Nach einem HACS-Update startet die Integration mit der passenden versionierten Ressource, etwa `/smartify_flow_card/smartify-flow-card.js?v=0.5.7`.

Bei einer neu angelegten Integration bitte zuerst in HACS aktualisieren und dann **Home Assistant neu starten**, bevor du Browser und App neu lädst. Nach einem Release prüfen, ob der Tag, das Release und die angezeigte HACS-Version übereinstimmen. Ein Commit auf `main` allein ist kein Release.

## Fachliche Bedienhinweise

- **PV-Verteilung:** Verbraucher nach aktueller Leistung (groß nach klein). Der gelbe Kachelstreifen zeigt den modellierten PV-Anteil genau dieses Geräts. Im **kleinen Badge oben rechts neben dem Gerätenamen** stehen die jeweils diesem Gerät zugeteilten Anteile in Prozent, **untereinander**: `PV`, `Akku` und `Netz`. Die Anteile werden vom größten Verbraucher absteigend aus den verfügbaren Quellen-Leistungen zugeteilt und verwenden dieselben Wattwerte wie die zugehörigen animierten Linien. Bei fehlenden Quellenwerten erscheint ein Anteil `offen` statt einer erfundenen Netzdeckung. Die Verteilung ist eine Prioritätsvisualisierung, keine physikalisch gemessene Geräteversorgung.
- **Quellen und Netz:** Ein Netzsaldo-Sensor mit wählbarem Vorzeichen oder getrennte Bezugs-/Einspeisesensoren; eine dynamische Netzkachel zeigt immer beide bisherigen Tagesenergiezähler an.
- **Geräte:** Automatische Erkennung von Leistungssensoren mit HA-Label `verbraucher`; manuelle Auswahl mit Schnellsuche und eigenem Namen, Icon und Farbe weiterhin möglich. Beides kann kombiniert werden.
- **Einblendung:** Anzeigeleistung und Schalter zum Ausblenden sowie separate Ausgrau-Schwelle. Unsichtbare Geräte bleiben in der Dashboard-Konfiguration gespeichert.
- **Prozentanzeige:** Der ursprünglich kleine, graue Badge bleibt oben rechts neben dem Gerätenamen (keine breite Leiste unter dem Leistungswert). Bei mehreren Quellen erscheinen die Werte untereinander, z. B. `10 % PV` und darunter `90 % Netz`. Die Leistungszahl und Tagesenergie bleiben an ihrer bisherigen Position. Keine Änderung an der dynamischen Quellenberechnung.ndenen Anteile eines Verbrauchers (`10 % PV · 25 % Akku · 65 % Netz`) stehen unter dem großen Leistungswert im grauen Badge; 2 px größere Schrift als bisher und exakt zentriert, auf schmalen Bildschirmen mehrzeilig. Nicht zugewiesene Quellen werden nicht angezeigt; bei unvollständiger Quellenmessung wird der Rest als `offen` kenntlich gemacht.
- **Darstellung:** Klassisches oder Radiallayout mit animierten Kurven, PV-Verbindungen in dunklem Gelb, Theme-Textfarben, 20 % kleineren Einheiten, Theme-Rundungen und einstellbarer Hintergrundtransparenz.
- **Energiestatistik:** Gesamtenergiezähler werden für Tageswerte verwendet; PV-Eigenverbrauchsquote = `(PV-Ertrag − Einspeisung) / PV-Ertrag × 100`. Bei Akku ist die Autarkie ohne zusätzliche Energiezähler nur eine Näherung.

## Hinweise

- Dashboard-Konfigurationen bleiben getrennt vom Integrationscode in HA gespeichert. Für langfristige Sicherung sind Home-Assistant-Backups sinnvoll.
- Nach Entfernen der Integration kann der Ressourceneintrag manuell gelöscht werden. Beim bloßen Entladen lassen wir ihn bewusst bestehen.
- Die JavaScript-Datei wird wie übliche Dashboard-Ressourcen über eine URL bereitgestellt und enthält keine Zugangsdaten.