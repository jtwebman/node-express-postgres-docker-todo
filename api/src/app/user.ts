import bcrypt from 'bcrypt';

import { Context } from '../context';
import { Result } from '../result';

import { User } from '../types/user';
import { validateNewUser } from '../validation/user';
import { createUser } from '../data/user';

export async function create(context: Context, newUser: unknown): Promise<Result<User>> {
  const valideNewUser = validateNewUser(newUser);
  if (!valideNewUser.data) {
    return { errors: valideNewUser.errors };
  }
  const saltRounds = context.config.get<number>('PASSWORD_SALT_ROUNDS');
  const newUserHashedPassword = {
    ...valideNewUser.data,
    password: await bcrypt.hash(valideNewUser.data.password, saltRounds),
  };
  return createUser(context, newUserHashedPassword);
}
