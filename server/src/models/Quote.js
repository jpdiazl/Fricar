import mongoose from 'mongoose';

const quoteItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    cantidad: { type: Number, required: true, min: 1 }
  },
  { _id: false }
);

const quoteSchema = new mongoose.Schema(
  {
    numero: { type: String, required: true, unique: true },
    clienteId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: { type: [quoteItemSchema], default: [] },
    estado: { type: String, enum: ['PENDIENTE', 'ENVIADA', 'EN_PROCESO', 'RESUELTA', 'CERRADA'], default: 'PENDIENTE' },
    vendedorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    notasVendedor: { type: String },
    enviadaPorCorreo: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const Quote = mongoose.model('Quote', quoteSchema);
