import mongoose, { Document, Schema, Model } from 'mongoose';
import { IContent } from './Content';

export interface IIngestMatch extends Document {
  suspectedFilePath?: string;
  source_type: string;
  source_url?: string;
  matchedContentId: mongoose.Types.ObjectId | IContent | null;
  similarity: number;
  createdAt: Date;
  updatedAt: Date;
}

const IngestMatchSchema: Schema<IIngestMatch> = new Schema(
  {
    suspectedFilePath: {
      type: String,
      required: false,
    },
    source_type: {
      type: String,
      enum: ['reddit', 'url', 'blog', 'upload'],
      default: 'upload',
    },
    source_url: {
      type: String,
      required: false,
    },
    matchedContentId: {
      type: Schema.Types.ObjectId,
      ref: 'Content',
      default: null, // Null if a match is run but similarity doesn't meet our threshold
    },
    similarity: {
      type: Number,
      required: [true, 'Please provide the similarity percentage'],
    },
  },
  {
    timestamps: true,
  }
);

// Prevent re-compilation of model during Next.js hot reloading
export const IngestMatch: Model<IIngestMatch> =
  mongoose.models.IngestMatch || mongoose.model<IIngestMatch>('IngestMatch', IngestMatchSchema);
