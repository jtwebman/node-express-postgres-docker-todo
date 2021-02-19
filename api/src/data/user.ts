import { Context } from '../context';

import { NewUser, User } from '../types/user';
import { AppErrorTypes, Result } from '../result';

const insertUser = `
INSERT INTO users (name, email, username, password)
VALUES ($[name], $[email], $[username], $[password])
RETURNING id`;

export async function createUser(context: Context, newUser: NewUser): Promise<Result<User>> {
  try {
    const userId = await context.db.one<{ id: number }>(insertUser, newUser);
    const user = await getUserById(context, userId.id);
    return { data: user };
  } catch (error) {
    if (error.constraint === 'users_email_key') {
      return {
        errors: [
          {
            message: `Email ${newUser.email} already exists`,
            slug: 'new-user-email-already-used',
            type: AppErrorTypes.validation,
          },
        ],
      };
    }
    return {
      errors: [
        {
          message: error.stack,
          slug: 'create-user-db-error',
          type: AppErrorTypes.server,
        },
      ],
    };
  }
}

const selectUser = `
SELECT 
    id,
    name,
    email,
    email_verified as "emailVerified",
    username,
    archived_at as "archivedAt",
    banned_at as "bannedAt",
    created_at as "createdAt",
    updated_at as "updatedAt"
FROM users
WHERE id = $[id]
`;

export async function getUserById(context: Context, id: number): Promise<User> {
  return context.db.one<User>(selectUser, { id });
}
