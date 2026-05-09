import mongoose from 'mongoose';

const brandingSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    companyName: { type: String, default: 'FRICAR' },
    logoUrl: { type: String, default: '/logo-fricar.png' },
    logoMeta: {
      originalName: String,
      mimeType: String,
      size: Number
    }
  },
  { timestamps: true }
);

export const Branding = mongoose.model('Branding', brandingSchema);
