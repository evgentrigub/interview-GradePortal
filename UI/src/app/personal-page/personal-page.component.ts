import { Component, OnDestroy, ViewChild } from '@angular/core';
import { UserAuthenticated } from 'src/app/_models/user';
import { Subscription, Subject, of, Observable, forkJoin } from 'rxjs';
import { AuthenticationService } from '../_services/authentication.service';
import { UserData } from 'src/app/_models/user-view-model';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../_services/user.service';
import { MatTableDataSource, MatSnackBar, MatPaginator, MatSort } from '@angular/material';
import { tap } from 'rxjs/operators';
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

  dataSource: MatTableDataSource<SkillViewModel>;
  displayedColumns: string[] = [];

  userDataSub$: Observable<Result<UserData>>;
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
            this.pageOwner = user && (user.username === this.routeUsername) ? true : false;
            this.displayedColumns = this.getDisplayedColumns(user, this.pageOwner);

            this.userDataSub$ = this.getObservableData('user data');
            this.userSkills$ = this.getObservableData('user skills', user);

            return forkJoin(this.userDataSub$, this.userSkills$);
          } else {
            return of(null);
          }
        })
      )
      .subscribe(_ => { }, err => this.showMessage(err));
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
    return !user || pageOwner
      ? ['action', 'name', 'description', 'rating']
      : ['action', 'name', 'description', 'rating', 'expertValue'];
  }

  /**
   * Return Observable user data or user skills
   * @param caseNum 1) user data; 2) user skills
   * @param user current authenticated user
   */
  private getObservableData(type: DataType, user?: UserAuthenticated): Observable<Result<any>> {
    switch (type) {
      case 'user data':
        return this.userService.getByUsername(this.routeUsername) as Observable<Result<UserData>>;
      case 'user skills':
        return user
          ? this.skillService.getUserSkills(this.routeUsername, user.id)
          : this.skillService.getUserSkills(this.routeUsername) as Observable<Result<SkillViewModel[]>>;
    }
  }

  private showMessage(msg: any): void {
    this.snackBar.open(msg, 'ok');
  }
}
