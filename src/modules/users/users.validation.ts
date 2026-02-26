import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
});

export const updateSettingsSchema = z.object({
  notificationsEnabled: z.boolean().optional(),
  weeklyReportsEnabled: z.boolean().optional(),
  hapticsEnabled: z.boolean().optional(),
  soundEnabled: z.boolean().optional(),
  autoStartDay: z.boolean().optional(),
  dailyReminderTime: z
    .string()
    .regex(/^\d{2}:\d{2}:\d{2}$/, 'Time must be in HH:MM:SS format')
    .optional(),
  theme: z.enum(['system', 'light', 'dark']).optional(),
  language: z.string().min(2).max(10).optional(),
});
