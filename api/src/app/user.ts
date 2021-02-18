import { Context } from '../context';
import { Result } from './result';

import { User } from '../types/user';
import { validateNewUser } from '../validation/user';
import { createUser } from '../data/user';

export async function create(context: Context, newUser: unknown): Promise<Result<User>> {
  const valideNewUser = validateNewUser(newUser);
  if (!valideNewUser.data) {
    return { errors: valideNewUser.errors };
  }
  const createdUser = await createUser(context, valideNewUser.data);
  return { data: createdUser };
}
