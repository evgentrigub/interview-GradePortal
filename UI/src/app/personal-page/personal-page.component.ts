import { Component, OnInit, OnDestroy, Input, OnChanges, ChangeDetectorRef, ViewChild } from '@angular/core';
import { User } from 'src/app/_models/user';
import { Subscription, Subject, of, Observable, scheduled, queueScheduler, combineLatest, concat } from 'rxjs';
import { AuthenticationService } from '../account/services/authentication.service';
import { UserViewModel } from 'src/app/_models/user-view-model';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { UserService } from '../account/services/user.service';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { MatTableDataSource, MatSnackBar, MatAutocompleteSelectedEvent, MatPaginator, MatSort } from '@angular/material';
import { takeUntil, switchMap, concatAll, distinctUntilChanged, debounceTime, map, exhaustMap, startWith, tap, concatMap, mergeMap, retryWhen } from 'rxjs/operators';
import { SkillService } from '../account/services/skill.service';
import { SkillViewModel } from 'src/app/_models/skill-view-model';
import { ok } from 'assert';
import { SkillToSend } from '../_models/skill-to-send';

const emptySkills: Observable<string[]> = of([]);

@Component({
  selector: 'app-personal-page',
  templateUrl: './personal-page.component.html',
  styleUrls: ['./personal-page.component.css'],
})
export class PersonalPageComponent implements OnInit, OnDestroy {

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  get isSkillExisted(): boolean {
    if (!this.newSkillNameControl) {
      return false;
    }
    const skillName = this.newSkillNameControl.value;
    return this.lastAutoCompleteValue === skillName ? true : false;
  }

  private readonly destroyed$ = new Subject<void>();
  private readonly routeUser: UserViewModel;
  private currentUser: User | null;
  private currentUserSubscription: Subscription;

  private lastAutoCompleteValue = '';

  isCreateMode = false;
  nameSkillOptions: Observable<SkillViewModel[]>;
  displayedColumns = ['action', 'name', 'description'];
  dataSource: MatTableDataSource<SkillViewModel> = new MatTableDataSource<SkillViewModel>();

  readonly skillFormGroup: FormGroup;
  newSkillNameControl: FormControl = new FormControl();
  isLoading = true;
  pageOwner: UserViewModel;

  constructor(
    private authenticate: AuthenticationService,
    private route: Router,
    private acivatedRoute: ActivatedRoute,
    private userService: UserService,
    private skillService: SkillService,
    private formBuilder: FormBuilder,
    private detector: ChangeDetectorRef,
    private snackBar: MatSnackBar
  ) {

    this.newSkillNameControl = this.formBuilder.control('', [Validators.required, Validators.minLength(1)]);
    this.skillFormGroup = this.formBuilder.group({
      id: this.formBuilder.control(null),
      name: this.newSkillNameControl,
      description: this.formBuilder.control('', [Validators.required, Validators.minLength(5)]),
    });

    // const navigation = this.route.getCurrentNavigation();
    // this.routeUser = navigation.extras.state ? navigation.extras.state.user : null;

    const routeUsername = this.acivatedRoute.snapshot.paramMap.get('username') as string;

    this.currentUserSubscription = this.authenticate.currentUser
      .pipe(
        switchMap(user => {
          console.log(user);
          this.currentUser = user ? user : null;
          if (!this.currentUser || this.currentUser.username !== routeUsername) {
            const otherUser$ = this.userService.getByUsername(routeUsername);
            return otherUser$.pipe(
              switchMap(us => {
                this.pageOwner = us;
                return this.skillService.getUserSkills(us.id);
              }));
          } else {
            return this.skillService.getUserSkills(this.currentUser.id);
          }
        }),
      )
      .subscribe(
        (skills: SkillViewModel[]) => {
          if (!skills) {
            this.dataSource.data = [];
            return;
          }
          this.dataSource = new MatTableDataSource(skills);
          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
          this.detector.markForCheck();
        },
        err => this.showMessage(err),
        () => (this.isLoading = false)
      );
  }

  ngOnInit() {
    this.nameSkillOptions = this.getAutocompleteSkills();
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  addSkill(): void {
    this.isCreateMode = true;
  }

  undoAdd(): void {
    this.isCreateMode = false;
    this.skillFormGroup.reset();
  }

  canSave(): boolean {
    return this.skillFormGroup.dirty && this.skillFormGroup.valid;
  }

  saveOrCreateSkill(): void {
    const group = this.skillFormGroup;
    if (!group) {
      return;
    }
    const skillToSave = group.value as SkillToSend;
    console.log('TCL: PersonalPageComponent -> skillToSave', skillToSave);

    this.skillService.addOrCreateSkill(this.currentUser.id, skillToSave)
      .pipe(
        tap(
          skill => {
            this.showMessage(`New skill ${skill.name} saved successfully!`);
            this.isCreateMode = false;
            this.skillFormGroup.reset();

            this.dataSource.data.push(skill);
            this.dataSource = new MatTableDataSource(this.dataSource.data);
            this.detector.markForCheck();
          },
          err => this.showMessage(err)
        )
      )
      .subscribe();
  }

  setAutocompleteEvent(event: MatAutocompleteSelectedEvent): void {
    const skill = event.option.value as SkillViewModel;

    if (!skill) {
      return;
    }
    this.lastAutoCompleteValue = skill.name;

    this.skillFormGroup.setValue(skill);
    this.skillFormGroup.markAsDirty();

    this.detector.markForCheck();
  }

  private getAutocompleteSkills(): Observable<SkillViewModel[]> {
    return this.newSkillNameControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(value => {
        const options = this.filterData(value || '');
        return options;
      })
    );
  }

  private filterData(value: any): Observable<SkillViewModel[]> {
    if (!value) {
      return of([]);
    }

    return this.skillService.getAutocompleteSkills(value).pipe(
      map(response =>
        response.filter((option: SkillViewModel) => {
          // return option.name.toLowerCase().indexOf(value.toLowerCase()) === 0;
          return option.name;
        })
      )
    );
  }

  private showMessage(msg: any): void {
    this.snackBar.open(msg, 'ok');
  }

  // private textComparer(x: Skill, y: Skill): boolean {
  //   return x.name === y.name && x.description === y.description;
  // }

  // skillDisplay(skill?: Skill): string | null {

  //   if (!skill) {
  //     return null;
  //   }
  //   return skill.name;
  // }
}
