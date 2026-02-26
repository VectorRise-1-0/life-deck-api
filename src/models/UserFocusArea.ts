import mongoose, { Document, Schema } from 'mongoose';

export type Domain = 'health' | 'finance' | 'productivity' | 'mindfulness';

export interface IUserFocusArea extends Document {
  user: mongoose.Types.ObjectId;
  domain: Domain;
}

const UserFocusAreaSchema = new Schema<IUserFocusArea>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    domain: {
      type: String,
      enum: ['health', 'finance', 'productivity', 'mindfulness'],
      required: true,
    },
  },
  { timestamps: true }
);

UserFocusAreaSchema.index({ user: 1, domain: 1 }, { unique: true });

export const UserFocusArea = mongoose.model<IUserFocusArea>('UserFocusArea', UserFocusAreaSchema);
