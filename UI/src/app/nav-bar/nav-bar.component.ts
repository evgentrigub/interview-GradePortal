import { Component, OnInit, OnDestroy } from '@angular/core';
import { User } from '../account/user';
import { Subscription, Observable } from 'rxjs';
import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthenticationService } from '../account/services/authentication.service';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css'],
})
export class NavBarComponent implements OnDestroy {
  isShow: boolean;
  currentUser: User;
  currentUserSubscription: Subscription;

  constructor(
    private breakpointObserver: BreakpointObserver,
    private router: Router,
    private authenticationService: AuthenticationService
  ) {
    this.currentUserSubscription = this.authenticationService.currentUser.subscribe(user => {
      if (user) {
        this.isShow = true;
      } else {
        this.isShow = false;
      }
      this.currentUser = user;
    });
  }

  ngOnDestroy(): void {
    this.currentUserSubscription.unsubscribe();
  }

  logout() {
    this.authenticationService.logout();
    this.router.navigate(['/login']);
  }
}
