import { NewUser, newUserSchema } from '../types/user';
import { Result } from './result';

export function validateNewUser(data: unknown): Result<NewUser> {
  const validationResults = newUserSchema.validate(data);
  if (validationResults.error) {
    return {
      errors: validationResults.error.details,
    };
  }
  return { data: validationResults.value };
}
