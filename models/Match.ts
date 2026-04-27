import mongoose, { Document, Schema, Model } from 'mongoose';
import { IContent } from './Content';

export interface IMatch extends Document {
  suspectedFilePath: string;
  matchedContentId: mongoose.Types.ObjectId | IContent | null;
  similarity: number;
  createdAt: Date;
  updatedAt: Date;
}

const MatchSchema: Schema<IMatch> = new Schema(
  {
    suspectedFilePath: {
      type: String,
      required: [true, 'Please provide the suspected file path'],
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
export const Match: Model<IMatch> =
  mongoose.models.Match || mongoose.model<IMatch>('Match', MatchSchema);
