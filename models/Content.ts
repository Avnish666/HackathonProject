import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IContent extends Document {
  filePath: string;
  hash: string;
  createdAt: Date;
  updatedAt: Date;
}

const ContentSchema: Schema<IContent> = new Schema(
  {
    filePath: {
      type: String,
      required: [true, 'Please provide a file path'],
    },
    hash: {
      type: String,
      required: [true, 'Please provide the perceptual hash'],
      index: true, // Useful for potential fast exact-match lookups
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

// Prevent re-compilation of model during Next.js hot reloading
export const Content: Model<IContent> =
  mongoose.models.Content || mongoose.model<IContent>('Content', ContentSchema);
