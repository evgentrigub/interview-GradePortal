import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../account/services/authentication.service';
import { UserService } from '../account/services/user.service';
import { User } from '../account/user';
import { first } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  currentUser: User;
  users = [];

  constructor(private authenticationService: AuthenticationService, private userService: UserService, private router: Router) {
    this.currentUser = this.authenticationService.currentUserValue;
  }

  ngOnInit() {
    this.loadAllUsers();
  }

  deleteUser(id: number) {
    this.userService
      .delete(id)
      .pipe(first())
      .subscribe(() => this.loadAllUsers());
  }

  private loadAllUsers() {
    this.userService
      .getAll()
      .pipe(first())
      .subscribe(users => {
        this.users = users;
        console.log(this.users);
      });
  }

  logout() {
    this.authenticationService.logout();
    this.router.navigate(['/login']);
  }
}
