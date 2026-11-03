# AGENTS.md – Smartify Flow Card

Diese Datei ist für **jede** Weiterentwicklung verbindlich. Vor jedem Eingriff lesen, nach jeder Änderung Dokumentation, Tests und Release-Metadaten prüfen. Die Dokumentation ist Bestandteil der Funktion, kein optionaler Nachtrag.

## Projekt und Referenzen
- Repository: `https://github.com/smartify-your-home/smartify-flow-card`
- Integration: `custom_components/smartify_flow_card/`
- Karte: `custom_components/smartify_flow_card/frontend/smartify-flow-card.js`
- Backend-Ressourcenverwaltung: `custom_components/smartify_flow_card/__init__.py`
- Konfigurations-Flow: `custom_components/smartify_flow_card/config_flow.py`
- Karten-Typ (stabil halten): `custom:smartify-flow-card`
- Integrations-Domain: `smartify_flow_card`
- Frühere Einzel-JS-Installation: `/local/smartify-flow-card.js`
- Aktuelle Auslieferung: `/smartify_flow_card/smartify-flow-card.js?v=<VERSION>`

## Versionen und Veröffentlichungen: VERBINDLICH
1. Für **jede veröffentlichte Codeänderung** eine neue SemVer-Version vergeben, keine Git-Commit-Hash-Version als Nutzeranzeige: `0.5.5`, danach z. B. `0.5.6`.
2. Die Version MUSS übereinstimmen in `manifest.json` (`version`), JavaScript (`SFC_VERSION`), README (aktuelle Version), Versions-URL-Beispielen und neuem `CHANGELOG.md`-Abschnitt. Kein Release mit inkonsistenten Versionen.
3. GitHub-Tag heißt **`vX.Y.Z`**, GitHub-Release heißt **`vX.Y.Z`**; Releases als reguläre Veröffentlichungen, nicht nur Commits auf `main`. Dies ermöglicht HACS die Anzeige einer klaren Versionsnummer statt einer Commit-Kennung.
4. Die Veröffentlichung läuft über `.github/workflows/release.yml` mit Tag und GitHub-Release. Die Release-Workflow-Prüfung darf ein vorhandenes Release **nicht stillschweigend überschreiben**. Niemals Git-Tags umschreiben oder Releases rückdatieren.
5. Vor Release `python scripts/check_version.py` und alle Tests ausführen. Auch nach Veröffentlichung den GitHub-Actions-Lauf prüfen. Wenn GitHub-Releases noch nicht erstellt/prüfbar sind, nicht behaupten, ein Release sei fertig.
6. **Jede Funktionsänderung aktualisiert:** README-Features, Konfigurationsreferenz und Beispiele soweit betroffen; CHANGELOG mit Auswirkungen, Migration/Kompatibilität, ggf. bekannte Einschränkungen; UI-Hinweise/Hilfetexte und Übersetzungen, sobald betroffen. Nicht veraltete HACS- oder In-App-Beschreibungen stehenlassen.
7. Bei Integration-Releases sicherstellen, dass HACS das Repository als Typ **Integration** installieren kann und dass die Ressource nach einem Neustart mit Versionsquery registriert wird.

## Bestehende Kernfunktionen erhalten
- Quellen: PV, Stromnetz (ein kombiniertes Netz-Kachelmodell), optional Batterie.
- Netzsensoren: ein vorzeichenbehafteter Netzsaldo mit umschaltbarer Vorzeicheninterpretation ODER getrennte Bezugs-/Einspeise-Leistungssensoren. Die Netz-Kachel wechselt Name, Icon und aktuelle Leistung zwischen Bezug/Lieferung. **Beide Tagesenergiewerte** (Bezug, Lieferung) stehen immer darunter.
- Leistungssensor-Picker: nur Sensoren mit `device_class: power` oder gültigen W/kW/MW-Einheiten. Energiesensor-Picker: Wh/kWh/MWh; Batteriestand: Prozent. Schnellsuche nach Anzeigename und Entity-ID mit Vorschlägen und Tastaturbedienung.
- Dropdown-Maus-Scrollgriff verwendet Pointer Capture; die Lösung gegen das „entwischende“ Ziehen darf nicht zurückgebaut werden. Mausrad und Touch bleiben funktionsfähig.
- Alle Label-Sensoren mit dem Label `verbraucher` (inkl. Auflösung der HA-Label-ID) automatisch einbinden. Manuelle Verbraucher weiterhin ohne Label auswählbar. Keine Duplikate, manuelle Namen/Icons/Farben überschreiben automatisch erkannte Eigenschaften. Konfigurationen niemals bei JS-Updates verlieren.
- Anzeigeleistung (W), Geräte unter der Anzeigeleistung optional ausblenden; Ausgrau-Schwelle unabhängig davon. Versteckte Geräte bleiben konfiguriert. Maximal sichtbare Geräte und Rest-/Sonstige-Gruppierung beachten.
- **Sortierung in der klassischen Liste:** Alle sichtbaren Lastkacheln einschließlich `_other` (Sonstige) und `_rest` (Nicht erfasst) gemeinsam nach aktueller Watt-Leistung absteigend sortieren. Aggregatlasten nicht künstlich ans Ende zwingen; gleich große Verbraucher stabil per Schlüssel sortieren. PV-/Akku-/Netzzuordnung davon unabhängig halten. Radiale Anordnung nicht unbeabsichtigt verändern. Test `node tests/test_list_sort.cjs`.
- **Schriftgröße:** Im Editor unter Darstellung & Animation **Schriftgröße aller Kartentexte (%)**, Bereich 50–200 %, Standard 100 %. `font_scale` bleibt als Dezimalfaktor kompatibel (1.0 = 100 %). Alle Kartentexte (Titel, Namen, Zahlen, Einheiten, Badges, Statistik) proportional skalieren, inkl. Radialmodus. Test `node tests/test_font_scale.cjs`.
- **Flackerfreier Radialmodus (ab v0.6.2):** Sensorupdates dürfen NICHT die DOM-Kacheln für alle Verbraucher neu erzeugen. DOM-Knoten nach stabiler ID wiederverwenden, Klick-Handler und interaktive Elemente erhalten; nur bei Geräte-Zu-/Abgang hinzufügen/entfernen, bei Listen-Positionswechsel nur erforderliche Nodes bewegen. Radial-Gerätereihenfolge muss bei Leistungsschwankungen konstant bleiben. ResizeObserver und Sensorupdates mit einem requestAnimationFrame-Koordinator bündeln, keine unnötigen wiederholten CSS-Positionen oder SVG-d/viewBox-Schreibzugriffe. CSS-Animationen bei Leistungsschwankungen nicht neu starten. Test `node tests/test_radial_stability.cjs`.
- Zwei Layouts: Klassisch und Radial. Quellen zentral, Verbraucher außen, Linien im Radialmodus als kurze Kurven mit Ports oben/unten/links/rechts, möglichst ohne Kachelkreuzungen. Kleine Bildschirme prüfen.
- Animationen/Strichmuster bleiben; grundsätzlich HA-Theme-Textfarben für neutrale Linien, PV-Verbindungen **dunkelgelb** (`#D4A000`) als overridebare Variable.
- **Segmentfarben und Flackerfreiheit (ab v0.6.1):** PV gelb, Akku grün, **Netzanteil in der jeweiligen Gerätefarbe (`--c`)** statt generischem Grau, unbekannter Anteil neutral. Bei laufenden Sensorupdates Segmente und Label-DOM nicht ständig neu erzeugen: nur bei Änderung der Quellenliste neu erstellen, sonst vorhandene Elemente aktualisieren. Schriftpassform via stabile Messung und Hysterese statt pro Frame zurücksetzen; Netz-% darf nicht flackern. Auch iPhone und Radiallayout prüfen. Test `node tests/test_badge_layout.cjs`.
- **Quellenanteile in den Verbraucherkacheln:** Ab v0.6.0 ausschließlich im **farbig segmentierten Fußstreifen** (standardmäßig 22 px hoch) der Verbraucherkachel, **nicht** in einem separaten Badge. Gelb PV, Grün Akku, themebasierte Graufarbe Netz, neutraler Farbanteil bei unbekannter Zuordnung. Segmentbreite und Prozentsatz müssen direkt aus der individuellen Wattverteilung berechnet werden; Text wird nur gezeigt, wenn er tatsächlich vollständig ins Segment passt, ansonsten ausblenden (Farbe und Tooltip behalten). Quellenkacheln bleiben unverändert. Gerätetitel/Leistung/Tagesenergie nicht verschieben; im Radiallayout Platz reservieren. Prüfen: `node tests/test_badge_layout.cjs`.
- **PV-Zuordnung pro Gerät (Modell!)**: verfügbares PV-Budget **aufsteigend nach Leistung** zuweisen, kleinster Einzelverbraucher zuerst (stabile Reihenfolge über Schlüssel bei Gleichstand). **NICHT** auf die absteigende Kachel-/Listenreihenfolge übertragen: diese bleibt absteigend nach Gesamtleistung. Akku/Netz decken danach verbleibenden Verbrauch innerhalb ihrer verfügbaren Wattbudgets. Zusammengefasste `_other`-Anteile ergeben sich aus der Summe ihrer Einzelverbraucher. Segmentbreiten, Prozentlabels und animierte Linien müssen dieselbe Zuordnung verwenden. Keine mehrfach vergebenen Quell-Watt. Prüfen mit `node tests/test_power_allocation.cjs`. Die Zuordnung ist ein Visualisierungsmodell, keine physikalische Einzelmessung.
- Energiedaten: Gesamtenergiezähler für PV, Bezug, Lieferung und Verbraucher; Tageswerte aus HA-Recorder-Statistiken berechnen. Ältere Tageszähler-Konfigurationen kompatibel halten. Fehlende Energiestatistiken als nicht verfügbar kennzeichnen, nicht als 0 vortäuschen.
- PV-Eigenverbrauchsquote = `(PV-Ertrag - Einspeisung) / PV-Ertrag * 100`; Referenztext „des PV-Ertrags“, NICHT „des Verbrauchs“. PV-Eigenverbrauchsmenge in kWh = PV-Ertrag minus Einspeisung; Batterieladung ist dabei eingeschlossen. Autarkie mit Speicher ohne passende Energiestatistiken nur als Schätzung markieren.
- Layout/Optik: HA-Standardschrift per Inherit; wichtige Werte und Gerätenamen `--primary-text-color`, Zusatzinfos `--secondary-text-color`; W/kW/kWh-Einheit ca. 20 % kleiner als Zahl. Untergeordnete Tagesenergiewerte in schmalen Kacheln ohne Umbruch/Abschneiden und mit **gleicher Schriftstärke**; im Netz-Kachel-Zusatz keine unnötigen „Heute“-Wiederholungen.
- Rundungen: ausschließlich `var(--ha-card-border-radius, 12px)` als Theme-Rundung; **keine** `--smartify-flow-node-radius`-Variable wieder einführen. Hintergrundtransparenz der äußeren Karte einstellbar. Theme-Unterstützung für Hell/Dunkel, neutrale Rahmen und Hintergründe.
- Kacheln bleiben anklickbar (HA-More-Info). Keine schwebenden ungewollten Partikel oder vollständig verdeckte Klickflächen.

## Integrations- und Konfigurationssicherheit
- Integration liefert JS aus `frontend/` per `StaticPathConfig`, keine zweite Kopie in `www` als führende Quelle.
- Automatische Lovelace-Ressourcenregistrierung nur im **storage-Modus**; Ressourcen-Collection vor Nutzung laden, `async_items`/create/update/delete nicht auf ungeladener Collection verwenden.
- In YAML-Ressourcenmodus nichts automatisch überschreiben, manuelle Einrichtung verständlich dokumentieren.
- Einträge vom bekannten alten `/local/smartify-flow-card.js`-Pfad dürfen migriert werden; alle anderen Ressourcen/Integrationen unangetastet lassen.
- Keine direkte Manipulation von `.storage/lovelace_resources`, Dashboards, Nutzer-Geräte-/Entitäten-/Label-Konfiguration oder Geheimnissen. JSON-Sicherungs-/Wiederherstellungsfunktion für Kartenconfig erhalten.
- Kein Upgrade darf Nutzer-Geräte oder Namen aus der Lovelace-Konfiguration entfernen. Rückwärtskompatibilität bestehender YAML-Schlüssel bevorzugen; Abweichungen dokumentieren.

## Doku, UI-Hinweise, Qualität
- **README.md**: Installation (HACS und manuell), Schritt-für-Schritt-Einrichtung, Update/Cache, Migration, Ressource, vollständiges Konfigurationsbeispiel, Speicherorte, bekannte Einschränkungen, Fehlerhilfe.
- **CHANGELOG.md**: Jede Version in eigener Rubrik mit sichtbaren Änderungen, wichtigen Fixes und ggf. Migrationshinweisen.
- **Deutsch/Englisch Übersetzungen und Hinweise im Editor**: zu jeder relevanten Option passende, kurze, aktuelle Beschreibung/Einheiten und Defaults.
- **AGENTS.md** wird bei neuen Entwicklungsregeln/Funktionen laufend fortgeschrieben.
- Tests: `python -m unittest discover -s tests -v`, `python -m compileall -q custom_components`, `node --check custom_components/smartify_flow_card/frontend/smartify-flow-card.js`, `node tests/test_power_allocation.cjs`, `node tests/test_badge_layout.cjs`, `python scripts/check_version.py`.
- Regressionsprüfungen insbesondere für PV-Badges/Flows, Netzsaldo-Vorzeichen, Tagessummen, schmale iPhone-/iPad-Layouts, Themewechsel, Scrollgriff und Ressourcenmigration.
- Syntax- oder Mocks-Tests sind **kein** HA-Livetest. Klar sagen, was geprüft und was nicht geprüft wurde.
