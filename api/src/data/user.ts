import { Context } from '../context';

import { NewUser, User } from '../types/user';

const insertUser = `
INSERT INTO users (name, email, username, password)
VALUES ($[name], $[email], $[username], $[password])
RETURNING id`;

export async function createUser(context: Context, newUser: NewUser): Promise<User> {
  const userId = await context.db.one(insertUser, newUser);
  return getUserById(context, userId);
}

const selectUser = `
SELECT 
    id,
    name,
    email,
    username,
    password,
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
