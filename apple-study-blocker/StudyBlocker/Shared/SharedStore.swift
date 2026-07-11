import Foundation
import FamilyControls

/// Persistencia compartida entre la app y las extensiones (App Group),
/// más sincronización del horario entre dispositivos (iCloud key-value).
///
/// IMPORTANTE: cambia `appGroupID` por tu propio App Group y configúralo
/// en Signing & Capabilities de los TRES targets.
enum SharedStore {

    static let appGroupID = "group.com.tunombre.studyblocker"

    private static var defaults: UserDefaults {
        UserDefaults(suiteName: appGroupID) ?? .standard
    }

    private enum Keys {
        static let selection = "allowedSelection"
        static let sessionActive = "isSessionActive"
        static let scheduleEnabled = "scheduleEnabled"
        static let scheduleStart = "scheduleStart"   // minutos desde medianoche
        static let scheduleEnd = "scheduleEnd"
    }

    // MARK: - Selección de apps permitidas (solo local: los tokens de
    // FamilyControls son opacos y NO se pueden transferir a otro dispositivo)

    static func saveSelection(_ selection: FamilyActivitySelection) {
        if let data = try? JSONEncoder().encode(selection) {
            defaults.set(data, forKey: Keys.selection)
        }
    }

    static func loadSelection() -> FamilyActivitySelection {
        guard let data = defaults.data(forKey: Keys.selection),
              let selection = try? JSONDecoder().decode(FamilyActivitySelection.self, from: data)
        else { return FamilyActivitySelection() }
        return selection
    }

    // MARK: - Estado de la sesión manual

    static var isSessionActive: Bool {
        get { defaults.bool(forKey: Keys.sessionActive) }
        set { defaults.set(newValue, forKey: Keys.sessionActive) }
    }

    // MARK: - Horario (sincronizado entre tus dispositivos vía iCloud)

    static func saveSchedule(enabled: Bool, start: DateComponents, end: DateComponents) {
        let startMinutes = (start.hour ?? 0) * 60 + (start.minute ?? 0)
        let endMinutes = (end.hour ?? 0) * 60 + (end.minute ?? 0)

        defaults.set(enabled, forKey: Keys.scheduleEnabled)
        defaults.set(startMinutes, forKey: Keys.scheduleStart)
        defaults.set(endMinutes, forKey: Keys.scheduleEnd)

        // Copia en iCloud para que tus otros dispositivos adopten el mismo horario.
        let cloud = NSUbiquitousKeyValueStore.default
        cloud.set(enabled, forKey: Keys.scheduleEnabled)
        cloud.set(Double(startMinutes), forKey: Keys.scheduleStart)
        cloud.set(Double(endMinutes), forKey: Keys.scheduleEnd)
        cloud.synchronize()
    }

    static func loadSchedule() -> (enabled: Bool, start: DateComponents, end: DateComponents) {
        // Prioriza el valor de iCloud si existe (viene de otro dispositivo).
        let cloud = NSUbiquitousKeyValueStore.default
        cloud.synchronize()

        let enabled: Bool
        let startMinutes: Int
        let endMinutes: Int

        if cloud.object(forKey: Keys.scheduleStart) != nil {
            enabled = cloud.bool(forKey: Keys.scheduleEnabled)
            startMinutes = Int(cloud.double(forKey: Keys.scheduleStart))
            endMinutes = Int(cloud.double(forKey: Keys.scheduleEnd))
        } else if defaults.object(forKey: Keys.scheduleStart) != nil {
            enabled = defaults.bool(forKey: Keys.scheduleEnabled)
            startMinutes = defaults.integer(forKey: Keys.scheduleStart)
            endMinutes = defaults.integer(forKey: Keys.scheduleEnd)
        } else {
            return (false, DateComponents(hour: 8, minute: 0), DateComponents(hour: 12, minute: 0))
        }

        return (enabled,
                DateComponents(hour: startMinutes / 60, minute: startMinutes % 60),
                DateComponents(hour: endMinutes / 60, minute: endMinutes % 60))
    }
}
