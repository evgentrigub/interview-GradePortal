import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from 'src/app/_models/user';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { UserViewModel } from 'src/app/_models/user-view-model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private http: HttpClient) { }

  getAll() {
    return this.http.get<UserViewModel[]>(`${environment.apiUrl}/users/getall`)
      .pipe(tap(users => {
        for (let i = 0; i < users.length; i++) {
          const user = users[i];
          user.num = i + 1;
        }
      }));
  }

  getById(id: number) {
    return this.http.get(`${environment.apiUrl}/users/${id}`);
  }

  update(user: User) {
    return this.http.put(`${environment.apiUrl}/users/${user.id}`, user);
  }

  delete(id: number) {
    return this.http.delete(`${environment.apiUrl}/users/${id}`);
  }
}
