# 📱 Guía de Deployment para iOS y Android - Mis Huchas

Esta guía te ayudará a compilar y publicar tu aplicación "Mis Huchas" en App Store y Google Play.

## 🎯 Resumen

Tu aplicación web ha sido convertida usando **Capacitor** para funcionar como aplicación móvil nativa en iOS y Android.

---

## 📋 Requisitos Previos

### Para iOS:
- **Mac** con macOS 12.0 o superior
- **Xcode 14+** (descarga gratis desde App Store)
- **Cuenta de Apple Developer** ($99 USD/año) - [Registrarse aquí](https://developer.apple.com/programs/)
- **CocoaPods** (gestor de dependencias)

### Para Android:
- **Android Studio** (Windows, Mac o Linux) - [Descargar aquí](https://developer.android.com/studio)
- **Cuenta de Google Play Developer** ($25 USD pago único) - [Registrarse aquí](https://play.google.com/console)
- **JDK 11 o superior**

---

## 🚀 Paso 1: Descargar tu Proyecto

### Opción A: Push to GitHub (Recomendado)
1. En Emergent, haz click en el menú superior derecho
2. Selecciona "Push to GitHub"
3. Conecta tu cuenta de GitHub
4. Clona el repositorio en tu Mac/PC:
```bash
git clone https://github.com/tu-usuario/tu-repo.git
cd tu-repo/frontend
```

### Opción B: Descargar Código
1. En Emergent, haz click en "Download Code"
2. Extrae el ZIP en tu computadora
3. Navega a la carpeta del frontend:
```bash
cd ruta/a/tu-proyecto/frontend
```

---

## 🔧 Paso 2: Instalar Dependencias

```bash
# Instalar dependencias de Node
yarn install

# Instalar CocoaPods (solo para iOS en Mac)
sudo gem install cocoapods
```

---

## 📱 Paso 3: Compilar para iOS

### 3.1: Añadir Plataforma iOS
```bash
# Construir la aplicación web
yarn build

# Añadir iOS al proyecto
yarn cap:add:ios

# Sincronizar archivos
npx cap sync ios
```

### 3.2: Abrir en Xcode
```bash
yarn cap:open:ios
```

Esto abrirá Xcode automáticamente.

### 3.3: Configurar en Xcode

1. **Selecciona el proyecto** "App" en el navegador izquierdo
2. **Cambia el Bundle Identifier**:
   - Ve a "Signing & Capabilities"
   - Cambia `com.mishuchas.app` por tu propio identificador único
   - Ejemplo: `com.tunombre.mishuchas`

3. **Configura tu Team**:
   - En "Signing & Capabilities"
   - Selecciona tu Apple Developer Team en el dropdown

4. **Actualiza el Display Name**:
   - En la pestaña "General"
   - Cambia "Mis Huchas" si quieres otro nombre

5. **Iconos de la App**:
   - Haz click en "AppIcon" en Assets.xcassets
   - Arrastra tus iconos (1024x1024 PNG para App Store)
   - Usa [appicon.co](https://appicon.co) para generar todos los tamaños

### 3.4: Probar en Simulador
1. Selecciona un simulador iPhone en la parte superior (ej: iPhone 15 Pro)
2. Presiona el botón ▶️ (Play) o Cmd+R
3. La app se abrirá en el simulador

### 3.5: Probar en Dispositivo Real
1. Conecta tu iPhone con cable USB
2. Selecciona tu iPhone en lugar del simulador
3. Confía en tu certificado developer en iPhone (Settings > General > VPN & Device Management)
4. Presiona ▶️ para instalar y ejecutar

### 3.6: Crear Build para App Store

1. **Selecciona "Any iOS Device"** en el selector de dispositivo
2. **Product > Archive** (o Cmd+Shift+B)
3. Espera a que compile (puede tomar 5-10 minutos)
4. En la ventana de Archives:
   - Click "Distribute App"
   - Selecciona "App Store Connect"
   - Sigue el asistente
5. Sube a App Store Connect
6. Ve a [App Store Connect](https://appstoreconnect.apple.com)
   - Crea una nueva app
   - Completa metadata (descripción, screenshots, etc.)
   - Envía para revisión

⏱️ **Tiempo de aprobación**: 1-7 días

---

## 🤖 Paso 4: Compilar para Android

### 4.1: Añadir Plataforma Android
```bash
# Construir la aplicación web
yarn build

# Añadir Android al proyecto
yarn cap:add:android

# Sincronizar archivos
npx cap sync android
```

### 4.2: Abrir en Android Studio
```bash
yarn cap:open:android
```

Espera a que Android Studio termine de indexar y descargar dependencias.

### 4.3: Configurar en Android Studio

1. **Cambia el Application ID**:
   - Abre `android/app/build.gradle`
   - Busca `applicationId "com.mishuchas.app"`
   - Cámbialo por tu propio ID único

2. **Actualiza el nombre de la app**:
   - Abre `android/app/src/main/res/values/strings.xml`
   - Cambia `<string name="app_name">Mis Huchas</string>`

3. **Iconos**:
   - Usa [appicon.co](https://appicon.co) para generar iconos Android
   - Reemplaza en `android/app/src/main/res/mipmap-*/`

### 4.4: Probar en Emulador
1. En Android Studio, click en el botón "Device Manager"
2. Crea un nuevo Virtual Device (recomendado: Pixel 6)
3. Click en ▶️ Run
4. Selecciona tu emulador

### 4.5: Crear APK Firmado (Producción)

1. **Genera Keystore** (solo primera vez):
```bash
keytool -genkey -v -keystore mishuchas.keystore -alias mishuchas -keyalg RSA -keysize 2048 -validity 10000
```
⚠️ **IMPORTANTE**: Guarda el keystore y contraseña en un lugar seguro. Si los pierdes, nunca podrás actualizar tu app.

2. **Configura el Keystore**:
   - Crea `android/key.properties`:
```properties
storePassword=TU_CONTRASEÑA_STORE
keyPassword=TU_CONTRASEÑA_KEY
keyAlias=mishuchas
storeFile=../mishuchas.keystore
```

3. **Actualiza build.gradle**:
   - Abre `android/app/build.gradle`
   - Añade antes de `android {`:
```gradle
def keystoreProperties = new Properties()
def keystorePropertiesFile = rootProject.file('key.properties')
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}
```

   - Dentro de `android { ... }`, añade:
```gradle
signingConfigs {
    release {
        keyAlias keystoreProperties['keyAlias']
        keyPassword keystoreProperties['keyPassword']
        storeFile keystoreProperties['storeFile'] ? file(keystoreProperties['storeFile']) : null
        storePassword keystoreProperties['storePassword']
    }
}
buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled false
        proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
    }
}
```

4. **Generar APK/AAB**:
```bash
cd android
./gradlew bundleRelease  # Para AAB (recomendado para Play Store)
# O
./gradlew assembleRelease  # Para APK
```

El archivo estará en:
- AAB: `android/app/build/outputs/bundle/release/app-release.aab`
- APK: `android/app/build/outputs/apk/release/app-release.apk`

### 4.6: Publicar en Google Play

1. Ve a [Google Play Console](https://play.google.com/console)
2. Crea una nueva aplicación
3. Completa la información de la tienda:
   - Descripción corta y larga
   - Screenshots (mínimo 2)
   - Ícono de la app
   - Banner promocional
4. Sube el AAB en "Producción" o "Pruebas internas"
5. Completa el cuestionario de contenido
6. Envía para revisión

⏱️ **Tiempo de aprobación**: 1-3 días

---

## 🔄 Actualizar la App

Cuando necesites actualizar tu app:

1. **Haz cambios en Emergent** (o localmente)
2. **Incrementa la versión**:
   - iOS: En Xcode, incrementa "Version" y "Build" en General
   - Android: En `android/app/build.gradle`, incrementa `versionCode` y `versionName`

3. **Reconstruye**:
```bash
yarn build
npx cap sync
```

4. **Compila y sube** siguiendo los pasos anteriores

---

## 🎨 Recursos Útiles

### Generadores de Iconos:
- [Appicon.co](https://appicon.co) - Genera todos los tamaños de iconos
- [MakeAppIcon](https://makeappicon.com)
- [App Icon Generator](https://www.appicon.co)

### Screenshots:
- [Screenshot One](https://screenshot.one)
- [Previewed](https://previewed.app) - Mockups de App Store
- [Fastlane Frameit](https://fastlane.tools/frameit) - Añade marcos de dispositivo

### Herramientas:
- [Fastlane](https://fastlane.tools) - Automatiza builds y deployment
- [Transporter](https://apps.apple.com/app/transporter/id1450874784) - Sube apps a App Store sin Xcode
- [App Store Connect API](https://developer.apple.com/app-store-connect/api/)

---

## ❓ Problemas Comunes

### iOS:

**Error: "No code signing identities found"**
- Solución: Ve a Xcode > Settings > Accounts > Añade tu Apple ID

**Error: "Entitlements are not valid"**
- Solución: En Xcode, Signing & Capabilities > Automatically manage signing ✅

**Build falla en CocoaPods**
```bash
cd ios
pod deintegrate
pod install
```

### Android:

**Error: "SDK location not found"**
- Crea `android/local.properties`:
```
sdk.dir=/Users/TUUSUARIO/Library/Android/sdk  # Mac
# o
sdk.dir=C\:\\Users\\TUUSUARIO\\AppData\\Local\\Android\\Sdk  # Windows
```

**Gradle build falla**
```bash
cd android
./gradlew clean
./gradlew build
```

---

## 📞 Soporte

Si tienes problemas:
1. Consulta la [documentación oficial de Capacitor](https://capacitorjs.com/docs)
2. Revisa [Stack Overflow](https://stackoverflow.com/questions/tagged/capacitor)
3. [Foros de Capacitor](https://forum.ionicframework.com/c/capacitor/23)

---

## ✅ Checklist Final

Antes de publicar, asegúrate de:

- [ ] Cambiaste el Bundle ID / Application ID
- [ ] Actualizaste todos los iconos
- [ ] Probaste en dispositivos reales
- [ ] Completaste toda la metadata de la tienda
- [ ] Creaste screenshots atractivos
- [ ] Escribiste una buena descripción
- [ ] Configuraste política de privacidad (requerida)
- [ ] Probaste todos los flujos críticos (login, crear hucha, transacciones)
- [ ] Verificaste que funcione sin conexión (si aplica)
- [ ] Incrementaste la versión correctamente

---

## 🎉 ¡Listo!

Tu app "Mis Huchas" ahora está lista para el mundo. ¡Buena suerte con tus publicaciones en App Store y Google Play!

---

**Nota**: Esta integración usa Capacitor 6.1.2 que es compatible con Node 20. Para versiones más recientes de Capacitor, necesitarás actualizar Node a v22+.
