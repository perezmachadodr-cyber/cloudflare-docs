import Foundation
import FamilyControls
import ManagedSettings

/// Aplica y retira el bloqueo. Lo usan tanto la app (sesión manual)
/// como la extensión StudyBlockerMonitor (horario automático).
enum ShieldController {

    /// Un store con nombre propio para que nuestras restricciones no
    /// interfieran con otras de Screen Time.
    private static let store = ManagedSettingsStore(
        named: ManagedSettingsStore.Name("studySession")
    )

    /// Bloquea TODO excepto las apps/webs de la selección permitida.
    static func startBlocking(allowing selection: FamilyActivitySelection) {
        // Bloquea todas las categorías de apps salvo las apps elegidas.
        store.shield.applicationCategories =
            .all(except: selection.applicationTokens)

        // Lo mismo para la web en Safari: bloquea todo salvo los dominios elegidos.
        store.shield.webDomainCategories =
            .all(except: selection.webDomainTokens)

        // Evita desinstalar la app durante la sesión para no saltarse el bloqueo.
        store.application.denyAppRemoval = true
    }

    /// Retira todas las restricciones de este store.
    static func stopBlocking() {
        store.clearAllSettings()
    }
}
