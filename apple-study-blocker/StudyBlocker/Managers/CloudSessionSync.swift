import Foundation
import CloudKit

/// Sincroniza el ESTADO de la sesión de estudio entre todos tus dispositivos
/// con la misma cuenta de iCloud — el mismo patrón que usan Flow, Opal o Jomo:
///
///   1. Al iniciar/terminar una sesión, se guarda un registro `StudySession`
///      en la base de datos PRIVADA de CloudKit (solo tu iCloud la ve).
///   2. Todos tus dispositivos tienen una suscripción CloudKit a ese registro.
///      Cuando cambia, iCloud les envía un push silencioso.
///   3. Cada dispositivo despierta en segundo plano y aplica (o retira) el
///      bloqueo usando SU PROPIA lista local de apps permitidas — porque los
///      tokens de apps de FamilyControls no se pueden transferir entre
///      dispositivos; lo único que viaja por iCloud es "sesión activa: sí/no".
///
/// Limitación heredada de iOS (también afecta a Flow): si el usuario fuerza
/// el cierre de la app (swipe up en el multitarea), iOS deja de entregar
/// pushes silenciosos a esa app. Por eso `reconcile()` también se llama al
/// abrir la app y al volver a primer plano, y el horario automático con
/// DeviceActivity sigue funcionando siempre.
enum CloudSessionSync {

    private static let recordType = "StudySession"
    private static let recordName = "currentSession"
    private static let subscriptionID = "study-session-changes"
    private static let subscriptionFlagKey = "cloudSubscriptionSaved"

    private static var database: CKDatabase {
        CKContainer.default().privateCloudDatabase
    }

    private static var recordID: CKRecord.ID {
        CKRecord.ID(recordName: recordName)
    }

    // MARK: - Publicar el estado (dispositivo donde pulsas el botón)

    /// Guarda en iCloud que la sesión está activa o no. Los demás
    /// dispositivos reciben un push silencioso y se actualizan solos.
    static func publish(isActive: Bool) async {
        do {
            let record: CKRecord
            if let existing = try? await database.record(for: recordID) {
                record = existing
            } else {
                record = CKRecord(recordType: recordType, recordID: recordID)
            }
            record["isActive"] = isActive ? 1 : 0
            record["updatedAt"] = Date()

            _ = try await database.modifyRecords(saving: [record],
                                                 deleting: [],
                                                 savePolicy: .allKeys)
        } catch {
            // Sin red o sin sesión de iCloud: el bloqueo local ya se aplicó;
            // los otros dispositivos se pondrán al día en el próximo reconcile.
            print("CloudSessionSync.publish error: \(error)")
        }
    }

    // MARK: - Suscripción (todos los dispositivos)

    /// Crea (una sola vez) la suscripción que hace que iCloud envíe un push
    /// silencioso a este dispositivo cuando el registro de sesión cambie.
    static func ensureSubscription() async {
        guard !UserDefaults.standard.bool(forKey: subscriptionFlagKey) else { return }

        let subscription = CKQuerySubscription(
            recordType: recordType,
            predicate: NSPredicate(value: true),
            subscriptionID: subscriptionID,
            options: [.firesOnRecordCreation, .firesOnRecordUpdate]
        )
        let info = CKSubscription.NotificationInfo()
        info.shouldSendContentAvailable = true   // push silencioso, sin alerta
        subscription.notificationInfo = info

        do {
            _ = try await database.modifySubscriptions(saving: [subscription],
                                                       deleting: [])
            UserDefaults.standard.set(true, forKey: subscriptionFlagKey)
        } catch {
            print("CloudSessionSync.ensureSubscription error: \(error)")
        }
    }

    // MARK: - Reconciliar (dispositivo que recibe el push o vuelve a abrirse)

    /// Lee el estado en iCloud y lo aplica localmente con la lista de apps
    /// permitidas de ESTE dispositivo. Devuelve true si hubo cambios.
    @discardableResult
    static func reconcile() async -> Bool {
        let remoteActive: Bool
        do {
            let record = try await database.record(for: recordID)
            remoteActive = (record["isActive"] as? Int ?? 0) == 1
        } catch let error as CKError where error.code == .unknownItem {
            remoteActive = false   // nunca se ha publicado una sesión
        } catch {
            print("CloudSessionSync.reconcile error: \(error)")
            return false
        }

        guard remoteActive != SharedStore.isSessionActive else { return false }

        if remoteActive {
            ShieldController.startBlocking(allowing: SharedStore.loadSelection())
        } else {
            ShieldController.stopBlocking()
        }
        SharedStore.isSessionActive = remoteActive

        // Avisa a la UI (si la app está abierta) para que refresque el botón.
        await MainActor.run {
            NotificationCenter.default.post(name: .studySessionDidChangeRemotely,
                                            object: nil)
        }
        return true
    }
}

extension Notification.Name {
    static let studySessionDidChangeRemotely =
        Notification.Name("studySessionDidChangeRemotely")
}
