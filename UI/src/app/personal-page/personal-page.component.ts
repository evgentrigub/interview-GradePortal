import { Component, OnDestroy, ViewChild } from '@angular/core';
import { UserAuthenticated } from 'src/app/_models/user';
import { Subscription, Subject, of, Observable, forkJoin } from 'rxjs';
import { AuthenticationService } from '../_services/authentication.service';
import { UserData } from 'src/app/_models/user-view-model';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../_services/user.service';
import { MatSnackBar, MatPaginator, MatSort } from '@angular/material';
import { tap, switchMap } from 'rxjs/operators';
import { SkillService } from '../_services/skill.service';
import { SkillViewModel } from 'src/app/_models/skill-view-model';
import { Result } from '../_models/result-model';

function reloadComponent() {
  return false;
}

type DataType = 'user data' | 'user skills';

@Component({
  selector: 'app-personal-page',
  templateUrl: './personal-page.component.html',
  styleUrls: ['./personal-page.component.css'],
})
export class PersonalPageComponent implements OnDestroy {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  get pageOwner(): boolean {
    return this.isPageOwner;
  }
  set pageOwner(isOwner: boolean) {
    this.isPageOwner = isOwner;
  }

  private readonly destroyed$ = new Subject<void>();
  private currentUserSubscription: Subscription;

  currentUser: UserAuthenticated | null;
  routeUsername = '';
  isPageOwner = false;
  displayedColumns: string[] = [];

  userData: Result<UserData> = {
    message: '',
    isSuccess: true,
    data: {
      num: 0,
      id: '',
      firstName: '',
      lastName: '',
      username: '',
      city: '',
      position: '',
    },
  };
  userSkills$: Observable<Result<SkillViewModel[]>>;

  constructor(
    private authenticate: AuthenticationService,
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService,
    private skillService: SkillService,
    private snackBar: MatSnackBar
  ) {
    this.router.routeReuseStrategy.shouldReuseRoute = reloadComponent;
    this.routeUsername = this.route.snapshot.paramMap.get('username') as string;

    this.currentUserSubscription = this.authenticate.currentUser
      .pipe(
        tap(user => {
          this.currentUser = user ? user : null;
          if (this.routeUsername) {
            this.pageOwner = user && user.username === this.routeUsername ? true : false;
            this.displayedColumns = this.getDisplayedColumns(user, this.pageOwner);

            const userDataSub$: Observable<Result<UserData>> = this.getObservableData('user data', this.routeUsername);

            this.userSkills$ = userDataSub$.pipe(
              switchMap(userDataResult => {
                if (userDataResult.data == null) {
                  this.userData = null;
                  return of(null);
                }

                this.userData = userDataResult;
                return this.getObservableData('user skills', this.routeUsername, userDataResult.data, user);
              })
            );
          } else {
            return of(null);
          }
        })
      )
      .subscribe(_ => {}, err => this.showMessage(err));
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  /**
   * Return columns with column "Expert value" for authenticated users
   * or without for unauthorized users
   * @param user current authenticated user
   * @param pageOwner bool is personal page your own
   */
  private getDisplayedColumns(user: UserAuthenticated, pageOwner: boolean) {
    return !user || pageOwner ? ['action', 'name', 'description', 'rating'] : ['action', 'name', 'description', 'rating', 'expertValue'];
  }

  /**
   * Return Observable user data or user skills
   * @param type 1) user data; 2) user skills
   * @param pageOwnerData data of page owner user
   * @param user current authenticated user
   */
  private getObservableData(
    type: DataType,
    routeUsername: string,
    pageOwnerData?: UserData,
    user?: UserAuthenticated
  ): Observable<Result<any>> {
    switch (type) {
      case 'user data':
        return this.userService.getByUsername(routeUsername) as Observable<Result<UserData>>;
      case 'user skills':
        return user
          ? this.skillService.getUserSkills(pageOwnerData.id, user.id)
          : (this.skillService.getUserSkills(pageOwnerData.id) as Observable<Result<SkillViewModel[]>>);
    }
  }

  private showMessage(msg: any): void {
    this.snackBar.open(msg, 'ok');
  }
}
