import { UserData } from './user-view-model';

export interface User {
  id: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  token: string;
}

export interface UserAuthenticated extends UserData {
  token: string;
}
