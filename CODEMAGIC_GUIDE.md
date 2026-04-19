# 🌐 Guía Completa: Compilar iOS + Android con Codemagic (desde Windows)

## 📋 Resumen
Esta guía te permite compilar tu app "Mis Huchas" para iOS y Android **sin necesidad de Mac**, usando Codemagic desde tu PC Windows.

---

## ✅ Requisitos Previos

1. **Cuenta GitHub** (gratis) - [github.com](https://github.com)
2. **Código subido a GitHub** (tu repo de Mis Huchas)
3. **Cuenta Codemagic** (gratis, 500 min/mes) - [codemagic.io](https://codemagic.io)

### Para iOS:
4. **Apple Developer Account** ($99/año) - [developer.apple.com/programs](https://developer.apple.com/programs)

### Para Android:
5. **Google Play Developer** ($25 una vez) - [play.google.com/console](https://play.google.com/console)

---

## 🚀 Configuración Paso a Paso

### PASO 1: Subir Código a GitHub

#### Desde Emergent:
1. Menu superior → **"Push to GitHub"**
2. Conecta tu cuenta GitHub
3. Crea repo: `mishuchas-app`
4. Click **"Push"**

#### Manualmente:
```bash
# Después de descargar el código de Emergent:
cd C:\Users\TU_USUARIO\Downloads\mishuchas-app

git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/TU_USUARIO/mishuchas-app.git
git push -u origin main
```

---

### PASO 2: Crear Cuenta Codemagic

1. Ve a **[codemagic.io/signup](https://codemagic.io/signup)**
2. Click **"Sign up with GitHub"**
3. Autoriza Codemagic
4. ¡Listo! Plan gratuito activado (500 min/mes)

---

### PASO 3: Añadir tu App en Codemagic

1. En Codemagic Dashboard, click **"Add application"**
2. Selecciona **GitHub** como fuente
3. Busca y selecciona `mishuchas-app`
4. Click **"Select repository"**
5. Tipo de proyecto: **"Capacitor"**
6. Click **"Finish: Add application"**

---

### PASO 4: Configurar iOS (Apple)

#### 4.1: Conectar Apple Developer Account

1. En tu app Codemagic, ve a **"Settings"** (⚙️)
2. Sección **"Code signing identities"**
3. Click en pestaña **"iOS"**
4. Click **"Connect Apple Developer Portal"**
5. Ingresa:
   - **Apple ID**: tu-email@icloud.com
   - **Password**: Tu contraseña de Apple ID
   - **2FA code**: El código que recibirás

#### 4.2: Generar Certificados Automáticamente

1. Después de conectar, Codemagic mostrará tus teams
2. Selecciona tu team (Personal Team o tu empresa)
3. Click **"Fetch signing files"**
4. Ingresa **Bundle ID**: `com.tunombre.mishuchas`
   - ⚠️ IMPORTANTE: Usa uno único, ej: `com.juanperez.mishuchas`
5. Selecciona **"App Store"** como tipo de provisioning
6. Click **"Automatic"** para generar certificados
7. ¡Listo! Codemagic generó todo automáticamente

#### 4.3: Crear App en App Store Connect

1. Ve a **[appstoreconnect.apple.com](https://appstoreconnect.apple.com)**
2. Login con tu Apple ID
3. Click **"My Apps"** → **"+"** → **"New App"**
4. Completa:
   - **Platform**: iOS
   - **Name**: Mis Huchas
   - **Primary Language**: Spanish
   - **Bundle ID**: (El mismo que usaste arriba)
   - **SKU**: `mishuchas001`
5. Click **"Create"**
6. Copia el **App ID** (número de 10 dígitos) para después

---

### PASO 5: Configurar Android (Google Play)

#### 5.1: Crear Keystore en Windows

Abre **PowerShell** y ejecuta:

```powershell
# Instalar Java si no lo tienes
choco install openjdk11 -y

# Crear keystore
cd C:\Users\TU_USUARIO\Desktop
keytool -genkey -v -keystore mishuchas.keystore -alias mishuchas -keyalg RSA -keysize 2048 -validity 10000
```

**Información que te pedirá**:
- **Keystore password**: Crea una contraseña (ej: `MiHucha2024!`)
  - ⚠️ **IMPORTANTE**: Guarda esto en un lugar seguro (LastPass, 1Password, etc.)
- **First and last name**: Tu nombre
- **Organizational unit**: Tu empresa o "Personal"
- **Organization**: Tu empresa o tu nombre
- **City/Locality**: Tu ciudad
- **State/Province**: Tu estado
- **Country code**: ES (para España) o tu código de 2 letras

Esto creará `mishuchas.keystore` en tu escritorio.

#### 5.2: Subir Keystore a Codemagic

1. En Codemagic, ve a **Settings** → **Code signing identities** → **Android**
2. Click **"Add key"**
3. Sube tu archivo `mishuchas.keystore`
4. Completa:
   - **Reference name**: `mishuchas_keystore`
   - **Keystore password**: La contraseña que creaste
   - **Key alias**: `mishuchas`
   - **Key password**: La misma contraseña
5. Click **"Save"**

#### 5.3: Configurar ID de Aplicación Android

1. En tu código GitHub, edita:
   `frontend/android/app/build.gradle`

2. Busca la línea:
   ```gradle
   applicationId "com.mishuchas.app"
   ```

3. Cámbiala por tu ID único:
   ```gradle
   applicationId "com.tunombre.mishuchas"  # Mismo que iOS
   ```

4. Commit y push:
   ```bash
   git add frontend/android/app/build.gradle
   git commit -m "Update Android app ID"
   git push
   ```

---

### PASO 6: Configurar el Build Workflow

#### 6.1: Usar el Workflow Editor (Interfaz Visual)

1. En Codemagic, ve a tu app
2. Click **"Start new build"**
3. Selecciona **"Workflow Editor"** (no YAML)
4. Verás 5 secciones: Build triggers, Environment vars, Build, Test, Publishing

#### 6.2: Configurar Sección "Build"

**General settings:**
- Build platform: `Mac mini M1` o `Mac mini M2`
- Node version: `20` (latest LTS)
- Xcode version: `15.0` o superior

**iOS settings:**
- ✅ **Build iOS app**
- Xcode workspace: `frontend/ios/App/App.xcworkspace`
- Xcode scheme: `App`
- Build configuration: `Release`
- ✅ **Automatic code signing**
- Distribution type: `App Store`

**Android settings:**
- ✅ **Build Android app**
- Build type: `AAB` (App Bundle)
- Build flavor: (dejar vacío)
- ✅ **Enable Android code signing**
- Select key: `mishuchas_keystore`

#### 6.3: Scripts de Pre-build

En la sección **"Build"** → **"Pre-build script"**, añade:

```bash
#!/bin/bash
set -e
set -x

# Navegar al directorio frontend
cd $CM_BUILD_DIR/frontend

# Instalar dependencias
echo "📦 Instalando dependencias..."
yarn install

# Construir app web
echo "🏗️ Construyendo app web..."
yarn build

# Sincronizar con Capacitor
echo "🔄 Sincronizando Capacitor..."
npx cap sync

echo "✅ Pre-build completado!"
```

#### 6.4: Configurar Publishing (Opcional pero recomendado)

**Para TestFlight (iOS):**
1. Sección **"Publishing"** → **"App Store Connect"**
2. ✅ **Enable App Store Connect publishing**
3. ✅ **Submit to TestFlight**
4. App Store Connect API key: (Conecta tu cuenta)

**Para Google Play Console:**
1. Sección **"Publishing"** → **"Google Play"**
2. ✅ **Enable Google Play publishing**
3. Track: `Internal testing`
4. Service account: (Crea uno en Google Cloud Console)

**Email notifications:**
1. Sección **"Publishing"** → **"Email**
2. ✅ **Enable email publishing**
3. Recipients: `tu-email@ejemplo.com`

---

### PASO 7: ¡Lanzar el Build!

1. Click **"Save"** en tu workflow
2. Click **"Start new build"**
3. Selecciona:
   - Branch: `main`
   - Workflow: `Capacitor iOS & Android`
4. Click **"Start new build"**

⏱️ **Tiempo estimado**: 10-25 minutos

**Puedes ver el progreso en vivo:**
- Logs en tiempo real
- Estado de cada paso
- Warnings y errores

---

### PASO 8: Descargar tus Apps

Una vez completado el build:

1. Ve a **"Builds"** en tu app
2. Click en el build exitoso (✅ verde)
3. En **"Artifacts"**, descarga:
   - **iOS**: `App.ipa` (para App Store/TestFlight)
   - **Android**: `app-release.aab` (para Google Play)

**¿Qué hacer con estos archivos?**

#### Para iOS (.ipa):
- **Opción A**: Codemagic lo sube automáticamente a TestFlight (si configuraste publishing)
- **Opción B**: Usar [Transporter](https://apps.apple.com/app/transporter/id1450874784) para subirlo manualmente

#### Para Android (.aab):
- **Opción A**: Codemagic lo sube automáticamente a Google Play (si configuraste publishing)
- **Opción B**: Subirlo manualmente a [Google Play Console](https://play.google.com/console)

---

## 🎨 PASO 9: Metadata y Screenshots

### Para iOS (App Store Connect):

1. Ve a [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
2. Selecciona tu app
3. Completa:
   - **App Information**: Nombre, categoría, privacidad
   - **Pricing**: Gratis o de pago
   - **App Privacy**: Qué datos recoges
   - **Version Information**: 
     - Screenshots (mínimo 2): Usa [fastlane frameit](https://docs.fastlane.tools/actions/frameit/)
     - Descripción: Máximo 4000 caracteres
     - Keywords: Máximo 100 caracteres
     - Support URL
     - Marketing URL (opcional)

4. Screenshots requeridos:
   - iPhone 6.7" (iPhone 15 Pro Max): 1290x2796
   - iPhone 6.5" (iPhone 14 Plus): 1284x2778
   - iPad Pro 12.9": 2048x2732

**Herramientas para screenshots**:
- [Previewed](https://previewed.app) - Mockups profesionales
- [Screenshot Maker](https://screenshots.pro)
- [App Mockup](https://app-mockup.com)

### Para Android (Google Play Console):

1. Ve a [play.google.com/console](https://play.google.com/console)
2. Selecciona tu app
3. Completa:
   - **Store listing**:
     - Descripción corta (80 caracteres)
     - Descripción completa (4000 caracteres)
     - Icono (512x512 PNG)
     - Feature graphic (1024x500)
     - Screenshots (mínimo 2): 320-3840 px de ancho
   - **Content rating**: Completa cuestionario
   - **Target audience**: Edad del público
   - **Privacy policy**: URL de tu política

---

## 🔄 PASO 10: Actualizar tu App

Cuando hagas cambios:

1. **Haz los cambios** en Emergent o localmente
2. **Push a GitHub**:
   ```bash
   git add .
   git commit -m "Update: descripción de cambios"
   git push
   ```

3. **Incrementa versión**:
   
   **iOS** - edita `frontend/ios/App/App/Info.plist`:
   ```xml
   <key>CFBundleShortVersionString</key>
   <string>1.0.1</string>  <!-- Incrementa esto -->
   <key>CFBundleVersion</key>
   <string>2</string>  <!-- Incrementa esto también -->
   ```

   **Android** - edita `frontend/android/app/build.gradle`:
   ```gradle
   versionCode 2  // Incrementa
   versionName "1.0.1"  // Incrementa
   ```

4. **Push cambios**:
   ```bash
   git add .
   git commit -m "Version bump to 1.0.1"
   git push
   ```

5. **Nuevo build en Codemagic**:
   - Click "Start new build"
   - Codemagic detecta automáticamente los cambios

---

## 💰 Costos Totales

| Servicio | Costo | Frecuencia |
|----------|-------|------------|
| **Codemagic** (Plan gratuito) | $0 | Siempre |
| **Codemagic** (Plan Pro - builds ilimitados) | $49/mes | Mensual |
| **Apple Developer** | $99 | Anual |
| **Google Play Developer** | $25 | Una sola vez |
| **TOTAL (primer año)** | **$124** | - |
| **TOTAL (años siguientes)** | **$99/año** | Anual |

---

## ⚡ Builds más Rápidos

**Plan gratuito**: 500 min/mes
- 1 build iOS + Android = ~20 minutos
- **Puedes hacer ~25 builds/mes gratis**

**Si necesitas más**:
- Plan Pro: $49/mes = builds ilimitados
- Solo para desarrollo activo

---

## 🐛 Troubleshooting

### Error: "No code signing identity found"
**Solución**: 
1. Ve a Settings → iOS code signing
2. Click "Fetch signing files" de nuevo
3. Asegúrate de estar conectado a Apple Developer

### Error: "Keystore not found"
**Solución**:
1. Ve a Settings → Android code signing
2. Verifica que el keystore esté subido
3. Verifica que el alias y contraseñas sean correctos

### Error: "Build failed: Gradle error"
**Solución**:
1. Verifica que el `applicationId` sea válido
2. Asegúrate de que `build.gradle` tenga la configuración de signing
3. Revisa los logs de Codemagic

### Error: "Xcode workspace not found"
**Solución**:
1. Verifica que la ruta sea: `frontend/ios/App/App.xcworkspace`
2. Asegúrate de que el `npx cap sync` se ejecute en pre-build
3. Verifica en GitHub que la carpeta `ios` exista

### Build tarda mucho
**Optimizaciones**:
1. Usa caché de dependencias (habilitar en Settings)
2. No instales dependencias innecesarias
3. Usa `yarn` en lugar de `npm` (más rápido)

---

## 📚 Recursos Útiles

- **Documentación Codemagic**: [docs.codemagic.io](https://docs.codemagic.io/yaml-quick-start/building-a-capacitor-app/)
- **Capacitor Docs**: [capacitorjs.com/docs](https://capacitorjs.com/docs)
- **App Store Review Guidelines**: [developer.apple.com/app-store/review/guidelines](https://developer.apple.com/app-store/review/guidelines/)
- **Google Play Policy**: [play.google.com/console/about/guides](https://play.google.com/console/about/guides/)

---

## ✅ Checklist Final

Antes de publicar:

- [ ] Build exitoso en Codemagic (iOS + Android)
- [ ] Probado en TestFlight (iOS)
- [ ] Probado en Internal Testing (Android)
- [ ] Screenshots creados y subidos
- [ ] Descripciones completadas
- [ ] Política de privacidad creada
- [ ] Content rating completado
- [ ] Iconos actualizados (512x512 y 1024x1024)
- [ ] Versión incrementada correctamente
- [ ] Build numbers incrementados
- [ ] Todos los flujos críticos probados
- [ ] Email de soporte configurado

---

## 🎉 ¡Listo para Publicar!

**Siguiente paso**: Enviar a revisión

**iOS**:
1. App Store Connect → Tu app → Submit for Review
2. Tiempo de aprobación: 1-7 días

**Android**:
1. Google Play Console → Tu app → Production → Create release
2. Tiempo de aprobación: 1-3 días

---

**¡Felicidades!** 🎊 Tu app "Mis Huchas" ahora está en camino a las tiendas de apps, ¡todo desde Windows!
