import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { User, UserAuthenticated } from 'src/app/_models/user';
import { Subscription, Subject, of, Observable, concat, forkJoin } from 'rxjs';
import { AuthenticationService } from '../_services/authentication.service';
import { UserViewModel, UserData } from 'src/app/_models/user-view-model';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../_services/user.service';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MatTableDataSource, MatSnackBar, MatAutocompleteSelectedEvent, MatPaginator, MatSort } from '@angular/material';
import { switchMap, distinctUntilChanged, debounceTime, map, startWith, tap } from 'rxjs/operators';
import { SkillService } from '../_services/skill.service';
import { SkillViewModel } from 'src/app/_models/skill-view-model';
import { SkillToSend } from '../_models/skill-to-send';
import { EvaluationToSend } from '../_models/evaluation-to-send';
import { Result } from '../_models/result-model';

function reloadComponent() {
  return false;
}

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
            this.pageOwner = user && user.username === this.routeUsername ? true : false;
            this.displayedColumns =
              !user || this.pageOwner
                ? ['action', 'name', 'description', 'rating']
                : ['action', 'name', 'description', 'rating', 'expertValue'];
            this.userDataSub$ = this.userService.getByUsername(this.routeUsername);
            this.userSkills$ = user
              ? this.skillService.getUserSkills(this.routeUsername, user.id)
              : this.skillService.getUserSkills(this.routeUsername);
            return forkJoin(this.userDataSub$, this.userSkills$);
          } else {
            return of(null);
          }
        })
      ).subscribe(_ => { }, err => this.showMessage(err));
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  private showMessage(msg: any): void {
    this.snackBar.open(msg, 'ok');
  }
}
