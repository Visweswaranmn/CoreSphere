import { Role } from '@coresphere/shared';
import { connectDatabase, disconnectDatabase } from '../config/database';
import { logger } from '../config/logger';
import { UserModel } from '../modules/users/user.model';
import { hashPassword } from '../utils/password';

interface SeedUser {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: Role;
}

const seedUsers: SeedUser[] = [
  {
    firstName: 'System',
    lastName: 'Administrator',
    email: process.env.SEED_ADMIN_EMAIL ?? 'admin@gmail.com',
    password: process.env.SEED_ADMIN_PASSWORD ?? '12345678',
    role: Role.SuperAdmin,
  },
  {
    firstName: 'Demo',
    lastName: 'Employee',
    email: 'employee@coresphere.local',
    password: 'Employee@12345',
    role: Role.Employee,
  },
];

async function seed(): Promise<void> {
  await connectDatabase();

  for (const user of seedUsers) {
    const existing = await UserModel.findOne({ email: user.email }).exec();
    if (existing) {
      logger.info(`✓ User already exists: ${user.email} (${user.role})`);
      continue;
    }

    await UserModel.create({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      passwordHash: await hashPassword(user.password),
      role: user.role,
      status: 'active',
    });
    logger.info(`＋ Created ${user.role}: ${user.email} / ${user.password}`);
  }

  logger.info('Seed complete.');
}

seed()
  .catch((err) => {
    logger.error({ err }, 'Seed failed');
    process.exitCode = 1;
  })
  .finally(() => {
    void disconnectDatabase();
  });
