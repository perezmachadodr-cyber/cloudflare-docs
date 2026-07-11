# StudyBlocker — Modo Estudio para tus dispositivos Apple

App para iOS/iPadOS que bloquea **todas** las aplicaciones del dispositivo mientras estudias, excepto las que tú marques como permitidas (apps de estudio o de trabajo). Está construida sobre las APIs oficiales de **Screen Time** de Apple:

| Framework | Para qué se usa |
|---|---|
| `FamilyControls` | Pedir autorización de Screen Time y mostrar el selector de apps (`FamilyActivityPicker`) |
| `ManagedSettings` | Aplicar el "escudo" (shield) que bloquea las apps |
| `DeviceActivity` | Programar horarios de estudio que activan/desactivan el bloqueo automáticamente, incluso con la app cerrada |
| `ManagedSettingsUI` | Personalizar la pantalla que aparece al abrir una app bloqueada |

## ⚠️ Limitación importante: el bloqueo es por dispositivo

Apple **no permite** que una app en tu iPhone bloquee remotamente tu iPad u otros dispositivos de tu mismo Apple ID (eso solo existe para cuentas de niños con "En Familia"). Para cubrir todos tus dispositivos:

1. Instala esta app en **cada** dispositivo (iPhone y iPad; comparten el mismo código).
2. En cada dispositivo, elige una vez las apps permitidas (los "tokens" de apps que usa Apple son opacos y **no son transferibles entre dispositivos**, así que la selección se hace localmente en cada uno).
3. El **horario de estudio** sí se sincroniza automáticamente entre tus dispositivos vía iCloud (`NSUbiquitousKeyValueStore`), de modo que al cambiar el horario en un dispositivo, los demás lo adoptan.

> Alternativa sin programar nada: Screen Time nativo ("Tiempo de uso" → "Tiempo de inactividad" + "Apps permitidas siempre") con "Compartir entre dispositivos" activado hace algo muy parecido. Esta app te da control total, botón manual de inicio/fin y pantalla de bloqueo personalizada.

## Requisitos

- **Xcode 15+** y **iOS 16.0+** como target mínimo.
- Una **cuenta de Apple Developer** (la gratuita sirve para instalar en tus propios dispositivos vía Xcode).
- El entitlement **Family Controls** (`com.apple.developer.family-controls`):
  - Para desarrollo/uso personal: se activa directamente en Xcode (Signing & Capabilities → + Capability → Family Controls) en la app **y en las dos extensiones**.
  - Solo si algún día quieres publicarla en el App Store: hay que pedir el entitlement de distribución a Apple en <https://developer.apple.com/contact/request/family-controls-distribution>.
- Probar en un **dispositivo físico**: las APIs de Screen Time no funcionan en el simulador.

## Cómo montar el proyecto en Xcode

Este repositorio contiene el código fuente; el proyecto de Xcode se crea así (5 minutos):

1. **Crea la app**: Xcode → *File → New → Project → iOS → App*. Nombre: `StudyBlocker`, interfaz SwiftUI. Borra los archivos generados `ContentView.swift` y `StudyBlockerApp.swift` y arrastra dentro la carpeta `StudyBlocker/` de este repo.
2. **Crea la extensión de monitoreo**: *File → New → Target → iOS → Device Activity Monitor Extension*. Nombre: `StudyBlockerMonitor`. Sustituye su archivo generado por `StudyBlockerMonitor/StudyMonitor.swift`.
3. **Crea la extensión de pantalla de bloqueo**: *File → New → Target → iOS → Shield Configuration Extension*. Nombre: `StudyBlockerShieldUI`. Sustituye su archivo por `StudyBlockerShieldUI/ShieldConfigurationProvider.swift`.
4. **Capabilities** (en los TRES targets: app + 2 extensiones):
   - **Family Controls**
   - **App Groups**, con el grupo `group.com.tunombre.studyblocker` (cámbialo por tu identificador y actualiza la constante `appGroupID` en `Shared/SharedStore.swift`).
5. Solo en la app principal, añade también la capability **iCloud → Key-value storage** (para sincronizar el horario entre dispositivos).
6. Añade `Shared/SharedStore.swift` y `Shared/ShieldController.swift` a la membresía de **los tres targets** (File Inspector → Target Membership), porque las extensiones también los usan.
7. Compila e instala en tu iPhone/iPad. Al abrir, la app pedirá autorización de Tiempo de Uso (`FamilyControls`) — acéptala.

## Cómo funciona

- **Botón "Empezar a estudiar"**: aplica el escudo inmediatamente. Se bloquean todas las categorías de apps (`.all(except:)`) menos las que elegiste en el selector. Las llamadas telefónicas y Ajustes nunca se bloquean (restricción de Apple).
- **Horario automático**: defines hora de inicio y fin; `DeviceActivity` despierta la extensión `StudyBlockerMonitor` a esas horas y aplica/retira el escudo aunque la app esté cerrada.
- **Pantalla de bloqueo personalizada**: al intentar abrir una app bloqueada aparece "📚 Modo estudio activo" en lugar de la pantalla genérica de Screen Time.

## Estructura del código

```
StudyBlocker/                    ← App principal (SwiftUI)
  StudyBlockerApp.swift          ← Entrada; pide autorización de Screen Time
  ContentView.swift              ← UI: selector de apps, botón manual, horario
  Model/StudyModel.swift         ← Estado observable de la app
  Shared/SharedStore.swift       ← Persistencia compartida (App Group + iCloud)
  Shared/ShieldController.swift  ← Lógica de aplicar/retirar el bloqueo
  Managers/ScheduleController.swift ← Programación con DeviceActivity
StudyBlockerMonitor/             ← Extensión: activa el bloqueo según horario
  StudyMonitor.swift
StudyBlockerShieldUI/            ← Extensión: pantalla de bloqueo personalizada
  ShieldConfigurationProvider.swift
```
