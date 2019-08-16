import { SkillViewModel } from './skill-view-model';

export interface UserViewModel {
  userData: UserData;
  skills: SkillViewModel[];
}

export interface UserData {
  num: number;
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  city: string;
  position: string;
}
