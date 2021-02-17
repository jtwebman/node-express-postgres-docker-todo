import { Database } from '../db';
import { Result } from './result';

export interface User {
  id?: number;
  name: string;
  email: string;
  email_verified: boolean;
  username: string;
  password?: string;
  archived_at?: Date;
  banned_at?: Date;
  created_at?: Date;
  updated_at?: Date;
}

export function create(_db: Database, newUser: any): Result<User> {
  const createdUser: User = newUser;
  return { data: createdUser };
}
