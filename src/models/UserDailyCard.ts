import mongoose, { Document, Schema } from 'mongoose';

export interface IUserDailyCard extends Document {
  user: mongoose.Types.ObjectId;
  card: mongoose.Types.ObjectId;
  assignedDate: Date;
  completedDate?: Date;
  snoozedUntil?: Date;
  userNote?: string;
  isBookmarked: boolean;
}

const UserDailyCardSchema = new Schema<IUserDailyCard>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    card: { type: Schema.Types.ObjectId, ref: 'CoachingCard', required: true },
    assignedDate: { type: Date, required: true },
    completedDate: { type: Date },
    snoozedUntil: { type: Date },
    userNote: { type: String },
    isBookmarked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

UserDailyCardSchema.index({ user: 1, assignedDate: 1 });
UserDailyCardSchema.index({ user: 1, card: 1, assignedDate: 1 }, { unique: true });

export const UserDailyCard = mongoose.model<IUserDailyCard>('UserDailyCard', UserDailyCardSchema);
