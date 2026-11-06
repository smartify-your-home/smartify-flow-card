<p align="center"><img src="https://raw.githubusercontent.com/smartify-your-home/smartify-flow-card/main/custom_components/smartify_flow_card/brand/logo.png" alt="smartify Flow Card" width="420"></p>

## Schrift-Hierarchie der Statistiken (v0.6.23, vorbereitet)

Wie bei den bestehenden Verbraucher-Kacheln sind die Einheiten **kWh** und **kW** in Gesamtenergiebedarf, 15-Minuten-Monatsmaximum und Monats-Historie als eigene Spans auf **80 % der Zahlenschrift** mit Schriftgewicht 650 gesetzt. Alle teilen sich eine einzige CSS-Regel mit `.val .unit`; die Zahlen selbst bleiben in der normalen Wertgröße.


Die **fünf Statistikzeilen und die aufgeklappte Historie** verwenden nun dieselben CSS-Selektoren statt separater Größen: Überschriften 0,70 em/800/Versalien, Zusatzzeilen 0,76 em und Hauptwerte 1,15 em/800. Schriftgewicht, Zeichenabstand und Darstellung stimmen überein. Auch „Historie“ und Monatsnamen folgen der Titelregel (0,70 em), historische kW-Werte der Hauptwertregel (1,15 em) und deren Zeitstempel der Zusatztextregel (0,76 em). Die Einrückung bleibt erhalten.\n\n
Die bisherigen Größenangaben der drei ursprünglichen Statistikzeilen sind die verbindliche Referenz. Für alle fünf Statistikzeilen gelten identische CSS-Regeln. Die eingerückte Historie behält ihre eigene Darstellung; die Monatswerte bleiben höchstens genauso groß wie ihr Titel.

## Historische Verbraucher mit Teiljahresdaten (ab v0.6.22)

Auch die **geöffneten Historieneinträge** – Monatsname, kW-Wert und Zeitpunkt – verwenden jetzt größere Schrift; Zeitstempel behalten einen leicht untergeordneten, aber gut lesbaren Schriftgrad. Der schmale Smartphone-Bildschirm bleibt berücksichtigt.


Die Statistik-Schriftgrößen sind jetzt einheitlich: Überschriften 0,70 em, Zeiträume und Zusatztexte 0,76 em sowie Hauptwerte 1,15 em. Das eingerückte Ausklappmenü **„Historie“** bleibt bewusst gut lesbar (0,83 em). Auch auf schmalen Smartphones werden Hauptwerte nicht verkleinert; die Texte dürfen umbrechen.\n\n
Die Statistikbox verwendet kompaktere vertikale Abstände: Unter „Gesamtenergiebedarf“ rückt die Trennlinie sichtbar nach oben; die 15-Minuten-Spitze und „Historie“ folgen dichter. Die Spaltenaufteilung bleibt erhalten, auch auf Smartphone-Displays.\n\n
Verbraucher mit Energie-Gesamtzählern, deren Recorder-Statistiken erst im laufenden Jahr oder einem anderen gewählten Zeitraum beginnen, werden **nicht mehr ausgeblendet**, wenn der Zeitraum-Anfang fehlt. Die Karte sucht bei fehlender Startgrenze gezielt den ersten vorhandenen Tages- und Stundenstatistikwert **innerhalb des ausgewählten Zeitraums**, nutzt diesen tatsächlich gemessenen kumulativen Wert als Baseline und zeigt den nachfolgenden Energieverbrauch an. In der Verbraucherkachel erscheint **„Teilzeitraum · Daten ab …“**. Es werden niemals fehlende Monate mit Null ergänzt oder der vollständige Zählerstand als Verbrauch genommen. Ohne gültige Anfangs- **oder** Endgrenze bleibt der Verbrauch weiterhin unbekannt.

Die normale genaue Grenzwertberechnung für vollständige Zeiträume, die PV-Anlagen, Stromnetz-/Akku-Gesamtenergie und die gespeicherten Monatsmaxima bleiben unverändert. Recorder-Abfragen für die Nachsuche sind auf einen Tagesstatistik-Scan und ein kleines Stundenfenster je tatsächlich neu beginnendem Zähler begrenzt.

## Kompakte 15-Minuten-Historie auf Smartphones (ab v0.6.21)

Die aufklappbare Vormonatsliste unter dem maximalen 15-Minuten-Netzbezug heißt jetzt **„Historie“**. Der Aufklapper ist eingerückt und ohne Trennlinie direkt mit dem Monatsmaximum verbunden. Auf schmalen Displays dürfen Überschrift und Zeitpunkt umbrechen; der kW-Wert bleibt sichtbar und die Monatszeilen passen sich der Bildschirmbreite an. Datenspeicherung, Gesamtenergiebedarf und Berechnungen bleiben unverändert.

## Sensor und Gesamtenergiebedarf (ab v0.6.20)

Nach der ersten Registrierung des Netzbezugs-Gesamtenergiezählers durch die Karte legt die Integration einen echten Home-Assistant-Sensor **„Max. 15-Min.-Netzbezug“** (kW) an, mit dem Monatsmaximum des laufenden Monats als Zustand. Das Attribut `monatswerte` enthält die Maxima einschließlich Zeitpunkt und Teilzeitraum-Hinweis **des aktuellen Kalenderjahres**. Das vollständige, auch mehrjährige Archiv bleibt unabhängig von der HA-Recorder-Datenbank in `.storage/smartify_flow_card_monthly_peaks` erhalten und ist über den vorhandenen WebSocket-Endpunkt verfügbar. Bei mehreren registrierten Importzählern wird jeweils ein Sensor mit eigener Unique ID angelegt. Änderungen am Speicher aktualisieren die Entität; es ist keine YAML-Konfiguration nötig. Alte Monatswerte können nicht vor ihrem ersten aufgezeichneten Viertelstundenwert nachträglich rekonstruiert werden.

Die Statistiken der Flow Card zeigen darunter eine eigene Zeile **„Gesamtenergiebedarf“**: Live/Tag = heute, Monat = laufender Monat, Jahr = laufendes Jahr, Datum = gewählter Zeitraum. Die Formel lautet `PV-Ertrag + Netzbezug − Netzeinspeisung + Akkuentladung − Akkuladung`. Fehlende notwendige Energiezähler ergeben **„–“**, nie eine künstliche Null; bei Akku müssen Lade- und Entlade-Gesamtenergiezähler vorhanden sein. Die 15-Minuten-Spitze zeigt unabhängig vom Zeitfilter weiterhin den **aktuellen Monat**. Bestehende Flow-/Editor-Einstellungen bleiben erhalten.

## Monatliche 15-Minuten-Netzbezugsspitzen und Version (ab v0.6.19)

Die Statistik-Kachel **„Max. 15-Min.-Netzbezug · aktueller Monat“** zeigt immer das höchste vollständig gemessene Viertelstunden-Mittel **des laufenden Kalendermonats**, auch bei den Filtern Live, Tag, Monat und Jahr. Mit **„Vormonate anzeigen“** lassen sich die abgeschlossenen Monate desselben Jahres bis inklusive Jänner aufklappen (jeweils kW und Zeitpunkt); nicht gespeicherte Monate erscheinen als „–“.

Das Backend erfasst alle fünf Minuten die abgeschlossenen 15-Minuten-Intervalle des konfigurierten **Netzbezugs-Gesamtenergiezählers** (`grid.import_total`) aus Recorder-5-Minuten-Summen. Es speichert pro Statistik-ID Monatsmaximum, Zeitpunkt und Abdeckungsbeginn in Home Assistant unter `.storage/smartify_flow_card_monthly_peaks`. Die Erfassung läuft nach der erstmaligen Registrierung beim Anzeigen der Karte automatisch weiter, **auch ohne geöffnetes Dashboard**, sowie nach Home-Assistant-Neustarts. Beim ersten Start werden höchstens neun Tage rückwirkend aus Kurzzeitstatistiken nachgetragen. Bereits gelöschte Rohdaten sind nicht rekonstruierbar; ein fehlender Monatsanfang wird als **Teilzeitraum** gekennzeichnet. Bei Recorder-Ausfällen oder fehlenden Viertelstunden erfolgt keine Schätzung aus Stundenmittelwerten. Die Sammlung ist unabhängig von der PV-Zuordnung.

Unten rechts zeigt die Karte dezent **v0.6.19**; die Nummer stammt automatisch aus `SFC_VERSION` und stimmt mit der installierten Ressource überein. Keine zusätzliche Konfiguration, Automation oder Helper nötig. Zur erstmaligen Registrierung muss die Karte nach Installation einmal aufgerufen werden.

## Historische Linien beim Wechsel Live → Monat → Tag

Beim Wechsel der Zeitfilter wird die SVG-Geometrie nach Wiederanzeige des Flow-Containers ein zweites Mal im nächsten Animationsframe geprüft. Die Pfade und laufenden Animationen bleiben erhalten. Ein Gerät mit positivem historischem Verbrauch, dessen kWh nicht vollständig einer verfügbaren Quelle zugeordnet werden können, zeigt nun ausdrücklich **„Quellenzuordnung unvollständig“** mit offener Energiemenge. Das ist keine erfundene Zuordnung: Ohne verfügbare Quelle wird weiterhin keine Verbindung gezeichnet. Für Verbraucher mit 0 kWh werden weiterhin keine Linien erzeugt.

# Smartify Flow Card – Home-Assistant-Integration

**Integration v0.6.25 · Karte v0.6.25**

Die Integration liefert `smartify-flow-card.js` direkt aus `custom_components/smartify_flow_card/frontend/` aus und registriert die JavaScript-Modul-Ressource automatisch. Ein manuelles Kopieren nach `www` ist nicht mehr nötig.

## Mehrere benannte PV-Anlagen (ab v0.6.16)

Im Karteneditor unter **Photovoltaik** können beliebig viele PV-Anlagen angelegt und entfernt werden. Jede Anlage hat einen frei wählbaren **Namen**, einen **Leistungssensor (W/kW)** und einen **kumulierten Gesamtenergiezähler (kWh)**. Beide Sensoren werden über denselben suchbaren, nach Geräteklasse gefilterten Entity-Picker wie bisher gewählt. Die Namen (z. B. Dach, Balkon, Garage) dienen der Konfiguration; in der Flow Card erscheint weiterhin eine einzige PV-Quellenkachel mit dem frei wählbaren gemeinsamen PV-Namen und Icon.

Die **Live-PV-Leistung** ist die Summe der einzelnen Leistungswerte. **Heute/Tag/Monat/Jahr/freier Zeitraum** summiert die unabhängig ermittelten Energiezuwächse der einzelnen Recorder-Statistikreihen. Beginnt die Statistik einer neuen PV-Anlage erst nach dem Jahresanfang, wird deren erster verfügbarer Stundenwert als *Teilzeitraum* gekennzeichnet; es wird nicht fälschlich der bestehende Gesamtzählerstand als Ertrag betrachtet. Liegt die Erstinstallation nach dem betrachteten Zeitraum, beträgt ihr Beitrag null. Fehlen benötigte tatsächliche Statistikwerte, wird keine fiktive Null eingesetzt.

**Bestehende Karten bleiben gültig:** Die bisherigen Einstellungen `solar.power` und `solar.energy_total` werden beim Öffnen des Karteneditors in eine erste Anlage unter `solar.plants` überführt. Name und Icon der gemeinsamen Kachel, Prognosesensoren, Grid/Batterie/Verbraucher-Einstellungen bleiben unverändert. Bei einer einzelnen Anlage bleibt die Anzeige wie bisher. Beispiel:

```yaml
solar:
  name: PV
  plants:
    - name: Dach
      power: sensor.solaredge_se10k_rwb48_ac_power
      energy_total: sensor.solaredge_se10k_rwb48_ac_energy
    - name: Balkon
      power: sensor.balkon_pv_leistung
      energy_total: sensor.total_balkon_pv_ertrag
```

Die beispielhaften Leistungssensor-IDs sind vor dem Speichern durch die tatsächlich vorhandenen HA-Entitäten zu ersetzen.

## Historische Jahressummen aus echten Zählerständen (ab v0.6.15)

Die Jahres-/Monats-/Tagesansicht liest **zwei kleine Recorder-Stundenfenster** am Start und am Ende des ausgewählten Zeitraums. Die Energie ergibt sich aus den **tatsächlich gespeicherten kumulierten Summen** (`sum Ende − sum Anfang`); das zuvor verwendete `statistic_during_period.change` wird nicht mehr verwendet, weil die API bei fehlender Anfangsstatistik eine implizite 0 verwenden kann.

Am Zeitraumbeginn wird bevorzugt der unmittelbar **vorhergehende Stundenbucket** benutzt (exakte Grenze). Fehlt er, ist die erste Stunde des ausgewählten Tages ein zulässiger Ersatz **mit Kennzeichnung als Teilzeitraum**: die Energie ab dessen Ende zählt, die erste Stunde nicht. Fehlt selbst dieser Wert, erscheint „–“ statt einer erfundenen Jahresenergie. Am Ende wird die neueste verfügbare vollständige Stundenstatistik berücksichtigt; für Zeiträume bis heute die neuesten verfügbaren 5-Minuten-Statistiken. Es werden keine zukünftigen, unvollständigen oder zwei Stunden und mehr zurückliegenden Grenzwerte als aktuelle Energiedaten ausgegeben.

Die Abfragen verlangen kWh ausdrücklich. Dies gilt einheitlich für PV, Netzbezug, Einspeisung, optionale Akku-Zähler und alle Einzelgeräte. „Nicht erfasst“ wird erst berechnet, wenn die benötigten Quellenwerte vorhanden sind. Für Home Assistant müssen passende Recorder-Langzeitstatistiken vorhanden sein. Eine unterbrochene Zählerreihe mit falschen historischen Sprüngen kann dadurch nicht automatisch repariert werden.

## Schutz gegen überhöhte Jahresenergie (ab v0.6.14)

Die Auswertung **Tag / Monat / Jahr / Datum** prüft zusätzlich, ob für jeden Energiezähler an der **Startgrenze** des gewählten Zeitraums tatsächlich eine Recorder-Stundenstatistik vorliegt. Denn `recorder/statistic_during_period` kann ohne historische Startstatistik einen fälschlich großen `change`-Wert liefern, indem es einen fehlenden Anfangszählerstand als 0 interpretiert. Ein solcher Wert darf **nicht** als PV-, Bezugs-, Akku- oder Geräteenergie erscheinen: Die Kachel zeigt stattdessen „–“ bzw. „nicht verfügbar“. Das verhindert auch überhöhte „Nicht erfasst“-Werte, die sonst als Folge eines falschen PV-Wertes entstehen.

Die Recorder-Differenz wird ausdrücklich in **kWh** angefordert; ein gegenwärtig anders eingestelltes Sensor-Einheitenformat wird nicht nochmals multipliziert. Vollständige und korrekte Langzeitstatistiken sind weiterhin erforderlich. Bei im Recorder selbst gespeicherten Ausreißern hilft die Prüfung allein nicht; solche Daten müssen gegebenenfalls unter **Entwicklerwerkzeuge → Statistik** kontrolliert werden. Kein neuer Helper und keine Lovelace-Konfigurationsmigration nötig. Regressionstests: `tests/test_historical_view.cjs`, `tests/test_historical_periods.cjs`.

## Schnellzeiträume und freier Datumsbereich (ab v0.6.13)

Direkt oben auf der Karte stehen jetzt **Live · Datum · Tag · Monat · Jahr**. `Tag` lädt **heute von Mitternacht bis jetzt**, `Monat` lädt **den laufenden Kalendermonat bis jetzt**, `Jahr` lädt **das laufende Kalenderjahr bis jetzt**. Die drei Schnellbuttons aktualisieren direkt ohne zusätzlichen Bestätigungsdialog. `Live` bleibt die Live-Watt-Ansicht; `Datum` öffnet weiterhin den responsiven Kalenderdialog mit **Einzelner Tag** oder **Zeitraum** und der bewussten Bestätigung durch **OK**. `Abbrechen` lässt die vorige Ansicht unverändert. Sensorupdates schließen den Dialog nicht.

**Monats- und Jahreswechsel sind ausdrücklich erlaubt**: z. B. 25.10.–05.11. oder 20.12.–15.01. Historische Auswertungen sind nicht mehr künstlich auf 31 Tage begrenzt; zur Begrenzung übermäßig großer Anfragen gilt eine Obergrenze von fünf Jahren. Es dürfen keine Daten nach heute ausgewählt werden; heute wird als unvollständiger Tag nur bis zum aktuellen Zeitpunkt berechnet. Bei aktuellen Zeiträumen werden die Ergebnisse höchstens eine Minute zwischengespeichert; bei abgeschlossenen Zeiträumen fünf Minuten.

Die kWh werden mit `recorder/statistic_during_period` und der Veränderung (change) des jeweiligen Gesamtenergiezählers **direkt für den ausgewählten Zeitraum** abgefragt. Das vermeidet umfangreiche stündliche Zeitreihen bei Jahresabfragen und nutzt verfügbare Home-Assistant-Statistiken. Der separate maximale 15-Minuten-Netzbezug wird nur angezeigt, wenn die **vollständigen** 5-Minuten-Daten des gesamten ausgewählten Zeitfensters vorhanden sind. Für längere beziehungsweise ältere Zeiträume bleibt der Wert „–“; es wird kein scheinbares Jahresmaximum aus unvollständigen Tagen geschätzt. Die historischen Verbraucher-, Akku-, Netz-, Restenergie- und Statistikfunktionen aus v0.6.11/12 bleiben erhalten.

## Historische Energiebilanz mit optionalem Speicher (ab v0.6.12)

In der **historischen Netz-Kachel** wird der Netzbezug des gewählten Zeitraums als Hauptwert und darunter ausdrücklich **Bezug** und **Lieferung / Einspeisung** als getrennte kWh-Gesamtmengen angezeigt. Eine Saldierung der Zähler erfolgt nicht.

Der **optionale Batteriespeicher** besitzt im visuellen Karteneditor unter „Batteriespeicher“ zwei zusätzliche **Energy-Entity-Picker** (nur Wh/kWh/MWh bzw. device_class energy): `battery.charge_total` („Akku-Ladeenergie Gesamtenergiezähler“) und `battery.discharge_total` („Akku-Entladeenergie Gesamtenergiezähler“). Es handelt sich um fortlaufende Gesamtenergiezähler, nicht Tageszähler. Der historische Akkuknoten zeigt Ladung und Entladung separat, die Entladung als Hauptwert.

**Nicht erfasst** entspricht bei vollständig verfügbaren Zählern der Bilanz:
`PV-Erzeugung + Netzbezug - Einspeisung + Akkuentladung - Akkuladung - Summe aller einzeln erfassten Geräte (kWh)`.
Ohne konfigurierten Akku entfallen die Akkuterme. Bei **konfiguriertem Speicher** müssen beide Akku-Energiezähler samt vollständigen Recorder-Statistiken vorhanden sein, sonst wird „Nicht erfasst“ nicht als scheinbar exakter Wert angezeigt. Dasselbe gilt für fehlende PV-/Netzzähler, negative oder widersprüchliche Bilanzen. Die Messgrenzen müssen zueinander passen, insbesondere bei AC-/DC-seitigen Speicherdaten oder Wechselrichterverlusten.

Geräte **ohne** eigene historische Energiestatistik werden nicht als 0 kWh vom Hausverbrauch abgezogen: Ihre tatsächliche Energie steckt im Rest „Nicht erfasst“, sofern die Gesamtbilanz verfügbar ist. **Sonstige** bleibt dagegen die Summe bekannter Geräte mit Energiestatistiken, die wegen `max_consumers` nicht separat angezeigt werden. Dadurch erfolgt kein Doppelzählen. Die angezeigte PV/Akku/Netz-Zuordnung einzelner historischer Geräte ist weiterhin ein **Visualisierungsmodell**, keine physikalische Messung der jeweiligen Quelle.

```yaml
battery:
  power: sensor.battery_power
  charge_total: sensor.battery_charge_energy_total
  discharge_total: sensor.battery_discharge_energy_total
```

Die beiden neuen Felder sind optional; bestehende Konfigurationen bleiben unverändert. Der Live-Modus und die Netzsaldo-Vorzeichenlogik sind unverändert. Regressionstest: `node tests/test_historical_balance.cjs`. Die echte Bedienung auf iPhone/iPad und die Übereinstimmung unterschiedlicher Zählertypen sind im Home Assistant zu prüfen.

## Historische Ansicht und Viertelstundenmaximum (ab v0.6.11)

Direkt in der Karte befinden sich **Live** und **Datum**. Live schaltet ohne Bestätigung auf aktuelle W-/kW-Werte zurück. Datum öffnet einen responsiven, nicht durch Hintergrundklicks oder Sensorupdates schließbaren Kalenderdialog. Einzelner vergangener Tag oder abgeschlossener Zeitraum von höchstens 31 Tagen; **OK** übernimmt, **Abbrechen** verwirft, **Live** beendet den historischen Modus. Keine zusätzlichen Lovelace-Ressourcen oder Home-Assistant-Helper.

Im historischen Modus zeigen Verbraucher und Quellen **kWh** aus den Gesamtenergiezählern und der Home-Assistant-Recorder-Statistik. Die Modell-Zuordnung von PV/Netz zu Einzelgeräten ist eine **Schätzung**, keine per Gerät separat gemessene Quelle. Ohne Batterie-Lade-/Entlade-Energiezähler kann die Akku-Aufteilung nicht historisch rekonstruiert werden und wird deshalb nicht erfunden. Fehlt einem Gerät ein geeigneter Energiezähler oder eine Statistik-Grenze, steht **„Keine Energiedaten“**, nicht ein geschätzter Nullwert. „Nicht erfasst“ wird nur gebildet, wenn die Gesamtwerte und sämtliche Geräte-Energiewerte verfügbar sind.

In der Statistik erscheint unten eine eigene Zeile **„Max. 15-Min.-Netzbezug“** mit kW und der festen Viertelstunde. Berechnung: Energiedifferenz aus vollständig vorhandenen 5-Minuten-Recorder-Statistiken der **bezogenen Energie** (nicht saldierter Netzleistung), multipliziert mit 4. Feste Viertelstunden 00:00–00:15, 00:15–00:30 usw., kein gleitendes Maximum. Fehlen vollständige 5-Minuten-Statistiken oder liegt der Zeitraum außerhalb ihrer Home-Assistant-Aufbewahrung, steht **„–“** und ein Verfügbarkeitshinweis. Historische Energiesummen verwenden stündliche Langzeitstatistiken und erfordern vollständige Periodengrenzen.

**Ressourcen:** Historische Abfragen erst nach OK; Tagespeak im Live-Modus höchstens alle 5 Minuten; kurzer Ergebniscache von 5 Minuten mit maximal 5 Einträgen; Zeitraum auf 31 Tage begrenzt. Nur existierende Energiesensoren benutzen. Kalender mit nativen Datumseingabefeldern, auf Touchgeräten angepasst; keine zusätzlichen JS-Bibliotheken. **Hinweis:** Die 5-Minuten-Daten werden in Home Assistant nur begrenzte Zeit vorgehalten. Ältere Tage haben möglicherweise kWh-Summen, aber kein Viertelstundenmaximum. Eine funktionierende Live-HA-Browserprüfung steht noch aus.

## Funktionen

- Einfache Einrichtung über **Einstellungen → Geräte & Dienste → Integration hinzufügen → Smartify Flow Card**.
- Automatische Lovelace-Ressourcenregistrierung im Speicher-Modus (`resource_mode: storage`).
- Versions-URL gegen Browsercache: `/smartify_flow_card/smartify-flow-card.js?v=0.6.25`.
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
/smartify_flow_card/smartify-flow-card.js?v=0.6.25
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
    - url: /smartify_flow_card/smartify-flow-card.js?v=0.6.25
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

HACS ermittelt bei Repositories ohne GitHub-Releases unter Umständen die Revision anhand des Git-Commit-Hashes. Dieses Projekt veröffentlicht deshalb **versionierte GitHub-Releases und passende Tags**, zum Beispiel `v0.6.12`. Im HACS-Updatebereich ist die aktuelle veröffentlichte Version maßgeblich. Nach einem HACS-Update startet die Integration mit der passenden versionierten Ressource, etwa `/smartify_flow_card/smartify-flow-card.js?v=0.6.25`.

Bei einer neu angelegten Integration bitte zuerst in HACS aktualisieren und dann **Home Assistant neu starten**, bevor du Browser und App neu lädst. Nach einem Release prüfen, ob der Tag, das Release und die angezeigte HACS-Version übereinstimmen. Ein Commit auf `main` allein ist kein Release.

## Fachliche Bedienhinweise

- **Klappbare Editor-Bereiche (ab v0.6.18):** Im visuellen Editor lassen sich alle Bereiche über die Überschrift auf- und zuklappen. Beim Öffnen von „Bearbeiten“ sind sie immer geschlossen.

- **Quellenanzeige (ab v0.6.12):** Standard `source_display: badge` – kompaktes Badge (z. B. `100% PV`, `Netz`, `60% PV`) rechts in der Zeile des Leistungswerts. Der farbige Prozent-Fußstreifen ist optional über `source_display: strip` bzw. im Editor unter **Darstellung & Animation** wählbar.

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

## Watt-Sortierung in klassischer und radialer Ansicht (ab v0.6.12)

**Standard:** Alle Verbraucher einschließlich `_rest` („Nicht erfasst“) und `_other` („Sonstige“) werden nach aktueller Watt-Leistung absteigend angezeigt, sowohl in der klassischen Liste als auch im Radialring. Der Radialring darf seine Kachelpositionen bei tatsächlichen Rangwechseln ändern; vorhandene Kachel-DOM-Nodes und laufende Animationen werden weiterverwendet.

**Option unter Verbraucher:** `rest_always_last: true` / „Nicht erfasst in Listenansicht immer unten“ fixiert ausschließlich `_rest` am Ende der **klassischen Liste** und der **schmalen, als Liste dargestellten Radialansicht** (z. B. iPhone). Im breiten echten Radialring gilt immer die Watt-Reihenfolge. Ohne die Option bleibt die Watt-Reihenfolge überall Standard. Bei gleicher Leistung entscheidet stabil die Entity-ID. Die PV-Zuteilungspriorität (`allocation`) wird durch die Anzeige-Sortierung nicht verändert.

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