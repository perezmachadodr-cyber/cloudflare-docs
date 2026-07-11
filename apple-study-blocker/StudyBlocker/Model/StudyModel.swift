import Foundation
import FamilyControls
import Combine

/// Estado central de la app: qué apps están permitidas, si hay una sesión
/// de estudio activa y el horario automático configurado.
@MainActor
final class StudyModel: ObservableObject {

    @Published var isAuthorized = false
    @Published var authorizationError: String?

    /// Apps y sitios web que SÍ se pueden usar durante el estudio
    /// (tus apps de estudio y de trabajo). Todo lo demás se bloquea.
    @Published var allowedSelection = FamilyActivitySelection() {
        didSet { SharedStore.saveSelection(allowedSelection) }
    }

    /// Sesión manual activa ahora mismo.
    @Published var isSessionActive = SharedStore.isSessionActive {
        didSet { SharedStore.isSessionActive = isSessionActive }
    }

    /// Horario automático (se sincroniza entre dispositivos vía iCloud).
    @Published var scheduleEnabled = false
    @Published var startTime = DateComponents(hour: 8, minute: 0)
    @Published var endTime = DateComponents(hour: 12, minute: 0)

    private var remoteChangeObserver: NSObjectProtocol?

    init() {
        allowedSelection = SharedStore.loadSelection()
        let schedule = SharedStore.loadSchedule()
        scheduleEnabled = schedule.enabled
        startTime = schedule.start
        endTime = schedule.end

        // Si otro dispositivo inicia/termina la sesión (vía iCloud),
        // refleja el cambio en esta UI.
        remoteChangeObserver = NotificationCenter.default.addObserver(
            forName: .studySessionDidChangeRemotely,
            object: nil,
            queue: .main
        ) { [weak self] _ in
            Task { @MainActor in self?.refreshFromSharedStore() }
        }
    }

    /// Relee el estado persistido (lo actualizan los reconciles de iCloud
    /// y la extensión de horario) sin volver a escribirlo.
    func refreshFromSharedStore() {
        let stored = SharedStore.isSessionActive
        if stored != isSessionActive {
            isSessionActive = stored
        }
    }

    // MARK: - Sesión manual

    func startStudying() {
        ShieldController.startBlocking(allowing: allowedSelection)
        isSessionActive = true
        // Avisa a tus otros dispositivos (push silencioso vía CloudKit)
        // para que apliquen su propio bloqueo local.
        Task { await CloudSessionSync.publish(isActive: true) }
    }

    func stopStudying() {
        ShieldController.stopBlocking()
        isSessionActive = false
        Task { await CloudSessionSync.publish(isActive: false) }
    }

    // MARK: - Horario automático

    func applySchedule() throws {
        SharedStore.saveSchedule(enabled: scheduleEnabled,
                                 start: startTime,
                                 end: endTime)
        if scheduleEnabled {
            try ScheduleController.scheduleDailySession(from: startTime, to: endTime)
        } else {
            ScheduleController.cancelSchedule()
        }
    }
}
