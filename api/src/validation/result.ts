import { ValidationErrorItem } from 'typesafe-joi';

export interface Result<T> {
  errors?: ValidationErrorItem[];
  data?: T;
}
