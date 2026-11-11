## v0.6.26 – Karten-JavaScript wird im Browser gecacht (2026-11-11)

- Die Kartendatei `/smartify_flow_card/smartify-flow-card.js?v=<VERSION>` wird jetzt mit Cache-Headern ausgeliefert. Bisher wurde sie bei jedem Seitenaufruf neu angefragt; auf langsamen Geräten konnte Home Assistant dadurch kurz „Konfigurationsfehler“ anzeigen, bis die Karte geladen war.
- Unkritisch für Updates: Jede Version hat durch `?v=` eine eigene URL und wird nach dem Update neu geladen. Wer die JS-Datei ohne Versionssprung von Hand ersetzt, muss den Browser-/App-Cache leeren.
- Keine Änderung an Karte, Logik, Monatsmaxima oder Konfiguration.

## v0.6.25 – Icon und Logo (2026-11-06)

- Eigenes Icon und Logo im smartify-Stil unter `custom_components/smartify_flow_card/brand/` (hell/dunkel, je 1x/2x). Home Assistant zeigt es ab 2026.3 unter Geräte & Dienste.
- Logo oben in der README.
- Keine Änderung an Karte, Logik oder Konfiguration.

## v0.6.24 – Kein blockierender Dateizugriff beim Start (2026-11-06)

- Behoben: Home-Assistant-Warnung „Detected blocking call to open … smartify_flow_card/__init__.py“. Die Manifest-Version wird jetzt beim Import der Integration gelesen (läuft im Executor) statt im Event-Loop während `async_setup_entry`.
- Keine Änderung an Karte, Ressourcen-Registrierung, Monatsmaxima oder Konfiguration.

## v0.6.23 – Einheitliche Statistik-Typografie

- Einheiten `kWh` (Gesamtenergiebedarf) sowie `kW` (aktuelles 15-Minuten-Maximum und Historie) analog zu den Verbraucher-Kacheln kleiner als die Zahlen, mit identischer gemeinsam genutzter CSS-Regel (`.val .unit`, 0,8 em, Gewicht 650).


- Alle fünf Statistikzeilen teilen nun die CSS-Typografie der ursprünglichen Zeilen: Titel 0,70 em/800/Versalien, Zusatztext 0,76 em, Hauptwert 1,15 em/800. Keine widersprüchlichen Einzelgrößen mehr.
- Die eingerückte **Historie** und ihre Monatszeilen übernehmen dieselben geteilten Typografie-Regeln: „Historie“/Monatsname als Titel (0,70 em), historische kW als Hauptwert (1,15 em) und Zeitstempel als Zusatztext (0,76 em). Zusätzliche relative Skalierungen entfallen.
- Gesamtwerte bleiben bei 1,15 em; responsive Layout und Energie-/Statistikberechnungen unverändert.

## v0.6.22 – Verbraucher mit später beginnenden Jahresstatistiken (2026-11-05)

- Schriftgrößen innerhalb der aufgeklappten Historie erhöht (Monatsnamen/kW und Zeitstempel), mit Umbruch auf Smartphone-Displays.

- Einheitliche Schriftgrößen der Statistikzeilen: Titel 0,70 em, Zusatztext 0,76 em, Wert 1,15 em. Eingerückte **„Historie“** gut lesbar mit 0,83 em; unverkleinerte Werte auf Smartphones.\n
- Statistikbereich vertikal komprimiert: weniger Abstand nach Gesamtenergiebedarf, Trennlinie und 15-Minuten-Bereich/„Historie“ rücken nach oben; weiterhin responsive auf Smartphones.\n
- Verbraucher erscheinen auch bei erst im Juli (oder während eines beliebigen ausgewählten Zeitraums) beginnender Statistik mit tatsächlich messbarem Teilzeitraum; erstmals vorhandenen Tages-/Stunden-Summenwert als Baseline statt künstlicher Null nutzen.
- In jeder betroffenen Verbraucherkachel den Hinweis **„Teilzeitraum · Daten ab …“** anzeigen; Warnung über unvollständige Quellenzuordnung bleibt bei Bedarf zusätzlich erhalten.
- Gemeinsame, begrenzte Nachsuche für Verbraucher und PV-Anlagen; fehlende/statistisch ungültige Werte weiterhin unbekannt. Bestehende Netz-, Akku-, Gesamtenergie- und 15-Minuten-Spitzenlogik bleibt unberührt.
- Regressionstest mit im Juli beginnender Waschmaschine, tatsächlicher Zählerstand-Differenz und fehlendem Vergleichssensor; alle vorhandenen Tests weiterführen.

## v0.6.21 – Kompakte 15-Minuten-Historie und Smartphone-Layout (2026-11-05)

- Aufklappmenü unter dem Monatsmaximum in **„Historie“** umbenannt und ohne separate Trennlinie unmittelbar dem 15-Minuten-Wert zugeordnet.
- Mobile Layouts bis 420 px: Zeitstempel und Überschrift dürfen umbrechen; kW-Wert und Monatsliste bleiben sichtbar, ohne waagerecht aus dem Kartenrand zu rutschen.
- Keine Änderungen an Messlogik, gespeicherten Monatswerten, HA-Sensor oder Gesamtenergiebedarf.
- UI-Regressionstests ergänzt.

## v0.6.20 – HA-Sensor für Monatsmaxima und Gesamtenergiebedarf (2026-11-05)

- Home-Assistant-Sensorplattform für registrierte Netzbezugs-Gesamtenergiezähler; aktuelles 15-Minuten-Monatsmaximum als kW-Sensor und aktuelles Kalenderjahr als kompakte `monatswerte`-Attribute inklusive Zeitstempeln.
- Unbegrenztes mehrjähriges Archiv verbleibt im bestehenden persistenten Store; Sensorattribute bleiben auf ein Jahr begrenzt. Neuregistrierung und Werteänderungen werden an den Sensor gemeldet; Plattform wird bei Integration-Reload sauber entladen.
- Neue Statistikzeile **Gesamtenergiebedarf** im Live-Modus (heute) und in Historie (Tag, Monat, Jahr, eigener Zeitraum) mittels derselben bilanzierten Hausenergie wie die bestehende Quellenzuordnung. Ungültige Daten erscheinen als „–“.
- Akkuenergie für heutige Bilanz aus den konfigurierten Gesamtenergiezählern ergänzend abgefragt. Keine veränderte 15-Minuten-Monatsmaximum-Logik.
- Unit-/UI-Regressionstests, Dokumentation und Versionsdaten auf v0.6.20 angehoben.

## v0.6.19 – Dauerhafte 15-Minuten-Monatsmaxima und Versionsanzeige (2026-11-05)

- Serverbasierter Recorder-Sammler für vollständige Viertelstunden aus dem Netzbezugs-Gesamtenergiezähler, 5-minütlich, eigene HA-.storage-Datenpersistenz nach Neustarts und Dashboard-Schließung.
- Oberhalb der Historie stets Maximum des aktuellen Monats statt Tages- oder Jahresmaximum; aufklappbare Vormonate bis inklusive Jänner, mit kW und Zeitstempel.
- Bis zu neun Tage Rückabdeckung; nicht rekonstruierbare ältere 5-Minuten-Rohdaten werden nicht geschätzt, fehlende Monatsanfänge als Teilzeitraum ausgewiesen.
- Kleine, themeangepasste Versionsnummer in der unteren rechten Ecke der Flow Card, automatisch aus SFC_VERSION.
- Tests für vollständige 15-Minuten-Buckets, Zählerreset, fehlende Werte, Monatsanzeige, Speicher und Version sowie CI eingebunden. Alte Lovelace-Konfiguration bleibt unverändert; Recorder wird als Integrationsabhängigkeit ergänzt.

## v0.6.18 – Klappbare Editor-Bereiche (2026-11-05)

- Alle Bereiche des visuellen Editors (Photovoltaik, Stromnetz, Batteriespeicher, Verbraucher, Darstellung & Animation, Sicherung …) sind per Klick auf die Überschrift auf-/zuklappbar (auch per Tastatur: Enter/Leertaste).
- Beim erneuten Öffnen von „Bearbeiten“ sind alle Bereiche geschlossen. Innerhalb einer Bearbeitung bleibt der Zustand auch bei internen Neuaufbauten (z. B. Wechsel des Netz-Sensormodus) erhalten.

## v0.6.17 – Historische Filterwechsel / Linien (2026-11-04)

- SVG-Verbindungen nach dem Umschalten Live → Monat → Tag in einem zusätzlichen Layoutframe nachmessen. Vorhandene DOM-Pfade und Animationen behalten.
- Eventuell entkoppelte vorhandene SVG-Pfade wieder in die aktuelle Liniengruppe einsetzen.
- Historische Verbraucher mit positiver, aber nicht vollständig zugeordneter Energie kennzeichnen die offene kWh-Menge, statt ohne Erklärung ohne Linie zu bleiben. Kein künstlicher Quellenfluss; 0-kWh-Verbraucher ohne Linie.
- Statische Regressionstests für Filterwechsel, SVG-Reconciliation und fehlende Quellbudgets.

## v0.6.16 – Benannte PV-Anlagen und getrennte Energiezähler (2026-11-04)

- Photovoltaik im visuellen Karteneditor unterstützt beliebig viele Anlagen mit frei wählbarem Namen, eigenem Leistungssensor und eigenem Gesamtenergiezähler sowie Hinzufügen und Entfernen.
- Live-Leistung wird aus allen konfigurierten PV-Leistungssensoren addiert; der gemeinsame PV-Knoten und seine restliche Darstellung bleiben bestehen.
- Historische Erträge werden pro PV-Anlage aus eigenen HA-Recorder-Statistiken ermittelt und anschließend addiert. PV-Anlagen mit späterem Statistikbeginn (z. B. Balkon ab Juli) erhalten einen als teilweise fehlend gekennzeichneten Start statt eines erfundenen Null-Zählerstandes. Vor dem Installationsdatum beträgt der Beitrag null.
- Bestehendes `solar.power`/`solar.energy_total` wird beim Öffnen des visuellen Editors in eine erste Anlage übertragen. Gemeinsamer PV-Kachelname, Icon und Prognose sowie übrige Editorbereiche bleiben erhalten.
- Neue Regressionstests `tests/test_pv_plants.cjs`; Validierungs- und Release-Workflows erweitert.
- Die historische Auswertung benötigt weiterhin korrekte Langzeitstatistiken; beschädigte Recorder-Ausreißer können nicht durch die Karte korrigiert werden.

## v0.6.15 – Jahreswerte bei fehlender Vorjahresstunde wiederherstellen (2026-11-04)

- Regression aus v0.6.14 behoben: Jahres-PV und der davon abhängige Restverbrauch wurden bei fehlendem 31.12.-Stundenpunkt vollständig unterdrückt, selbst wenn ab 1.1. Statistikwerte existierten.
- Jahres-/Monats-/Tagessummen jetzt aus **echten Recorder-`sum`-Zählerständen** an beiden Zeitgrenzen statt `statistic_during_period.change` mit möglichem implizitem Null-Anfang. Nur zwei schmale Stundenabfragen, bei noch laufenden Zeiträumen eine kurze 5-Minuten-Abfrage; keine umfangreichen Jahreszeitreihen.
- Startgrenze: vorzugsweise exakt vorhergehender Stundenbucket, andernfalls erste Stunde **als gekennzeichneter Teilzeitraum** (kein falscher Nullbeginn). Bei wirklich fehlendem Anfangswert „–“. Endgrenze: neuester abgeschlossener Bucket; kein erfundener aktueller Wert.
- PV, Netz-, Akku- und Einzelgerätewerte einheitlich in kWh; historische Hausbilanz und „Nicht erfasst“ bleiben von vollständigen, konsistenten Quellen abhängig.
- Tests für gültigen Vorjahres-Anfang, fehlenden Vorjahrespunkt/ersten Jahrestag, vollständig fehlenden Anfang, Zählerrücksprung und aktuelle 5-Minuten-Endwerte.
- Keine Konfigurationsmigration, Live-Leistung und Kalenderbuttons unverändert. Tatsächlich fehlerhafte Home-Assistant-Langzeitstatistiken müssen gesondert repariert werden.

## v0.6.14 – Korrektur überhöhter Jahreswerte (2026-11-04)

- Jahres-/Monats-/Tagessummen aus der Recorder-API `statistic_during_period` werden **nur** übernommen, wenn am angeforderten Start der Zeitraumstatistik ein vollständiger stündlicher Recorder-Anfangswert vorhanden ist. Ohne Startwert kann Home Assistant implizit 0 annehmen, was insbesondere bei im Jahresverlauf angelegten PV-Zählern zu massiv überhöhten Jahres-kWh und „Nicht erfasst“-kWh führt.
- Energiestatistiken werden ausdrücklich in **kWh** angefordert, sodass keine zusätzliche Wh-/MWh-Skalierung anhand eines eventuell geänderten aktuellen Einheitentextes stattfindet.
- Bei fehlender Startstatistik oder ungültigen Ergebnissen „nicht verfügbar“ statt irreführender Null oder überhöhter Werte. Keine Veränderung der Live-Watt-Anzeige, der historischen Netzkachel oder der Akku-Bilanzformel.
- Regressionstests ergänzen fehlende Jahres-Anfangswerte, gültige Anfänge und explizite kWh-Abfragen. Bestehende HACS-/Lovelace-Konfigurationen bleiben erhalten.
- Hinweis: Historische Ausreißer **in den Recorder-Daten** können nicht allein durch diese Plausibilitätsprüfung korrigiert werden; gegebenenfalls Home Assistant Statistik-Reparatur prüfen.

## v0.6.13 – Tag, Monat, Jahr und monatsübergreifende historische Auswahl (2026-11-04)

- Oben in der Flow Card drei kompakte Schnellbuttons **Tag (heute)**, **Monat (laufender Monat)** und **Jahr (laufendes Jahr)**; direkte Anzeige historischer kWh ab Periodenbeginn **bis jetzt**. Bestehende Buttons **Live** und **Datum** bleiben unverändert.
- Der Datum-Dialog erlaubt beliebige monats-/jahresübergreifende Einzel- und Mehrtageszeiträume bis **5 Jahre**. Keine künstliche 31-Tage-Grenze mehr. Tag „heute“ erlaubt, zukünftige Daten weiterhin gesperrt.
- Für große Zeiträume effizient direkte Recorder-Energiedifferenzen anfordern statt zahlreiche Stundenwerte. Gleitender 60-Sekunden-Cache bei offenen Zeiträumen (heute), 5 Minuten bei abgeschlossenen Daten.
- Viertelstundenmaximum niemals auf eine unvollständige historische Datenmenge extrapolieren; bei fehlenden 5-Minuten-Daten oder langen Zeiträumen „nicht verfügbar“. Historische Akku-/Restverbrauchs- und Einspeisewerte bleiben erhalten.
- Neue Regressionsprüfung für Monats-/Jahreswechsel, Zeitraumvalidierung, aktuelle Teilzeiträume, Popup und Abfrage. Home-Assistant-Livetest auf allen Displaybreiten noch ausständig.
- Keine Umstellung der bestehenden Lovelace-Konfiguration oder neuer Entitäten erforderlich. Bei HACS-Updates kann einmaliges Neuladen der Browserseite nötig sein.

## v0.6.12 – Historische Netz- und Akku-Energiebilanz (2026-11-04)

- In der historischen Netzkachel stehen jetzt Netzbezug und Einspeisung **getrennt** in kWh, auch bei Verwendung eines gemeinsamen Netzsaldo-Leistungssensors.
- Im Batterie-Editor zwei zusätzliche, optionale getypte Energiesensor-Auswahlen für den fortlaufenden **Ladeenergie-** und **Entladeenergie-Gesamtzähler** (`battery.charge_total`, `battery.discharge_total`); Standard-Konfiguration bleibt kompatibel.
- Historische Kachel **„Nicht erfasst“** aus PV + Bezug − Lieferung + Entladung − Ladung − Summe erfasster Geräte, bei vollständigen und konsistenten historischen Daten. Fehlende Geräte-Energie bleibt Bestandteil des Restverbrauchs, nicht fälschlich null; fehlende Quellen-Energie oder widersprüchliche Messgrenzen führen zu **nicht verfügbar**.
- Historische **„Sonstige“** gruppiert bekannte Geräte oberhalb der Anzeigebegrenzung weiterhin separat und ohne Doppelzählung. Modellierte PV/Akku/Netz-Anteile bleiben Schätzungen.
- Neue Tests für mit/ohne Akku, Messlücken, negative Restbilanzen, UI-Beschriftung und getypte Picker; beide GitHub-Workflows aktualisiert.
- **Kompatibilität:** Kein Umbau bestehender Lovelace-Konfigurationen; ohne Batterie unveränderte Energiebilanz. Für Speicherbilanzen müssen beide neuen Akkuzähler vom Recorder erfasst werden. Live-HA- und Touch-Tests stehen weiterhin aus.

## v0.6.11 – Historische Energieansicht und 15-Minuten-Netzbezug (2026-11-04)

- Zwei kompakte, responsive Kartenbuttons **Live** und **Datum**, Dialog für einzelnen vergangenen Tag oder abgeschlossenen Zeitraum bis 31 Tage. Interaktion im Dialog lässt ihn offen; nur OK/Abbrechen/Live schließen ihn.
- Historische kWh aus Recorder-Gesamtenergie-Statistiken (PV, Netzbezug, Einspeisung, pro Verbraucher); fehlende Summen werden nicht als 0 interpretiert. Modellierte Quellenanteile als Näherung, keine historische Akku-Aufteilung ohne Energiezähler.
- Eigene Statistikzeile **Max. 15-Min.-Netzbezug** mit kW und fester Viertelstunde aus den 5-Minuten-Statistik-Summen des **Netzbezugszählers**. Kein gleitender Maximalwert, keine Schätzung bei unvollständigen Quartalen. Heute auch im Live-Modus, sofern kurzfristige Recorder-Daten vorhanden.
- On-demand-Abfrage, 5-Minuten-Cache und begrenzte Zeitfenster; keine weitere Home-Assistant-Ressourcenregistrierung.
- Tests für Recorder-Zeitgrenzen, Reset/Messlücken, Datumsvalidierung und UI-Regressionsschutz. **Einschränkung:** 5-Minuten-Recorder-Daten sind nicht unbegrenzt verfügbar; die Browser-Interaktion auf Home Assistant/iOS ist noch separat zu prüfen.
- Rückwärtskompatibilität: bestehende Kartenkonfigurationen unverändert, Live-Ansicht ist Standard. Keine automatische Änderung oder Migration an gespeicherten Dashboards.

## v0.6.10 – Leistungssortierung in Liste und Radial, optionale Rest-Kachel unten (2026-11-04)

- Alle Verbraucher einschließlich „Nicht erfasst“ und „Sonstige“ werden in Liste **und Radialring** nach aktueller Leistung absteigend sortiert; feste Rest-Endposition aus dem bisherigen Radialmodus entfernt.
- Neuer Editor-Schalter **„Nicht erfasst in Listenansicht immer unten“** (`rest_always_last`, Standard aus). Wirkt auf klassische Liste und den schmalen, zweispaltigen Radial-Fallback; im echten Radialring bleibt die Watt-Reihenfolge maßgeblich.
- Vorhandene Kachel-DOM-Knoten und SVG-Animationszeiten werden weiterhin wiederverwendet; im breiten Radialmodus ändern sich Positionen nur bei tatsächlicher Rangänderung. Sortierwechsel beeinflussen weder PV-Zuteilung noch Quellenanteile.
- Regressionstests für Listen-Sortierung und Radial-Stabilität angepasst; Home-Assistant-Livetest für verschiedene Displaybreiten steht noch aus.

## v0.6.9 – Quellen-Badge in der Wertzeile (2026-11-03)

- Verbraucher zeigen die Quellenanteile wieder als kompaktes Badge (wie bis v0.3.0), jetzt auf Höhe des Leistungswerts statt neben dem Namen.
- Neue Option `source_display`: `badge` (Standard) oder `strip` (farbiger Prozent-Fußstreifen wie v0.6.x).
- Badges der Quellenkacheln (Prognose, Akku, Netz-Limit) sitzen ebenfalls in der Wertzeile.

## v0.6.8 – Verbraucher-Popup ohne automatisch geöffnetes Power-Dropdown (2026-11-03)

- Der Dialog öffnet nach Plus/Minus mit geschlossenem Leistungsentitäten-Dropdown. Der automatische Fokus auf das Suchfeld wird durch Fokus auf die Dialogüberschrift ersetzt.
- Die Power-Suche samt Filter, Vorschlägen, Touch-Scrolling und Tastaturbedienung wird erst bei aktiver Auswahl des Suchfelds geöffnet. Keine Änderung der Entitäten, Zuteilungsmodelle oder bestehenden Konfigurationen.
- Regressionstest schützt vor erneut eingeführtem Autofokus. Home-Assistant-Livetest noch ausstehend.

## v0.6.7 – Konfigurierbare Linienbreiten und Quellenverteilung (2026-11-03)

- Von der älteren v0.3.0 drei Visualisierungsoptionen übernommen: minimale/maximale Linienbreite (Standard 1,5/4,5 px), Quadratwurzel- oder lineare Breiten-Skalierung und eine optionale proportionale Verteilung von PV, Akku und Netz.
- **Standard-Quellenverteilung bleibt PV vom kleinsten zum größten Verbraucher** (`allocation: smallest_first`). Proportional (`allocation: proportional`) ist nur eine bewusste Alternative, bei der alle Verbraucher denselben Quellenmix erhalten. Die Berechnung begrenzt Quellenbudgets und Verbrauchsmengen, auch bei Messdifferenzen.
- Linienbreite folgt konfigurierbarer Skalierung; Standard ist nun `line_scale: sqrt`, sodass kleine Flüsse deutlicher werden. `linear` stellt die bisherige Optik weitgehend wieder her.
- Gültige Einstellungen: `line_width_min`, `line_width_max`, `line_scale`, `allocation` im visuellen Karteneditor. Wertebereich begrenzt, die maximale Breite wird nicht kleiner als die minimale.
- Animationen werden bei Wattänderungen weiterhin nicht unnötig neu gestartet. PV-Segmente, Prozentsätze und Flusslinien bleiben konsistent mit der Modellzuordnung. Regressionstests für Budgets, kleine/große Verbindungen und Defaults.
- Kein vollständiger Browser-Livetest in Home Assistant; insbesondere Radialmodus und iOS nach HACS-Update verifizieren.

## v0.6.6 – Einheitliche getypte Entitätensuche und visuelle Icon-Auswahl (2026-11-03)

- Plus-/Minus-Verbraucher-Popups verwenden dieselbe komfortable HA-Suche wie der Haupteditor (Name/Entity-ID, Icon, Einheit, Vorschläge, Keyboard, Touch und eigener Scrollgriff). Die Browser-Datalist entfällt.
- Strenge Sensortypfilter: Leistung nur `device_class: power` oder unklassifizierte W/kW/MW-Sensoren; Energie nur `device_class: energy` oder unklassifizierte Wh/kWh/MWh-Sensoren. Validierung beim Speichern verhindert falsche Entitäten.
- Icon-Auswahl mit Live-Vorschlägen **und Symbolvorschau** für sämtliche Geräte und Quellen (PV, Batterie, Netz), einschließlich Suchkatalog mit über 100 gängigen MDI-Icons und bekannten HA-Entity-Icons; eigene `mdi:`-Namen möglich.
- Auswahl im Popup bleibt bis zur Bestätigung ein Entwurf; Esc schließt bei offenem Suchdropdown zuerst nur die Vorschlagsliste. Keine Änderung der Verteilungslogik oder bestehenden Geräte-Konfiguration.
- Neue Regressionstests für beide Sensortypen, falsche Klassifikationen und Icon-Vorschläge. Browser-/Mobiltests in Home Assistant stehen noch aus.

## v0.6.5 – Verbraucherverwaltung per Plus/Minus-Popup (2026-11-03)

- Im visuellen Karteneditor kompakte Verbraucherkacheln mit Plus rechts oben und Minus je Verbraucher. **Minus öffnet Bearbeiten/Entfernen**, statt sofort zu löschen.
- Popup bearbeitet Leistungsentität, Anzeigenamen, Icon, Gerätefarbe und optionalen Gesamtenergiezähler; Übernehmen/Abbrechen und separate bestätigte Löschaktion.
- Änderungen werden erst nach explizitem Speichern via `config-changed` an Lovelace übergeben, nicht während des Tippens.
- Per Label automatisch erkannte Verbraucher werden beim Entfernen auf Kartenebene `excluded_consumers` ausgeblendet und erscheinen nicht sofort erneut; erneutes Hinzufügen erlaubt.
- Keine Schreibaktion im normalen Dashboard (Lovelace-Konfiguration wird dort nicht stillschweigend überschrieben). Energiemodell, sortierte Verbraucher, farbige Quellstreifen und More-Info bleiben erhalten.
- Regressionstest für Modalfunktion, Entitätenfilter und Löschbestätigung. Browserspezifischer Live-Test weiterhin ausstehend.

## v0.6.4 – Quellenkacheln per Ziehgriff umsortieren (2026-11-03)

- PV-, Akku- und Netzkacheln unter **Darstellung & Animation** frei umreihen: Ziehgriff für Touch und Maus, Auf/Ab-Schaltflächen sowie Tastaturpfeile.
- Reihenfolge wird erst beim Loslassen bzw. nach einer Tastenaktion als `source_order` in der Lovelace-Konfiguration gespeichert, nicht bei jedem Pointer- oder Sensorupdate.
- Die gespeicherte Reihung gilt für klassische und radiale Ansicht; Dashboard-Klicks öffnen weiterhin Entitätsdetails und lösen kein unbeabsichtigtes Verschieben aus.
- Abwärtskompatibel: ohne `source_order` PV → Akku → Netz; ohne Batteriesensor nur die vorhandenen Quellen anzeigen.
- PV-Priorität, Quellenbudgets und Flusslinien bleiben unverändert. Regressionstest für Up/Down, Touch, Tastatur, Duplikate und fehlenden Akku.
- Echter Home-Assistant-Test auf iPhone/iPad/PC steht noch aus.

## v0.6.3 – PV zuerst an kleine Verbraucher (2026-11-03)

- PV-Budget wird nun **aufsteigend nach Verbraucherleistung** verteilt: kleinster Einzelverbraucher zuerst, größter zuletzt.
- Akku und Netz decken anschließend verbleibende Leistungen, ohne Quellenbudget mehrfach zu vergeben; bei Messlücken bleibt ein offener Rest.
- Listenanzeige unverändert **absteigend** nach Leistung, einschließlich „Sonstige“ und „Nicht erfasst“. Die visuelle Reihenfolge steuert die PV-Zuordnung nicht.
- Segmentbreiten, Prozentwerte und animierte PV-Verbindungen verwenden die neue individuelle Zuteilung. Regressionstests für mehrere Verbraucher, Teilzuteilung und Quellenlimits.
- Kein Live-Test in Home Assistant erfolgt.

## v0.6.2 – Flackern der gesamten Karte / Radialmodus reduzieren (2026-11-03)

- Keine vollständigen Neuaufbauten aller Verbraucher- und Quellenkacheln mehr, nur weil sich Reihenfolge oder Leistung ändern. Bestehende DOM-Elemente, Klick-Handler, Gerätefarben und Quellen-Segmente bleiben erhalten.
- Radialansicht behält bei Leistungsschwankungen eine stabile Geräte-Anordnung; wirkliche Änderungen an sichtbaren Geräten werden weiterhin übernommen.
- Sensor- und ResizeObserver-Zeichenanforderungen werden pro Animation-Frame gebündelt.
- Unveränderte Positionen, SVG-Pfade, SVG-ViewBox sowie große Leistungs- und Statistikanzeigen werden nicht unnötig neu beschrieben.
- SVG-Strichanimationen behalten ihre Laufzeit, statt bei jeder Leistungsschwankung neu getaktet zu werden.
- Regressionstest für DOM-Reuse, Radial-Anordnung und Animationen. Kein echter Home-Assistant-Livetest erfolgt; solche Tests bleiben notwendig.

## v0.6.1 – Gerätefarben wiederhergestellt, Prozentflackern behoben (2026-11-03)

- Netzsegment im unteren Quellanteilsstreifen verwendet wieder die **individuelle Gerätefarbe**, auch bei manuell gesetzten Verbraucherfarben. PV bleibt gelb und Akkustrom grün.
- Prozentanzeigen flackern weniger: Die vorhandenen Segment- und Text-Elemente bleiben bei Leistungsupdates erhalten, solange sich die Quellen nicht ändern. Nur notwendige Werte werden geändert.
- Die Beschriftungsbreite wird stabil über Textmessung und Hysterese geprüft; ein schmaler Netzanteil kann nicht mehr bei jedem Update zwischen sichtbar und ausgeblendet wechseln.
- Tests für Gerätefarbe, DOM-Stabilität und Text-Hysterese ergänzt. Quellenzuordnung, Dashboard-Konfiguration, 22-px-Streifen sowie Listen- und Radiallayout bleiben erhalten. HA-Livetest ausständig.

## v0.6.0 – Prozentwerte in segmentiertem Farbstreifen (2026-11-03)

- Die bisherige 4-px-PV-Akzentlinie der Verbraucherkacheln wird durch einen **22 px hohen segmentierten Fußstreifen** ersetzt: PV, Akku, Netz, gegebenenfalls offener Rest.
- Segmentbreiten folgen exakt den bereits berechneten individuellen Watt-Zuteilungen. Beschriftungen (ganzzahlig gerundet) liegen direkt in den Segmenten; bei Platzmangel verschwindet nur die Beschriftung, nicht das Segment.
- Die Prozent-Badges oben rechts entfallen ausschließlich für Verbraucher; Namen, Leistungszahl und Tagesenergie bleiben in ihrer bisherigen Reihenfolge. Quellen-Kacheln behalten ihre ursprüngliche Akzentlinie und ihre Status-Badges.
- Segment-Farben sind themetauglich; gelb für PV, grün für Akku, themebasierter Netz-Grauton, offen in neutraler Trackfarbe. Tooltip und accessible Label nennen weiterhin alle Quellenwerte.
- Für Radiallayout ist Platz am unteren Rand reserviert; die globale prozentuelle Schriftgrößen-Einstellung gilt weiterhin.
- Layout-Regressionstest aktualisiert. HA-Livetest auf iPhone/iPad/Desktop steht aus.

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
