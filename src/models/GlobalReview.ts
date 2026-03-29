import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IGlobalReview extends Document {
  user: string;
  content: string;
  rating: number;
  date: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const globalReviewSchema = new Schema<IGlobalReview>(
  {
    user: { type: String, required: true },
    content: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    date: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

const GlobalReview: Model<IGlobalReview> = mongoose.models.GlobalReview || mongoose.model<IGlobalReview>('GlobalReview', globalReviewSchema);

export default GlobalReview;
