import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    sku: { type: String, required: true, unique: true },
    nombre: { type: String, required: true },
    descripcion: { type: String },
    categoria: { type: String },
    unidad: { type: String },
    activo: { type: Boolean, default: true },
    principalHome: { type: Boolean, default: false },
    destacadoHome: { type: Boolean, default: false },
    images: [
      {
        url: { type: String, required: true },
        originalName: { type: String },
        mimeType: { type: String },
        size: { type: Number }
      }
    ]
  },
  { timestamps: true }
);

export const Product = mongoose.model('Product', productSchema);
