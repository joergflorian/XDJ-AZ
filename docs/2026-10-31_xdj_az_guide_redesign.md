# XDJ-AZ Guide: Redesign „Signal“ für die Originalseite

Diese Anleitung überträgt den Look aus RBManager rc92 direkt auf die Quelle der Seite: https://github.com/joergflorian/XDJ-AZ (veröffentlicht unter `joergflorian.github.io/XDJ-AZ`).

In RBManager wird das Design von außen über `xdj-az-signal.css` in die Seite gelegt. Auf der Originalseite gehört es direkt in den `<style>`-Block. Die Seite arbeitet sauber mit CSS-Variablen, deshalb bleibt die Änderung klein.

## 1. Farben: `:root` ersetzen

Die vorhandenen Werte in `:root` durch diese ersetzen. `--fs: 1;` bleibt erhalten.

```css
:root {
  /* Dark Mode (Default) */
  --bg:     #1f1e1d;
  --bg2:    #262624;
  --bg3:    #2c2c2a;
  --bg4:    #30302e;
  --bg5:    #3a3a37;
  --or:     #d97757;
  --or2:    #e59a7f;
  --am:     #d19a3e;
  --cy:     #8fb0c0;
  --gr:     #9ab66a;
  --rd:     #e07a68;
  --pu:     #c9a092;
  --tx:     #faf9f5;
  --mu:     #c2c0b6;
  --mu2:    #a3a198;
  --bd:     #3e3e38;
  --bd2:    #4a4a44;
  --hdr-bg: rgba(31, 30, 29, 0.97);
  --mob-bg: rgba(31, 30, 29, 0.98);
  --sub-bg: rgba(31, 30, 29, 0.98);
  --shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  --or-glow: transparent;
  --fs: 1;
}
```

## 2. Farben: `html.light` ersetzen

```css
html.light {
  --bg:     #f0eee6;
  --bg2:    #faf9f5;
  --bg3:    #ebe9df;
  --bg4:    #e3e0d5;
  --bg5:    #dbd8cc;
  --or:     #a84a28;
  --or2:    #8f3f22;
  --am:     #85601a;
  --cy:     #3f6476;
  --gr:     #55702f;
  --rd:     #a8402f;
  --pu:     #8a5a4c;
  --tx:     #141413;
  --mu:     #3d3d3a;
  --mu2:    #5e5d59;
  --bd:     #dbd8cc;
  --bd2:    #c9c6ba;
  --hdr-bg: rgba(240, 238, 230, 0.97);
  --mob-bg: rgba(240, 238, 230, 0.99);
  --sub-bg: rgba(240, 238, 230, 0.98);
  --shadow: 0 2px 10px rgba(20, 20, 19, 0.08);
  --or-glow: transparent;
}
```

## 3. Regeln ans Ende des `<style>`-Blocks

```css
html { scrollbar-color: var(--bd2) transparent; }

h1, h2, h3 {
  font-family: 'Source Serif 4', Georgia, serif !important;
  font-weight: 500 !important;
  letter-spacing: -0.005em !important;
  text-transform: none !important;
}
* { text-shadow: none !important; }

/* Badges and info boxes carry literal neon tints; tie them to their text colour instead. */
[class^="b-"], [class*=" b-"], [class^="lv-"], [class*=" lv-"],
[class^="ct-"], [class*=" ct-"], [class^="lb-"], [class*=" lb-"] {
  background: color-mix(in srgb, currentColor 12%, transparent) !important;
  border-color: color-mix(in srgb, currentColor 28%, transparent) !important;
}
.ns:hover, .ns.active {
  background: color-mix(in srgb, var(--or) 12%, transparent) !important;
  color: var(--or) !important;
}
.tip, .insider { background: var(--bg3) !important; border-color: var(--bd) !important; }
```

Im eigenständigen Guide bleibt der Hell/Dunkel-Schalter sichtbar. Die Regel `.theme-btn { display: none }` aus RBManager gehört nicht hierher, denn dort steuert die App das Theme.

## 4. Schriften

| Bisher | Neu | Einsatz |
|--------|-----|---------|
| Barlow | Inter | Fließtext |
| Rajdhani | Inter | Titel von Abschnitten, Karten, Navigation |
| Share Tech Mono | DM Mono | Labels, Nummern, Badges |
| – | Source Serif 4 | `h1`, `h2`, `h3` |

Die Seite bettet ihre Schriften als Base64 ein und soll offline funktionieren. Deshalb die neuen ebenfalls einbetten. Dateien aus `src/frontend/public/fonts/`:

| Datei | Größe | Hinweis |
|-------|-------|---------|
| `Inter-Variable.woff2` | 47 KB | Gewicht `100 900` |
| `SourceSerif4-Variable.woff2` | 50 KB | Gewicht `200 900`, nur Latin |
| `DMMono-Regular.woff2` | 15 KB | Gewicht `400` |

Am wenigsten Eingriff: Die bisherigen `@font-face`-Blöcke für Barlow, Rajdhani und Share Tech Mono entfernen und die neuen Schriften unter denselben Familiennamen eintragen. Dann müssen die rund 150 `font-family`-Stellen nicht angefasst werden.

```css
@font-face { font-family: 'Barlow'; font-weight: 100 900; font-display: swap; src: url('data:font/woff2;base64,…Inter…') format('woff2'); }
@font-face { font-family: 'Rajdhani'; font-weight: 100 900; font-display: swap; src: url('data:font/woff2;base64,…Inter…') format('woff2'); }
@font-face { font-family: 'Share Tech Mono'; font-weight: 400; font-display: swap; src: url('data:font/woff2;base64,…DMMono…') format('woff2'); }
@font-face { font-family: 'Source Serif 4'; font-weight: 200 900; font-display: swap; src: url('data:font/woff2;base64,…SourceSerif…') format('woff2'); }
```

Sauberer, aber mehr Arbeit: die `font-family`-Angaben wirklich umbenennen. Inter zweimal einzubetten vermeidet man, indem Barlow und Rajdhani per Suchen und Ersetzen beide zu `'Inter'` werden.

Alle drei Schriften stehen unter der SIL Open Font License. Die Lizenzhinweise der Seite ergänzen; Texte für Inter und Source Serif liegen in `src/frontend/public/fonts/`.

## 5. Prüfen

Der Look in RBManager wurde nur eingebettet getestet, nicht als eigenständige Seite. Dort deshalb prüfen:

- Hell und Dunkel, breit und schmal, auch das Mobile-Menü.
- SVG-Grafiken und feste Farben im Inhalt: Das Camelot-Rad behält im Guide seine bunten Originalfarben, auch Violett. In RBManager wurde das nicht umgestellt. Einzelne fest eingetragene Inline-Farben können noch abweichen.
- `color-mix()` braucht einen aktuellen Browser (ab etwa 2023).
- Die Seite hat die Regel `html.light [style*="color:#fff"]`. Sie funktioniert weiter, sollte aber kurz gegengeprüft werden.
- Falls die Theme-Farbe (`<meta name="theme-color">`) oder das Favicon noch den alten Ton tragen, mit anpassen.

## Hinweis für RBManager

Sobald die Originalseite umgestellt ist, wird `xdj-az-signal.css` weitgehend überflüssig. Die Datei verträgt sich aber mit dem neuen Stand, weil sie dieselben Werte setzt. Sie blendet nur zusätzlich den Theme-Schalter aus und erzwingt das Hell/Dunkel der App. Diesen Teil braucht RBManager weiterhin. Im klassischen Look von RBManager erscheint der Guide nach der Umstellung ebenfalls im neuen Design.
