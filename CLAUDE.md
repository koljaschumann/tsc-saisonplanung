# TSC Jugend Saisonplanung

## Projektübersicht

React-Webanwendung für die Jugendabteilung des Tegeler Segel-Club zur Saisonplanung von Regatten, Trainingslagern und Motorboot-Einsätzen.

**Live:** https://tsc-saisonplanung.vercel.app

## Tech Stack

- **Framework:** React 18 + Vite 5
- **Styling:** Tailwind CSS (Navy/Gold Theme)
- **PDF-Export:** jsPDF + jspdf-autotable
- **Datenhaltung:** LocalStorage
- **Deployment:** Vercel (mit Serverless Functions)
- **API:** GitHub Issues API für Feedback

## Projektstruktur

```
tsc-saisonplanung/
├── api/
│   └── create-issue.js          # Vercel Serverless Function für GitHub Issues
├── src/
│   ├── components/
│   │   └── common/
│   │       ├── GlassCard.jsx    # Hauptkarte mit Shimmer/Glow-Effekten
│   │       ├── Button.jsx
│   │       ├── Modal.jsx
│   │       ├── Toast.jsx
│   │       ├── IconBadge.jsx
│   │       └── Icons.jsx
│   ├── context/
│   │   ├── ThemeContext.jsx     # Dark/Light Mode
│   │   └── DataContext.jsx      # Zentraler State + LocalStorage
│   ├── hooks/
│   │   └── useLocalStorage.js
│   ├── utils/
│   │   ├── pdfGenerator.js      # PDF-Export Funktionen
│   │   ├── dateUtils.js
│   │   └── conflictResolver.js  # Motorboot-Konfliktlogik
│   ├── data/
│   │   ├── boatClasses.js       # Trainingsgruppen (Opti C/B/A, 29er, Pirat, J70)
│   │   └── motorboats.js        # Motorboote (Tornado rot/grau, Narwhal, Zodiac)
│   ├── App.jsx                  # Haupt-App mit allen Seiten
│   ├── index.css                # Tailwind + Custom Animationen
│   └── main.jsx
├── vercel.json                  # API Routing
├── tailwind.config.js
└── package.json
```

## Kernfunktionen

### 1. Trainer-Eingabe
- Auswahl der Trainingsgruppe (Bootsklasse)
- Erfassung von Regatten und Trainingslagern
- Motorboot-Wunsch mit Verladezeitpunkt
- Eingabefrist-Prüfung

### 2. Saisonübersicht (Gantt-Kalender)
- Visuelle Timeline aller Events
- Farbcodierung nach Bootsklasse
- PDF-Export (monatsweise chronologisch)

### 3. Motorboot-Einsatzplanung
- Automatische Konflikterkennung
- Priorisierungsmatrix für Motorboote
- Manuelle Konfliktauflösung durch Admin
- PDF-Export Einsatzplan

### 4. Admin-Bereich
- Frist-Verwaltung
- Saison-Einstellungen
- Demo-Daten laden (Stresstest mit 46 Events, 16 Konflikte)
- Feedback-System (direkt zu GitHub Issues)

## Design-System

### Farben
- **Dark Mode:** Navy (#0a1628 bis #1e3a5f), Gold (#c49a47 bis #f0d89a)
- **Light Mode:** Weiß/Grau, Teal (#14b8a6)

### Animationen (index.css)
- `shimmer` - Goldener/Teal Lichteffekt
- `glow-pulse` - Pulsierender Schein
- `hover-lift` - Anheben beim Hover
- `float` / `float-delayed` - Schwebeeffekt
- `sparkle` - Funkelnde Icons
- `text-shimmer` - Animierter Gradient-Text
- `gradient-border` - Animierter Rahmen
- `breathe-warning` - Pulsierender Warn-Schein
- `pulse-soft` - Sanftes Pulsieren
- `scale-in` / `fade-slide-in` - Einblend-Animationen

## Datenmodell

```typescript
interface Event {
  id: string;
  type: 'regatta' | 'trainingslager';
  boatClassId: string;           // opti-c, opti-b, opti-a, 29er, pirat, j70
  name: string;
  organizer?: string;            // Nur bei Regatta
  location?: string;             // Nur bei Trainingslager
  startDate: string;             // ISO Date
  endDate: string;
  motorboatLoadingTime: string;  // ISO DateTime
  requestedMotorboat: string;    // tornado-rot, tornado-grau, narwhal, zodiac
  assignedMotorboat?: string;    // Nach Konfliktauflösung
  createdAt: string;
}
```

## Environment Variables (Vercel)

```
GITHUB_TOKEN=ghp_xxx  # Fine-grained Token mit Issues Read/Write Permission
```

## Lokale Entwicklung

```bash
npm install
npm run dev
```

## Deployment

```bash
npm run build
npx vercel --prod
```

---

## Geplanter nächster Entwicklungsschritt

### TSC Jugend Plattform - Unified Landing Page

**Ziel:** Zusammenführung von zwei Anwendungen unter einer gemeinsamen Plattform:

1. **TSC Saisonplanung** (dieses Projekt)
   - https://tsc-saisonplanung.vercel.app

2. **TSC Startgeld-Erstattung**
   - https://tsc-startgelder-v2.vercel.app
   - Projekt-Ordner: `C:\Users\kolja\tsc-startgelder-v2`

**Geplante Architektur:**
```
tsc-jugend-plattform/
├── Landing Page (gemeinsam)
│   ├── TSC Jugend Branding
│   ├── Navigation zu beiden Bereichen
│   └── Gemeinsame Authentifizierung (optional)
├── /saisonplanung → Aktuelle Saisonplanung-App
└── /startgelder → Startgeld-Erstattung-App
```

**Design-Konsistenz:**
- Beide Apps nutzen bereits das gleiche Design-System (Navy/Gold Theme)
- Gemeinsame Komponenten: GlassCard, Button, IconBadge, Toast
- Gleiche Animationen (Shimmer, Glow, etc.)

**Mögliche Umsetzungsvarianten:**
1. **Monorepo mit Shared Components** - Beide Apps in einem Repo mit gemeinsamer Komponentenbibliothek
2. **Micro-Frontend Architektur** - Landing Page lädt beide Apps dynamisch
3. **Einfache Landing Page** - Statische Seite mit Links zu beiden Apps

**Synergien:**
- Trainer-Authentifizierung könnte geteilt werden
- Gemeinsame Stammdaten (Bootsklassen, Trainernamen)
- Einheitliches Erscheinungsbild für den TSC
