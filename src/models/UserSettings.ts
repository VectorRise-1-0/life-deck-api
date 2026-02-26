import mongoose, { Document, Schema } from 'mongoose';

export interface IUserSettings extends Document {
  user: mongoose.Types.ObjectId;
  notificationsEnabled: boolean;
  weeklyReportsEnabled: boolean;
  hapticsEnabled: boolean;
  soundEnabled: boolean;
  autoStartDay: boolean;
  dailyReminderTime: string;
  theme: 'system' | 'light' | 'dark';
  language: string;
}

const UserSettingsSchema = new Schema<IUserSettings>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    notificationsEnabled: { type: Boolean, default: true },
    weeklyReportsEnabled: { type: Boolean, default: true },
    hapticsEnabled: { type: Boolean, default: true },
    soundEnabled: { type: Boolean, default: true },
    autoStartDay: { type: Boolean, default: false },
    dailyReminderTime: { type: String, default: '09:00:00' },
    theme: { type: String, enum: ['system', 'light', 'dark'], default: 'system' },
    language: { type: String, default: 'en' },
  },
  { timestamps: true }
);

export const UserSettings = mongoose.model<IUserSettings>('UserSettings', UserSettingsSchema);
