# Smartify Flow Card – Home-Assistant-Integration

**Integration v0.5.4 · Karte v0.5.4**

Die Integration liefert `smartify-flow-card.js` direkt aus `custom_components/smartify_flow_card/frontend/` aus und registriert die JavaScript-Modul-Ressource automatisch. Ein manuelles Kopieren nach `www` ist nicht mehr nötig.

## Funktionen

- Einfache Einrichtung über **Einstellungen → Geräte & Dienste → Integration hinzufügen → Smartify Flow Card**.
- Automatische Lovelace-Ressourcenregistrierung im Speicher-Modus (`resource_mode: storage`).
- Versions-URL gegen Browsercache: `/smartify_flow_card/smartify-flow-card.js?v=0.5.4`.
- Updates synchronisieren den vorhandenen Ressourceneintrag, ohne weitere Ressourceneinträge zu ändern.
- Migration eines vorhandenen Ressourceneintrags unter `/local/smartify-flow-card.js` (ggf. mit `?v=...`).
- Doppelte Einträge der **bekannten** Smartify-Pfade werden bereinigt.
- Der Karten-Typ bleibt `custom:smartify-flow-card` – vorhandene Dashboard-Karten müssen nicht umgestellt werden.
- Verbraucher, Entitäten, Labels, Farben und Editor-Einstellungen verbleiben in der **Lovelace-Kartenkonfiguration**. Sie werden beim Update **nicht überschrieben**.

## Installation über HACS bzw. Marketplace

1. Öffentliches GitHub-Repository mit **dieser gesamten Repository-Struktur** anlegen (kein zweites Integration-Verzeichnis).
2. Vor der Veröffentlichung die Platzhalter-URLs im Manifest mit `python scripts/set_repo.py OWNER/REPO` aktualisieren.
3. Das Repo als **benutzerdefiniertes Repository vom Typ Integration** hinzufügen.
4. Integration installieren und Home Assistant gegebenenfalls neu starten.
5. Unter **Einstellungen → Geräte & Dienste → Integration hinzufügen** „Smartify Flow Card“ auswählen und den Einrichtungsdialog bestätigen.
6. Browser/App neu laden und Dashboard-Karte `type: custom:smartify-flow-card` verwenden.

> Die Integration wird nicht bereits durch das bloße Installieren in HACS konfiguriert. Der Config-Flow muss einmal abgeschlossen werden.

### Migration von der bisherigen JavaScript-Datei

Die bisherige Karte unter `/config/www/smartify-flow-card.js` **nicht gleich löschen**. Nach Einrichtung unter **Einstellungen → Dashboards → Ressourcen** prüfen, ob jetzt **genau eine** Smartify-Ressource eingetragen ist:

```text
/smartify_flow_card/smartify-flow-card.js?v=0.5.4
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
    - url: /smartify_flow_card/smartify-flow-card.js?v=0.5.4
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

Bei einem neuen Release **beide Versionsangaben anpassen**: `SFC_VERSION` in JavaScript und `version` in `manifest.json`. Danach README und CHANGELOG aktualisieren. Integration per HACS/Marketplace aktualisieren und HA erforderlichenfalls neu starten; bei geladenem Config-Entry synchronisiert sie anschließend die Ressource.

### Prüfungen

```sh
python -m unittest discover -s tests -v
python -m compileall -q custom_components
node --check custom_components/smartify_flow_card/frontend/smartify-flow-card.js
```

Die Unit-Tests bilden die Ressourcenverwaltung nach; **ein echter Test auf einer laufenden Home-Assistant-Instanz bleibt erforderlich**.

## Hinweise

- Dashboard-Konfigurationen bleiben getrennt vom Integrationscode in HA gespeichert. Für langfristige Sicherung sind Home-Assistant-Backups sinnvoll.
- Nach Entfernen der Integration kann der Ressourceneintrag manuell gelöscht werden. Beim bloßen Entladen lassen wir ihn bewusst bestehen.
- Die JavaScript-Datei wird wie übliche Dashboard-Ressourcen über eine URL bereitgestellt und enthält keine Zugangsdaten.