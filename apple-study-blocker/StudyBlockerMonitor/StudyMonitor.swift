import DeviceActivity
import ManagedSettings
import FamilyControls

/// Extensión "Device Activity Monitor". El sistema la despierta al inicio
/// y al final del horario de estudio programado, aunque la app principal
/// esté cerrada. Aquí se aplica y se retira el bloqueo automáticamente.
///
/// Requiere las capabilities Family Controls y App Groups en este target,
/// y que SharedStore.swift y ShieldController.swift estén incluidos en su
/// Target Membership.
class StudyMonitor: DeviceActivityMonitor {

    override func intervalDidStart(for activity: DeviceActivityName) {
        super.intervalDidStart(for: activity)
        guard activity == .studySession else { return }

        // Lee la selección guardada por la app (App Group) y bloquea el resto.
        let allowed = SharedStore.loadSelection()
        ShieldController.startBlocking(allowing: allowed)
        SharedStore.isSessionActive = true
    }

    override func intervalDidEnd(for activity: DeviceActivityName) {
        super.intervalDidEnd(for: activity)
        guard activity == .studySession else { return }

        ShieldController.stopBlocking()
        SharedStore.isSessionActive = false
    }
}
