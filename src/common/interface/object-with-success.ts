export interface ObjectWithSuccess<T = any> {
  success: boolean;
  data?: T;
  [key: string]: any;
}
