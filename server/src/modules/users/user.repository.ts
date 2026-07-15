import { type FilterQuery } from 'mongoose';
import { type UserAttrs, type UserDocument, UserModel, type UserHydrated } from './user.model';

/**
 * Data-access layer for users. Keeps Mongoose queries out of the service layer
 * so business logic stays persistence-agnostic and easy to test.
 */
export const userRepository = {
  findById(id: string): Promise<UserHydrated | null> {
    return UserModel.findById(id).exec();
  },

  async findPaginated(params: {
    page: number;
    pageSize: number;
    search?: string;
  }): Promise<{ items: UserHydrated[]; total: number }> {
    const filter: FilterQuery<UserDocument> = {};
    if (params.search) {
      const rx = new RegExp(params.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ firstName: rx }, { lastName: rx }, { email: rx }];
    }
    const [items, total] = await Promise.all([
      UserModel.find(filter)
        .sort({ createdAt: -1 })
        .skip((params.page - 1) * params.pageSize)
        .limit(params.pageSize)
        .exec(),
      UserModel.countDocuments(filter).exec(),
    ]);
    return { items, total };
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
