import SwiftUI
import FamilyControls
import CloudKit
import UIKit

@main
struct StudyBlockerApp: App {
    @UIApplicationDelegateAdaptor(AppDelegate.self) private var appDelegate
    @StateObject private var model = StudyModel()
    @Environment(\.scenePhase) private var scenePhase

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
                    // Suscríbete a los cambios de sesión de tus otros
                    // dispositivos y ponte al día con el estado en iCloud.
                    await CloudSessionSync.ensureSubscription()
                    await CloudSessionSync.reconcile()
                    model.refreshFromSharedStore()
                }
                .onChange(of: scenePhase) { phase in
                    // Red de seguridad para el caso "app cerrada a la fuerza",
                    // donde iOS no entrega pushes silenciosos: al volver a
                    // primer plano, sincroniza con iCloud.
                    if phase == .active {
                        Task {
                            await CloudSessionSync.reconcile()
                            model.refreshFromSharedStore()
                        }
                    }
                }
        }
    }
}

/// Recibe los pushes silenciosos de CloudKit cuando otro dispositivo
/// inicia o termina una sesión de estudio, y aplica el bloqueo aquí.
final class AppDelegate: NSObject, UIApplicationDelegate {

    func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
    ) -> Bool {
        // Los pushes silenciosos de CloudKit no requieren permiso del usuario.
        application.registerForRemoteNotifications()
        return true
    }

    func application(
        _ application: UIApplication,
        didReceiveRemoteNotification userInfo: [AnyHashable: Any],
        fetchCompletionHandler completionHandler: @escaping (UIBackgroundFetchResult) -> Void
    ) {
        guard CKNotification(fromRemoteNotificationDictionary: userInfo) != nil else {
            completionHandler(.noData)
            return
        }
        Task {
            let changed = await CloudSessionSync.reconcile()
            completionHandler(changed ? .newData : .noData)
        }
    }
}
