import { NewUser, newUserSchema } from '../types/user';
import { joiErrorToAppError } from './error-convert';
import { Result } from '../result';

export function validateNewUser(data: unknown): Result<NewUser> {
  const validationResults = newUserSchema.validate(data, { abortEarly: false });
  if (validationResults.error) {
    return {
      errors: joiErrorToAppError('new-user', validationResults.error.details),
    };
  }
  return { data: validationResults.value };
}
