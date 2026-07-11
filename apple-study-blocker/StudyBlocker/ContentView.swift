import SwiftUI
import FamilyControls

struct ContentView: View {
    @EnvironmentObject private var model: StudyModel
    @State private var showingPicker = false
    @State private var scheduleError: String?

    var body: some View {
        NavigationStack {
            Form {
                if !model.isAuthorized {
                    Section {
                        Label("Autorización de Tiempo de Uso pendiente",
                              systemImage: "exclamationmark.triangle")
                        if let error = model.authorizationError {
                            Text(error).font(.caption).foregroundStyle(.secondary)
                        }
                    }
                }

                Section("Apps permitidas al estudiar") {
                    Button {
                        showingPicker = true
                    } label: {
                        Label("Elegir apps de estudio y trabajo",
                              systemImage: "checklist")
                    }
                    Text("\(model.allowedSelection.applicationTokens.count) apps y \(model.allowedSelection.webDomainTokens.count) sitios web permitidos")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }

                Section("Sesión de estudio") {
                    if model.isSessionActive {
                        Button(role: .destructive) {
                            model.stopStudying()
                        } label: {
                            Label("Terminar sesión", systemImage: "stop.circle.fill")
                        }
                        Label("Bloqueo activo en este dispositivo y en tus otros dispositivos con la app instalada",
                              systemImage: "lock.icloud.fill")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    } else {
                        Button {
                            model.startStudying()
                        } label: {
                            Label("Empezar a estudiar", systemImage: "book.fill")
                        }
                        .disabled(!model.isAuthorized)
                    }
                }

                Section("Horario automático (diario)") {
                    Toggle("Activar horario", isOn: $model.scheduleEnabled)
                    DatePicker("Inicio",
                               selection: timeBinding(for: \.startTime),
                               displayedComponents: .hourAndMinute)
                    DatePicker("Fin",
                               selection: timeBinding(for: \.endTime),
                               displayedComponents: .hourAndMinute)
                    Button("Guardar horario") {
                        do {
                            try model.applySchedule()
                            scheduleError = nil
                        } catch {
                            scheduleError = error.localizedDescription
                        }
                    }
                    .disabled(!model.isAuthorized)
                    if let scheduleError {
                        Text(scheduleError).font(.caption).foregroundStyle(.red)
                    }
                    Text("El horario se sincroniza con tus otros dispositivos vía iCloud. Recuerda instalar la app y elegir las apps permitidas en cada dispositivo.")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }
            .navigationTitle("StudyBlocker")
            .familyActivityPicker(isPresented: $showingPicker,
                                  selection: $model.allowedSelection)
        }
    }

    /// Convierte DateComponents (hora/minuto) en un Binding<Date> para DatePicker.
    private func timeBinding(
        for keyPath: ReferenceWritableKeyPath<StudyModel, DateComponents>
    ) -> Binding<Date> {
        Binding<Date> {
            Calendar.current.date(from: model[keyPath: keyPath]) ?? .now
        } set: { newDate in
            model[keyPath: keyPath] = Calendar.current
                .dateComponents([.hour, .minute], from: newDate)
        }
    }
}
