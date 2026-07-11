import Foundation
import DeviceActivity

extension DeviceActivityName {
    /// Identificador de nuestra actividad programada.
    static let studySession = Self("studySession")
}

/// Programa la sesión de estudio diaria. El sistema despierta la extensión
/// StudyBlockerMonitor al inicio y al final del intervalo, incluso si la
/// app está cerrada o el dispositivo se reinició.
enum ScheduleController {

    private static let center = DeviceActivityCenter()

    static func scheduleDailySession(from start: DateComponents,
                                     to end: DateComponents) throws {
        let schedule = DeviceActivitySchedule(
            intervalStart: start,
            intervalEnd: end,
            repeats: true   // todos los días
        )
        // Reinicia el monitoreo con el nuevo horario.
        center.stopMonitoring([.studySession])
        try center.startMonitoring(.studySession, during: schedule)
    }

    static func cancelSchedule() {
        center.stopMonitoring([.studySession])
    }
}
