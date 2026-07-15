import { type UserAttrs, UserModel, type UserHydrated } from './user.model';

/**
 * Data-access layer for users. Keeps Mongoose queries out of the service layer
 * so business logic stays persistence-agnostic and easy to test.
 */
export const userRepository = {
  findById(id: string): Promise<UserHydrated | null> {
    return UserModel.findById(id).exec();
  },

  findByEmail(email: string): Promise<UserHydrated | null> {
    return UserModel.findOne({ email: email.toLowerCase() }).exec();
  },

  /** Includes the normally-excluded `passwordHash` for credential verification. */
  findByEmailWithPassword(email: string): Promise<UserHydrated | null> {
    return UserModel.findOne({ email: email.toLowerCase() }).select('+passwordHash').exec();
  },

  existsByEmail(email: string): Promise<boolean> {
    return UserModel.exists({ email: email.toLowerCase() })
      .exec()
      .then((doc) => doc !== null);
  },

  create(attrs: Omit<UserAttrs, 'tokenVersion'> & { tokenVersion?: number }): Promise<UserHydrated> {
    return UserModel.create(attrs);
  },

  /** Returns every user's id — used for broadcasting notifications. */
  async findAllIds(): Promise<string[]> {
    const docs = await UserModel.find().select('_id').exec();
    return docs.map((doc) => String(doc._id));
  },
};
