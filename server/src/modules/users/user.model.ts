import { model, Schema, type HydratedDocument, type Model } from 'mongoose';
import { type AuthUser, type Role, ROLES, Role as Roles, type UserStatus } from '@coresphere/shared';

const USER_STATUSES: UserStatus[] = ['active', 'invited', 'disabled'];

/** Persisted account fields. Authentication credentials only — HR profile data
 * lives in the Employee model (added in a later phase). */
export interface UserAttrs {
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  role: Role;
  status: UserStatus;
  avatarUrl?: string;
  tokenVersion: number;
  lastLoginAt?: Date;
}

export interface UserDocument extends UserAttrs {
  createdAt: Date;
  updatedAt: Date;
  fullName: string;
}

export type UserHydrated = HydratedDocument<UserDocument>;

const userSchema = new Schema<UserDocument>(
  {
    firstName: { type: String, required: true, trim: true, maxlength: 60 },
    lastName: { type: String, required: true, trim: true, maxlength: 60 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ROLES, required: true, default: Roles.Employee },
    status: { type: String, enum: USER_STATUSES, required: true, default: 'active' },
    avatarUrl: { type: String },
    tokenVersion: { type: Number, required: true, default: 0 },
    lastLoginAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret) {
        const record = ret as Record<string, unknown>;
        delete record.passwordHash;
        delete record.__v;
        return record;
      },
    },
  },
);

userSchema.virtual('fullName').get(function (this: UserDocument) {
  return `${this.firstName} ${this.lastName}`.trim();
});

/** Maps a hydrated user document to the public {@link AuthUser} contract. */
export function toAuthUser(user: UserHydrated): AuthUser {
  return {
    id: user.id as string,
    firstName: user.firstName,
    lastName: user.lastName,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    status: user.status,
    ...(user.avatarUrl ? { avatarUrl: user.avatarUrl } : {}),
    ...(user.lastLoginAt ? { lastLoginAt: user.lastLoginAt.toISOString() } : {}),
    createdAt: user.createdAt.toISOString(),
  };
}

export const UserModel: Model<UserDocument> = model<UserDocument>('User', userSchema);
