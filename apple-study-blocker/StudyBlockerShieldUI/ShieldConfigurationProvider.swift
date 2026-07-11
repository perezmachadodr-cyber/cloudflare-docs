import ManagedSettings
import ManagedSettingsUI
import UIKit

/// Extensión "Shield Configuration". Personaliza la pantalla que aparece
/// cuando intentas abrir una app bloqueada durante la sesión de estudio.
class ShieldConfigurationProvider: ShieldConfigurationDataSource {

    private var studyShield: ShieldConfiguration {
        ShieldConfiguration(
            backgroundBlurStyle: .systemUltraThinMaterial,
            backgroundColor: UIColor.systemIndigo.withAlphaComponent(0.4),
            icon: UIImage(systemName: "book.closed.fill"),
            title: ShieldConfiguration.Label(
                text: "📚 Modo estudio activo",
                color: .white
            ),
            subtitle: ShieldConfiguration.Label(
                text: "Esta app está bloqueada mientras estudias. ¡Tú puedes!",
                color: .white
            ),
            primaryButtonLabel: ShieldConfiguration.Label(
                text: "Volver al estudio",
                color: .systemIndigo
            ),
            primaryButtonBackgroundColor: .white
        )
    }

    override func configuration(shielding application: Application) -> ShieldConfiguration {
        studyShield
    }

    override func configuration(shielding application: Application,
                                in category: ActivityCategory) -> ShieldConfiguration {
        studyShield
    }

    override func configuration(shielding webDomain: WebDomain) -> ShieldConfiguration {
        studyShield
    }

    override func configuration(shielding webDomain: WebDomain,
                                in category: ActivityCategory) -> ShieldConfiguration {
        studyShield
    }
}
