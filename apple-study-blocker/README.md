# StudyBlocker — Modo Estudio para tus dispositivos Apple

App para iOS/iPadOS que bloquea **todas** las aplicaciones del dispositivo mientras estudias, excepto las que tú marques como permitidas (apps de estudio o de trabajo). Está construida sobre las APIs oficiales de **Screen Time** de Apple:

| Framework | Para qué se usa |
|---|---|
| `FamilyControls` | Pedir autorización de Screen Time y mostrar el selector de apps (`FamilyActivityPicker`) |
| `ManagedSettings` | Aplicar el "escudo" (shield) que bloquea las apps |
| `DeviceActivity` | Programar horarios de estudio que activan/desactivan el bloqueo automáticamente, incluso con la app cerrada |
| `ManagedSettingsUI` | Personalizar la pantalla que aparece al abrir una app bloqueada |

## 🔄 Bloqueo en TODOS tus dispositivos: cómo lo hace Flow y cómo lo hace esta app

Apps como **Flow**, Opal o Jomo dan la sensación de "bloquear todos los dispositivos de tu iCloud a la vez", pero técnicamente ninguna app puede bloquear remotamente otro dispositivo: Apple no lo permite (los shields de `ManagedSettings` son locales, y los tokens de apps de `FamilyControls` no se pueden transferir entre dispositivos — es una restricción de privacidad de la API). Lo que hacen en realidad es **sincronizar la SESIÓN, no el bloqueo**:

1. La app está instalada en **cada** dispositivo (por eso Flow existe para iPhone, iPad, Mac y Watch).
2. En cada dispositivo eliges una vez tus apps permitidas/bloqueadas (localmente).
3. Al iniciar una sesión en un dispositivo, la sesión se publica en **iCloud (CloudKit, base de datos privada)**.
4. iCloud envía un **push silencioso** a tus demás dispositivos, que despiertan en segundo plano y aplican **su propio bloqueo local** con su propia lista. El efecto neto: pulsas "empezar" en el iPhone y a los pocos segundos el iPad también está bloqueado.

Esta app implementa exactamente ese patrón en `Managers/CloudSessionSync.swift`:

- **Publicar**: `startStudying()`/`stopStudying()` guardan un registro `StudySession` (`isActive`) en la base privada de CloudKit.
- **Suscribir**: cada dispositivo crea una `CKQuerySubscription` con push silencioso (`shouldSendContentAvailable`).
- **Reconciliar**: al recibir el push (o al abrir la app / volver a primer plano), el dispositivo lee el estado en iCloud y aplica/retira el escudo con su lista local.

Limitación heredada de iOS (afecta igual a Flow): si **fuerzas el cierre** de la app en un dispositivo (swipe up en multitarea), iOS deja de entregarle pushes silenciosos; ese dispositivo se pondrá al día cuando la abras de nuevo, y el **horario automático** (`DeviceActivity`) sigue funcionando siempre porque lo ejecuta el sistema. El horario también se sincroniza entre dispositivos vía iCloud (`NSUbiquitousKeyValueStore`).

> Alternativa sin programar nada: Screen Time nativo ("Tiempo de uso" → "Tiempo de inactividad" + "Apps permitidas siempre") con "Compartir entre dispositivos" activado hace algo muy parecido. Esta app te da control total, botón manual de inicio/fin sincronizado y pantalla de bloqueo personalizada.

## Requisitos

- **Xcode 15+** y **iOS 16.0+** como target mínimo.
- Una **cuenta de Apple Developer** (la gratuita sirve para instalar en tus propios dispositivos vía Xcode).
- El entitlement **Family Controls** (`com.apple.developer.family-controls`):
  - Para desarrollo/uso personal: se activa directamente en Xcode (Signing & Capabilities → + Capability → Family Controls) en la app **y en las dos extensiones**.
  - Solo si algún día quieres publicarla en el App Store: hay que pedir el entitlement de distribución a Apple en <https://developer.apple.com/contact/request/family-controls-distribution>.
- Probar en un **dispositivo físico**: las APIs de Screen Time no funcionan en el simulador.

## Cómo abrir y ejecutar el proyecto en Xcode

El proyecto de Xcode ya está incluido (`StudyBlocker.xcodeproj`), con los tres targets configurados: la app, la extensión de horario (`StudyBlockerMonitor`) y la extensión de pantalla de bloqueo (`StudyBlockerShieldUI`). Los `Info.plist`, entitlements, membresías de archivos y el modo de segundo plano para pushes ya están puestos. Solo tienes que personalizarlo con tu cuenta:

1. Clona el repo en tu Mac y abre `apple-study-blocker/StudyBlocker.xcodeproj` con doble clic (o desde Xcode: *File → Open*).
2. En el navegador de proyecto, selecciona el proyecto **StudyBlocker** y, en cada uno de los **tres targets** (pestaña *Signing & Capabilities*):
   - Elige tu **Team** (tu Apple ID de desarrollador).
   - Cambia el **Bundle Identifier** a uno tuyo, manteniendo el patrón: `com.tunombre.studyblocker`, `com.tunombre.studyblocker.monitor` y `com.tunombre.studyblocker.shieldui`.
   - Cambia el **App Group** `group.com.tunombre.studyblocker` por el tuyo (mismo valor en los tres targets) y actualiza la constante `appGroupID` en `StudyBlocker/Shared/SharedStore.swift` para que coincida.
3. Con firma automática, Xcode registrará solo los App IDs, el App Group, el contenedor de iCloud y el permiso de Family Controls en tu cuenta. Si algún capability aparece en rojo, púlsalo y deja que Xcode lo resuelva.
4. Conecta tu iPhone/iPad, selecciónalo como destino y pulsa **Run** (⌘R). Al abrir, la app pedirá autorización de Tiempo de Uso (`FamilyControls`) — acéptala.
5. Repite la instalación en cada dispositivo que quieras que se bloquee, y en cada uno elige sus apps permitidas.

## Cómo funciona

- **Botón "Empezar a estudiar"**: aplica el escudo inmediatamente en este dispositivo y publica la sesión en iCloud; tus otros dispositivos con la app reciben un push silencioso y se bloquean también (con su propia lista local). Se bloquean todas las categorías de apps (`.all(except:)`) menos las que elegiste en el selector. Las llamadas telefónicas y Ajustes nunca se bloquean (restricción de Apple).
- **Horario automático**: defines hora de inicio y fin; `DeviceActivity` despierta la extensión `StudyBlockerMonitor` a esas horas y aplica/retira el escudo aunque la app esté cerrada.
- **Pantalla de bloqueo personalizada**: al intentar abrir una app bloqueada aparece "📚 Modo estudio activo" en lugar de la pantalla genérica de Screen Time.

## Estructura del código

```
StudyBlocker/                    ← App principal (SwiftUI)
  StudyBlockerApp.swift          ← Entrada; autorización + recepción de pushes CloudKit
  ContentView.swift              ← UI: selector de apps, botón manual, horario
  Model/StudyModel.swift         ← Estado observable de la app
  Shared/SharedStore.swift       ← Persistencia compartida (App Group + iCloud KVS)
  Shared/ShieldController.swift  ← Lógica de aplicar/retirar el bloqueo
  Managers/ScheduleController.swift ← Programación con DeviceActivity
  Managers/CloudSessionSync.swift   ← Sincroniza la sesión entre dispositivos (CloudKit)
StudyBlockerMonitor/             ← Extensión: activa el bloqueo según horario
  StudyMonitor.swift
StudyBlockerShieldUI/            ← Extensión: pantalla de bloqueo personalizada
  ShieldConfigurationProvider.swift
```
