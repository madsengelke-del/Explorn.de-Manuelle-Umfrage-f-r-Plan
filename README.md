# Explorn – Fragebogen

Persönlicher Fragebogen für den ersten Kunden. Nach dem Absenden:
- Kunde sieht eine Bestätigungsseite
- Du bekommst eine E-Mail mit allen Antworten
- Alle Antworten sind unter /admin einsehbar

---

## Deployment auf Vercel (5 Minuten)

### 1. GitHub-Repo erstellen
```bash
git init
git add .
git commit -m "Explorn Fragebogen"
# Neues Repo auf github.com erstellen, dann:
git remote add origin https://github.com/DEIN-USERNAME/explorn-survey.git
git push -u origin main
```

### 2. Vercel verbinden
1. Gehe auf vercel.com → "Add New Project"
2. Wähle dein GitHub-Repo aus
3. Klick "Deploy" — läuft automatisch

### 3. Umgebungsvariablen setzen
In Vercel → Project → Settings → Environment Variables:

| Variable | Wert |
|---|---|
| `GMAIL_USER` | deine Gmail-Adresse |
| `GMAIL_APP_PASSWORD` | App-Passwort (siehe unten) |
| `NEXT_PUBLIC_URL` | https://dein-projekt.vercel.app |
| `NEXT_PUBLIC_ADMIN_PASSWORD` | Dein gewünschtes Passwort |

**Gmail App-Passwort erstellen:**
1. Gmail → Einstellungen → Sicherheit → 2-Faktor-Authentifizierung aktivieren
2. Dann: myaccount.google.com/apppasswords
3. App: "Mail", Gerät: "Anderes" → Name "Explorn"
4. Das generierte 16-stellige Passwort kopieren

### 4. Redeploy
Nach dem Setzen der Variablen: Vercel → Deployments → "Redeploy"

---

## URLs nach Deployment
- **Fragebogen:** https://dein-projekt.vercel.app
- **Admin-Dashboard:** https://dein-projekt.vercel.app/admin
- **Bestätigungsseite:** https://dein-projekt.vercel.app/erfolg (automatisch)

---

## Lokal testen
```bash
npm install
cp .env.local.example .env.local
# .env.local ausfüllen
npm run dev
# → http://localhost:3000
```
