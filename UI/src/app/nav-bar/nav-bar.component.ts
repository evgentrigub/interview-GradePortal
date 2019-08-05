import { Component, OnInit, OnDestroy } from '@angular/core';
import { User } from '../_models/user';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { AuthenticationService } from '../account/services/authentication.service';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css'],
})
export class NavBarComponent implements OnDestroy {
  isAuthorised: boolean;
  currentUser: User | null;
  currentUserSubscription: Subscription;

  constructor(
    private router: Router,
    private authenticationService: AuthenticationService
  ) {
    this.currentUserSubscription = this.authenticationService.currentUser.subscribe(user => {
      // this.isAuthorised = user ? true : false;
      this.currentUser = user ? user : null;
    });
  }

  ngOnDestroy(): void {
    this.currentUserSubscription.unsubscribe();
  }

  clickAccount(): void {
    if (this.currentUser) {
      this.router.navigate([`/${this.currentUser.username}`]);
    } else {
      this.router.navigate(['/login']);
    }
  }

  private _logout(): void {
    this.authenticationService.logout();
    this.router.navigate(['/login']);
  }
}
