import { Component, OnDestroy } from '@angular/core';
import { UserAuthenticated } from '../_models/user';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { AuthenticationService } from '../_services/authentication.service';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css'],
})
export class NavBarComponent implements OnDestroy {
  isAuthorised: boolean;
  currentUser: UserAuthenticated | null;
  currentUserSubscription: Subscription;

  constructor(private router: Router, private authenticationService: AuthenticationService) {
    this.currentUserSubscription = this.authenticationService.currentUser.subscribe(user => {
      this.currentUser = user ? user : null;
    });
  }

  ngOnDestroy(): void {
    this.currentUserSubscription.unsubscribe();
  }

  /**
   * Log out current account
   */
  logout(): void {
    this.authenticationService.logout();
    this.router.navigate(['/login']);
  }
}
