export interface Result<T> {
  errors?: [string];
  data: T;
}
