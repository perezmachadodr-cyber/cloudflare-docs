import SwiftUI
import FamilyControls

@main
struct StudyBlockerApp: App {
    @StateObject private var model = StudyModel()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(model)
                .task {
                    // Pide autorización de Tiempo de Uso (Screen Time) al arrancar.
                    // `.individual` = restricciones sobre ESTE dispositivo, sin
                    // necesidad de "En Familia".
                    do {
                        try await AuthorizationCenter.shared
                            .requestAuthorization(for: .individual)
                        model.isAuthorized = true
                    } catch {
                        model.isAuthorized = false
                        model.authorizationError = error.localizedDescription
                    }
                }
        }
    }
}
