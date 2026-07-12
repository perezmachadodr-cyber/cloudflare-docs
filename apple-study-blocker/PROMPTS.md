# Prompts para que Claude Code (en tu Mac) termine el proyecto

Copia y pega estos prompts, **uno por uno y en orden**, en la sesión de Claude Code
que corre en tu Mac. Espera a que termine cada uno antes de pasar al siguiente.
Cuando Claude te pida permiso para ejecutar comandos, acéptalo.

---

## Prompt 1 — Descargar el proyecto y verificarlo

```
Clona la rama claude/apple-study-mode-blocker-2jwzxq del repositorio
https://github.com/perezmachadodr-cyber/cloudflare-docs.git en mi carpeta
personal (si ya existe la carpeta cloudflare-docs, haz git pull en su lugar).
Después entra en cloudflare-docs/apple-study-blocker, lee el README.md y el
project.pbxproj, lista todos los archivos del proyecto y confirma que no
falta ninguno de los que menciona la sección "Estructura del código" del
README. Al final dime en una frase si el proyecto está completo.
```

## Prompt 2 — Comprobar que Xcode está listo

```
Verifica que Xcode está bien instalado en este Mac: comprueba
xcode-select -p (si apunta a CommandLineTools, cámbialo a Xcode con
sudo xcode-select -s /Applications/Xcode.app), acepta la licencia si hace
falta (sudo xcodebuild -license accept), ejecuta
xcodebuild -runFirstLaunch, y muéstrame la versión con xcodebuild -version.
Después ejecuta xcrun xctrace list devices y dime si mi iPhone aparece
conectado. Si no aparece, dime exactamente qué tengo que hacer yo
(cable, desbloquear, confiar).
```

## Prompt 3 — Configurar la firma con mi cuenta

```
En el proyecto cloudflare-docs/apple-study-blocker/StudyBlocker.xcodeproj:
primero ejecuta "security find-identity -v -p codesigning" y
"defaults read com.apple.dt.Xcode IDEProvisioningTeams" (o abre Xcode si
hace falta) para averiguar mi Team ID de desarrollador. Si no encuentras
ningún equipo, dime paso a paso cómo añadir mi Apple ID en Xcode
(Xcode → Settings → Accounts → botón +) y espera a que te confirme que lo hice.
Cuando tengas el Team ID: edita el project.pbxproj para añadir
DEVELOPMENT_TEAM con mi Team ID en los tres targets, y sustituye
"com.tunombre.studyblocker" por un bundle id único basado en mi equipo
(por ejemplo com.<miteamid>.studyblocker) en los tres targets, manteniendo
los sufijos .monitor y .shieldui. Cambia también el App Group
"group.com.tunombre.studyblocker" al nuevo nombre en los tres archivos
.entitlements Y en la constante appGroupID de
StudyBlocker/Shared/SharedStore.swift (deben coincidir exactamente).
Muéstrame un resumen de lo que cambiaste.
```

## Prompt 4 — Compilar y corregir errores

```
Compila el proyecto con:
xcodebuild -project StudyBlocker.xcodeproj -scheme StudyBlocker
-destination "generic/platform=iOS" -allowProvisioningUpdates build
(si no existe el scheme, créalo o usa -target). Si salen errores de
compilación o de firma, corrígelos tú mismo editando los archivos que haga
falta y vuelve a compilar, repitiendo hasta que el build diga BUILD
SUCCEEDED. Si un error requiere una acción manual mía en Xcode o en
developer.apple.com (por ejemplo aceptar el capability de Family Controls
o registrar el App Group), dime exactamente qué botón tocar y espera mi
confirmación. No te detengas hasta lograr BUILD SUCCEEDED.
```

## Prompt 5 — Instalar en mi iPhone

```
Mi iPhone está conectado por cable y desbloqueado. Averigua su identificador
con xcrun xctrace list devices y compila e instala la app en él con
xcodebuild ... -destination "platform=iOS,id=<el id>"
-allowProvisioningUpdates, o si es más fiable, ábrelo en Xcode con
"open StudyBlocker.xcodeproj" y dime exactamente qué seleccionar y qué
botón pulsar para ejecutarla en mi iPhone. Si iOS bloquea la app por
"desarrollador no confiable", dime cómo autorizarla en
Ajustes → General → VPN y gestión de dispositivos. Termina cuando la app
StudyBlocker esté abierta en mi iPhone.
```

## Prompt 6 — Probar que funciona

```
La app ya está instalada en mi iPhone. Guíame para probarla:
1) aceptar el permiso de Tiempo de Uso cuando la app lo pida,
2) elegir mis apps de estudio y trabajo permitidas,
3) pulsar "Empezar a estudiar" y comprobar que las demás apps quedan
bloqueadas con la pantalla "Modo estudio activo",
4) pulsar "Terminar sesión" y comprobar que se desbloquean,
5) configurar un horario automático de prueba que empiece en 5 minutos
y comprobar que el bloqueo se activa solo.
Si algo de esto falla, diagnostica el problema mirando los logs del
dispositivo (o pídeme capturas de pantalla) y corrige el código hasta que
funcione. Los problemas más probables: el App Group no coincide entre
SharedStore.swift y los entitlements, o falta el capability Family Controls
en alguno de los tres targets.
```

## Prompt 7 — Instalar en el iPad (y otros dispositivos)

```
Ahora conecto mi iPad por cable. Instala la misma app en él igual que
hicimos con el iPhone. Recuérdame que en el iPad también tengo que aceptar
el permiso de Tiempo de Uso y elegir las apps permitidas (la selección de
apps no se copia entre dispositivos, es una restricción de Apple; solo la
sesión y el horario se sincronizan por iCloud).
```

## Prompt 8 — Probar la sincronización entre dispositivos

```
iPhone y iPad tienen la app instalada y configurada, ambos con la misma
cuenta de iCloud y con conexión a internet. Guíame para probar la
sincronización estilo Flow: pulso "Empezar a estudiar" en el iPhone y en
uno o dos minutos el iPad debería bloquearse solo (recibe un push
silencioso de iCloud). Si no ocurre: comprueba que el capability de iCloud
CloudKit y Push Notifications están activos en el target de la app,
que el iPad no tiene la app cerrada a la fuerza (desde el multitarea),
y revisa el código de CloudSessionSync.swift por si hay que corregir algo.
Itera hasta que la sincronización funcione en ambas direcciones
(bloquear y desbloquear).
```

---

## Prompt de emergencia — para cualquier error

Si en cualquier momento aparece un error que no sabes interpretar, pega esto
seguido del texto del error (o describe lo que ves en pantalla):

```
Apareció este error mientras trabajábamos en StudyBlocker. Diagnostícalo,
explícame en lenguaje sencillo qué significa, corrígelo tú si es cosa del
código o del proyecto, y si requiere una acción manual mía dime exactamente
qué tocar y dónde:

<pega aquí el error>
```
