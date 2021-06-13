export enum AppErrorTypes {
  validation = 'validation',
  server = 'server',
  access = 'access',
  notFound = 'not_found',
}

export interface AppError {
  message: string;
  slug: string;
  type: AppErrorTypes;
}

export interface Result<T> {
  errors?: AppError[];
  data?: T;
}
