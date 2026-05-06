import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    rut: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['CLIENTE', 'VENDEDOR', 'ADMIN'], default: 'CLIENTE' },

    tipoCliente: { type: String, enum: ['NATURAL', 'EMPRESA'], default: 'NATURAL' },
    nombre: { type: String, required: true },
    correo: { type: String, required: true },
    telefono: { type: String },

    // Solo si es EMPRESA
    razonSocial: { type: String },
    giro: { type: String },
    direccion: { type: String }
  },
  { timestamps: true }
);

export const User = mongoose.model('User', userSchema);
