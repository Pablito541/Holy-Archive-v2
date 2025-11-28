# Vercel Deployment Workflow

## Voraussetzungen
- GitHub Account
- Vercel Account (kostenlos bei vercel.com)
- Supabase Account mit konfiguriertem Projekt

## Schritt-für-Schritt Deployment

### 1. Code auf GitHub pushen

```bash
# Initialisiere Git (falls noch nicht geschehen)
git init

# Füge alle Dateien hinzu
git add .

# Erstelle Commit
git commit -m "Holy Archive v2.0 - Production Ready"

# Verbinde mit GitHub Repository
git remote add origin https://github.com/DEIN_USERNAME/holy-archive-v2.git

# Push zum Repository
git push -u origin main
```

### 2. Vercel Account Setup

1. Gehe zu [vercel.com](https://vercel.com)
2. Klicke "Sign Up" oder "Log In"
3. Verbinde deinen GitHub Account

### 3. Neues Projekt erstellen

1. Im Vercel Dashboard: **"Add New..." → "Project"**
2. Wähle dein GitHub Repository `holy-archive-v2`
3. Klicke **"Import"**

### 4. Project Configuration

**Framework Preset**: Next.js (wird automatisch erkannt)

**Root Directory**: `./` (Standard)

**Build Command**: `npm run build` (Standard)

**Output Directory**: `.next` (Standard)

**Install Command**: `npm install` (Standard)

### 5. Environment Variables hinzufügen

Klicke auf **"Environment Variables"** und füge hinzu:

```
Variable Name: NEXT_PUBLIC_SUPABASE_URL
Value: [Deine Supabase Project URL]

Variable Name: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: [Dein Supabase Anon Key]
```

> 💡 **Tipp**: Kopiere diese Werte aus deiner `.env.local` Datei oder aus dem Supabase Dashboard (Settings → API)

**Wichtig**: Wähle alle Environments:
- ✅ Production
- ✅ Preview  
- ✅ Development

### 6. Deploy

1. Klicke **"Deploy"**
2. Warte auf den Build-Prozess (ca. 2-3 Minuten)
3. Bei Erfolg: 🎉 **"Congratulations!"**

### 7. Domain & Zugriff

Nach erfolgreichem Deployment:
- **Production URL**: `https://holy-archive-v2.vercel.app` (oder custom domain)
- **Preview URLs**: Für jeden Branch/PR automatisch

### 8. Verifizierung

Öffne die Production URL und teste:
- ✅ Dashboard lädt
- ✅ Login funktioniert
- ✅ Supabase-Verbindung funktioniert
- ✅ Items werden angezeigt

## Kontinuierliche Deployments

Nach dem Initial Deployment:

**Automatisch bei jedem Git Push:**
```bash
git add .
git commit -m "Update: Feature XYZ"
git push
```

Vercel erstellt automatisch:
- **Production Deployment** (bei Push zu `main`)
- **Preview Deployment** (bei Push zu anderen Branches)

## Custom Domain (Optional)

1. Im Vercel Dashboard → Settings → Domains
2. Klicke "Add"
3. Gib deine Domain ein (z.B. `holyarchive.com`)
4. Folge den DNS-Konfigurationsanweisungen
5. Warte auf DNS-Propagation (bis zu 48h)

## Troubleshooting

### Build schlägt fehl
- Überprüfe Environment Variables
- Checke Build Logs in Vercel Dashboard
- Lokal Build testen: `npm run build`

### App lädt, aber keine Daten
- Environment Variables überprüfen
- Supabase URL & Key validieren
- Browser Console für Fehler checken

### 404 Fehler
- Vercel.json überprüfen
- Next.js Routing checken

## Monitoring

Im Vercel Dashboard:
- **Analytics**: Traffic & Performance
- **Logs**: Runtime & Build Logs
- **Speed Insights**: Core Web Vitals

## Kosten

**Hobby Plan (Kostenlos)**:
- Unlimited Deployments
- Unlimited Bandwidth (Fair Use)
- Automatic HTTPS
- Perfect für dieses Projekt! ✅

---

## Nächste Schritte nach Deployment

1. ✅ App testen
2. 📱 Mobile-Ansicht prüfen
3. 🔐 Authentifizierung einrichten (falls gewünscht)
4. 📊 Analytics aktivieren
5. 🎨 Custom Domain verbinden (optional)

Bei Fragen: [Vercel Docs](https://vercel.com/docs) oder [Vercel Support](https://vercel.com/support)
