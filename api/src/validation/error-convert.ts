import { ValidationErrorItem } from 'typesafe-joi';

import { AppError, AppErrorTypes } from '../result';

export function joiErrorToAppError(slugPrefix: string, joiErrors: ValidationErrorItem[]): AppError[] {
  return joiErrors.map((joiError) => ({
    message: joiError.message,
    slug: `${slugPrefix}-${joiError.path.join('-')}-${joiError.type.replace('.', '-')}`,
    type: AppErrorTypes.validation,
  }));
}
