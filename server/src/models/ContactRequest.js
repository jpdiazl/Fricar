import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema(
  {
    numero: { type: String, required: true, unique: true },
    nombre: { type: String, required: true },
    correo: { type: String, required: true },
    telefono: { type: String },
    mensaje: { type: String, required: true },
    // Estados:
    // - NUEVO: creado desde el formulario público
    // - EN PROCESO: el vendedor respondió por correo
    // - SOLUCIONADO: caso cerrado / finalizado
    // (CERRADO se mantiene por compatibilidad con datos antiguos)
    estado: { type: String, enum: ['NUEVO', 'EN PROCESO', 'SOLUCIONADO', 'CERRADO'], default: 'NUEVO' },
    vendedorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    notasVendedor: { type: String },
    enviadaPorCorreo: { type: Boolean, default: false },
    // Fecha/hora de cierre cuando el caso se marca como solucionado.
    solvedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

export const ContactRequest = mongoose.model('ContactRequest', contactSchema);
