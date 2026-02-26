import mongoose, { Document, Schema } from 'mongoose';

export interface ISubscription extends Document {
  user: mongoose.Types.ObjectId;
  tier: 'free' | 'premium';
  status: 'not_subscribed' | 'active' | 'expired' | 'cancelled' | 'pending_renewal' | 'in_grace_period';
  startDate?: Date;
  expiryDate?: Date;
  autoRenewEnabled: boolean;
  productId?: string;
  transactionId?: string;
  originalTransactionId?: string;
  purchaseDate?: Date;
}

const SubscriptionSchema = new Schema<ISubscription>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    tier: { type: String, enum: ['free', 'premium'], default: 'free' },
    status: {
      type: String,
      enum: ['not_subscribed', 'active', 'expired', 'cancelled', 'pending_renewal', 'in_grace_period'],
      default: 'not_subscribed',
    },
    startDate: { type: Date },
    expiryDate: { type: Date },
    autoRenewEnabled: { type: Boolean, default: false },
    productId: { type: String },
    transactionId: { type: String },
    originalTransactionId: { type: String },
    purchaseDate: { type: Date },
  },
  { timestamps: true }
);

export const Subscription = mongoose.model<ISubscription>('Subscription', SubscriptionSchema);
