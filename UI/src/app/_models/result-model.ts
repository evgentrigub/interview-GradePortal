export interface Result<T> {
  isSuccess: boolean;
  data: T;
  message: string;
}

export interface ResultMessage {
  isSuccess: boolean;
  message: string;
}
