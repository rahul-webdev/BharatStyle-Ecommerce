import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBrand extends Document {
  id: string;
  name: string;
  srcUrl: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const brandSchema = new Schema<IBrand>(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    srcUrl: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

const Brand: Model<IBrand> = mongoose.models.Brand || mongoose.model<IBrand>('Brand', brandSchema);

export default Brand;
