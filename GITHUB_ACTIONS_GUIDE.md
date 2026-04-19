# 🚀 Guía GitHub Actions para Developer iOS (sin Mac)

## Para qué sirve esto:

Si eres developer iOS pero no tienes Mac, GitHub Actions te da **2000 minutos GRATIS al mes** en máquinas macOS reales para compilar tu app.

---

## ✅ Ventajas vs Codemagic:

| Feature | GitHub Actions | Codemagic Free |
|---------|---------------|----------------|
| **Minutos gratis/mes** | 2000 min | 500 min |
| **macOS runners** | ✅ Sí | ✅ Sí |
| **Configuración** | YAML (más control) | UI + YAML |
| **Integración Git** | Nativa | Buena |
| **Costo después** | $0.08/min | $49/mes ilimitado |
| **Curva aprendizaje** | Media | Baja |

**Para ti como developer**: GitHub Actions te da más control y minutos gratis.

---

## 🔧 Setup Completo

### PASO 1: Configurar Secrets de iOS

#### 1.1: Exportar tu Certificado de Distribución

Como ya eres developer iOS, probablemente tienes certificados. Si no:

```bash
# En un Mac (o Mac en la nube), abre Keychain Access:
1. Busca tu certificado "Apple Distribution: [Tu Nombre]"
2. Click derecho → Export "Apple Distribution: [Tu Nombre]"
3. Formato: Personal Information Exchange (.p12)
4. Guarda como: distribution_cert.p12
5. Contraseña: Crea una segura (guárdala)
```

#### 1.2: Convertir a Base64

En tu Mac (o Mac en la nube):
```bash
base64 -i distribution_cert.p12 | pbcopy
# Esto copia el Base64 al portapapeles
```

En Windows con PowerShell:
```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("distribution_cert.p12")) | clip
```

#### 1.3: Crear App Store Connect API Key

1. Ve a [appstoreconnect.apple.com/access/api](https://appstoreconnect.apple.com/access/api)
2. Click "+" para crear una key
3. Nombre: "GitHub Actions"
4. Acceso: "App Manager" o "Admin"
5. Genera y descarga el archivo `.p8`
6. **Guarda**:
   - Issuer ID (ejemplo: `abc123-def456-...`)
   - Key ID (ejemplo: `AB12CD34EF`)
   - El contenido del archivo `.p8`

#### 1.4: Añadir Secrets a GitHub

1. Ve a tu repo en GitHub
2. **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Añade estos secrets:

```
IOS_DIST_CERT_P12 = [Base64 del certificado]
IOS_DIST_CERT_PASSWORD = [Contraseña del .p12]
APPSTORE_ISSUER_ID = [Tu Issuer ID]
APPSTORE_KEY_ID = [Tu Key ID]
APPSTORE_PRIVATE_KEY = [Contenido completo del .p8]
```

---

### PASO 2: Configurar Secrets de Android

#### 2.1: Crear Keystore (si no tienes)

En Windows PowerShell:
```powershell
keytool -genkey -v -keystore mishuchas.keystore -alias mishuchas -keyalg RSA -keysize 2048 -validity 10000
```

#### 2.2: Convertir Keystore a Base64

PowerShell:
```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("mishuchas.keystore")) | clip
```

#### 2.3: Crear Service Account para Google Play

1. Ve a [console.cloud.google.com](https://console.cloud.google.com)
2. Crea un nuevo proyecto (si no tienes)
3. Habilita "Google Play Android Developer API"
4. Crea Service Account:
   - IAM & Admin → Service Accounts → Create
   - Nombre: "GitHub Actions"
   - Rol: Service Account User
5. Crea una key JSON y descárgala

6. Ve a [play.google.com/console](https://play.google.com/console)
   - Setup → API access
   - Link el service account
   - Grant access: "Release manager"

#### 2.4: Añadir Secrets Android a GitHub

```
ANDROID_KEYSTORE_BASE64 = [Base64 del keystore]
ANDROID_KEYSTORE_PASSWORD = [Contraseña del keystore]
ANDROID_KEY_ALIAS = mishuchas
ANDROID_KEY_PASSWORD = [Contraseña de la key]
GOOGLE_PLAY_SERVICE_ACCOUNT = [Contenido del JSON del service account]
```

---

### PASO 3: Crear ExportOptions.plist

Necesitas este archivo para exportar el IPA. Créalo en `frontend/ios/App/ExportOptions.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>app-store</string>
    <key>teamID</key>
    <string>TU_TEAM_ID</string>
    <key>uploadBitcode</key>
    <false/>
    <key>uploadSymbols</key>
    <true/>
    <key>signingStyle</key>
    <string>manual</string>
    <key>provisioningProfiles</key>
    <dict>
        <key>com.mishuchas.app</key>
        <string>NOMBRE_DE_TU_PROVISIONING_PROFILE</string>
    </dict>
</dict>
</plist>
```

**Dónde encontrar**:
- **Team ID**: developer.apple.com → Membership
- **Provisioning Profile Name**: developer.apple.com → Certificates, IDs & Profiles → Profiles

---

### PASO 4: Activar el Workflow

1. El archivo ya está en `.github/workflows/mobile-build.yml`
2. Haz push a GitHub:
   ```bash
   git add .
   git commit -m "Add GitHub Actions workflow"
   git push
   ```
3. Ve a GitHub → **Actions**
4. Verás el workflow ejecutándose automáticamente

---

### PASO 5: Monitorear Builds

1. En GitHub → **Actions**
2. Click en el workflow run
3. Verás:
   - ✅ Build iOS (10-15 min)
   - ✅ Build Android (8-12 min)
4. Los artifacts (IPA/AAB) estarán disponibles para descargar
5. Si configuraste bien los secrets, se subirán automáticamente a TestFlight y Google Play

---

## 🎯 Workflow Explicado (para developers)

```yaml
# Trigger: Se ejecuta en push a main/develop
on:
  push:
    branches: [ main, develop ]

# Job iOS: macOS runner (Apple Silicon M1)
jobs:
  build-ios:
    runs-on: macos-latest  # macOS 13 con Xcode 15
    
    steps:
      - Checkout código
      - Setup Node 20 + cache de yarn
      - Install dependencies (yarn)
      - Build web app (yarn build)
      - Sync Capacitor (npx cap sync ios)
      - Install CocoaPods
      - Import certificados desde secrets
      - Download provisioning profiles vía API
      - xcodebuild archive
      - xcodebuild exportArchive
      - Upload a TestFlight vía API
      - Upload artifact al workflow
```

**Tiempo total**: ~20-25 minutos para iOS + Android

---

## 💡 Tips para Developer iOS

### Desarrollo Local (sin Mac):

1. **Desarrolla en Windows**:
   ```bash
   cd frontend
   yarn start  # Live reload en http://localhost:3000
   ```

2. **Prueba en browser**:
   - Chrome DevTools → Device mode
   - Responsive design testing

3. **Push a GitHub** cuando termines:
   - GitHub Actions compila automáticamente
   - Descarga el IPA/AAB de artifacts

4. **Prueba en dispositivo real**:
   - Instala desde TestFlight (iOS)
   - Instala desde Internal Testing (Android)

### Debugging iOS sin Mac:

**Opción A**: Safari Remote Debugging
- Solo funciona si tienes Mac (aunque sea en la nube)
- Conecta iPhone → Mac en la nube → Safari → Develop

**Opción B**: Sentry / LogRocket
- Añade tracking de errores
- Ve crashes en tiempo real
- No necesitas conectar dispositivo

**Opción C**: TestFlight logs
- TestFlight guarda crashes automáticamente
- App Store Connect → TestFlight → Crash logs

### Desarrollo Híbrido (recomendado):

1. **Desarrollo diario**: Windows + Browser
2. **Testing iOS**: Mac en la nube 1-2 veces/semana
3. **Builds**: GitHub Actions automático
4. **Debugging iOS crítico**: Mac en la nube cuando sea necesario

**Costo**: $30-50/mes Mac en la nube >> $2000+ Mac físico

---

## 🔄 Workflow de Desarrollo Sugerido

```
┌─────────────────────────────────────────────┐
│ 1. Desarrolla en Windows                    │
│    - VSCode                                  │
│    - Yarn dev server                         │
│    - Browser DevTools                        │
└─────────────────┬───────────────────────────┘
                  │
                  v
┌─────────────────────────────────────────────┐
│ 2. Push a GitHub cuando termines feature    │
│    git push origin develop                   │
└─────────────────┬───────────────────────────┘
                  │
                  v
┌─────────────────────────────────────────────┐
│ 3. GitHub Actions compila automáticamente   │
│    - iOS → TestFlight                        │
│    - Android → Google Play Internal          │
└─────────────────┬───────────────────────────┘
                  │
                  v
┌─────────────────────────────────────────────┐
│ 4. Prueba en dispositivos reales            │
│    - iPhone: TestFlight app                  │
│    - Android: Play Console internal          │
└─────────────────┬───────────────────────────┘
                  │
                  v
┌─────────────────────────────────────────────┐
│ 5. ¿Bug iOS específico?                     │
│    - Alquila Mac en nube por 1-2 horas      │
│    - Debug con Xcode + Simulator            │
│    - Fix → Push → Repite ciclo              │
└─────────────────────────────────────────────┘
```

**Tiempo dev por feature**: 
- Desarrollo: 2-4 horas (Windows)
- Testing: 20 min (GitHub Actions automático)
- Debug iOS (si es necesario): 1 hora (Mac nube)

---

## 📊 Comparación de Costos (Developer iOS sin Mac)

### Setup 1: Solo GitHub Actions (Gratis)
```
GitHub Actions: $0 (2000 min/mes gratis)
Mac físico: $0
Total: $0/mes
```
**Limitación**: No puedes debuggear con Xcode

---

### Setup 2: GitHub Actions + Mac Nube (Óptimo)
```
GitHub Actions: $0 (builds automáticos)
MacinCloud Pay-as-you-go: ~$10-20/mes (10-20 horas)
Total: $10-20/mes
```
**Ventaja**: Full Xcode cuando lo necesitas

---

### Setup 3: Mac Físico (Tradicional)
```
Mac mini M2: $599 (compra)
GitHub Actions: $0
Total: $599 inicial, $0/mes después
```
**Ventaja**: Es tuyo, pero requiere inversión inicial

---

## 🎯 Mi Recomendación para Ti

Como **developer iOS sin Mac**:

1. **Usa GitHub Actions** (gratis, 2000 min/mes)
2. **Alquila Mac en nube** solo cuando necesites:
   - Debuggear crashes iOS complejos
   - Probar en Simulator
   - Configurar certificados/profiles
3. **Costo**: $10-30/mes vs $599+ de Mac

---

## ✅ Checklist de Setup

- [ ] Secrets de iOS añadidos a GitHub
- [ ] Secrets de Android añadidos a GitHub
- [ ] ExportOptions.plist creado y committed
- [ ] Workflow file en `.github/workflows/`
- [ ] Push a GitHub
- [ ] Verificar que el workflow corre (Actions tab)
- [ ] Descargar IPA/AAB de artifacts
- [ ] Probar en TestFlight/Internal Testing

---

## 🚀 ¡Listo!

Ahora tienes:
- ✅ Builds automáticos en cada push
- ✅ IPA/AAB generados automáticamente
- ✅ Upload automático a TestFlight/Play Console
- ✅ Todo gratis (2000 min/mes)

**Próximo paso**: Push tu código y ve la magia en la pestaña Actions 🎉
