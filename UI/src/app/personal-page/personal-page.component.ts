import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { User } from 'src/app/_models/user';
import { Subscription, Subject, of, Observable } from 'rxjs';
import { AuthenticationService } from '../account/services/authentication.service';
import { UserViewModel, UserData } from 'src/app/_models/user-view-model';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../account/services/user.service';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { MatTableDataSource, MatSnackBar, MatAutocompleteSelectedEvent, MatPaginator, MatSort } from '@angular/material';
import { switchMap, distinctUntilChanged, debounceTime, map, startWith, tap } from 'rxjs/operators';
import { SkillService } from '../account/services/skill.service';
import { SkillViewModel } from 'src/app/_models/skill-view-model';
import { ok } from 'assert';
import { SkillToSend } from '../_models/skill-to-send';
import { ThrowStmt } from '@angular/compiler';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

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

  get userDataValue(): UserData {
    return this.userFormGroup.value;
  }

  private readonly destroyed$ = new Subject<void>();
  private readonly routeUser: UserViewModel;
  private currentUser: User | null;
  private currentUserSubscription: Subscription;

  private userFormGroup: FormGroup;
  private previosUserDataState: UserData;
  nameSkillOptions: Observable<SkillViewModel[]>;
  displayedColumns = ['action', 'name', 'description'];
  dataSource: MatTableDataSource<SkillViewModel> = new MatTableDataSource<SkillViewModel>();

  readonly newSkillFormGroup: FormGroup;
  private newSkillNameControl: FormControl = new FormControl();
  private lastAutoCompleteValue = '';

  isShowChangeMode = false;
  isCreateMode = false;
  isLoading = true;
  isPageOwner = false;

  constructor(
    private authenticate: AuthenticationService,
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService,
    private skillService: SkillService,
    private formBuilder: FormBuilder,
    private detector: ChangeDetectorRef,
    private snackBar: MatSnackBar
  ) {
    this.userFormGroup = this.formBuilder.group({});
    this.newSkillNameControl = this.formBuilder.control('', [Validators.required, Validators.minLength(1)]);
    this.newSkillFormGroup = this.formBuilder.group({
      id: this.formBuilder.control(null),
      name: this.newSkillNameControl,
      description: this.formBuilder.control('', [Validators.required, Validators.minLength(5)]),
    });

    // const navigation = this.route.getCurrentNavigation();
    // this.routeUser = navigation.extras.state ? navigation.extras.state.user : null;

    const routeUsername = this.route.snapshot.paramMap.get('username') as string;
    this.currentUserSubscription = this.authenticate.currentUser
      .pipe(
        switchMap(user => {
          this.currentUser = user ? user : null;
          if (routeUsername) {
            if (user) {
              this.isPageOwner = routeUsername === user.username ? true : false;
            } else {
              this.isPageOwner = false;
            }
            const userByRoute$ = routeUsername ? this.userService.getByUsername(routeUsername) : of(null);
            return userByRoute$;
          } else {
            return of(null);
          }
        })
      )
      .subscribe(
        (user: UserViewModel) => {
          if (!user && !user.skills) {
            this.dataSource.data = [];
            return;
          }
          this.userFormGroup = this.createUserFormGroup(user.userData);
          this.dataSource = new MatTableDataSource(user.skills);
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

  showChangeMode(): void {
    this.isShowChangeMode = true;
    this.previosUserDataState = this.userFormGroup.value;
  }

  cancelChangeMode(): void {
    this.userFormGroup.setValue(this.previosUserDataState);
    this.isShowChangeMode = false;
  }

  canSaveUserData(): boolean {
    return this.userFormGroup.dirty && this.userFormGroup.valid;
  }

  saveUserData(): void {
    const group = this.userFormGroup;
    if (!group) {
      return;
    }
    const data = group.value as UserData;
    //  TO-DO
    // this.userService.update(data)
    //   .pipe(
    //     tap(
    //       () => {
    //         this.showMessage(`Account updated successfully! Username: ${data.username}`);
    //         this.isShowChangeMode = false;
    //         this.detector.markForCheck();
    //       },
    //       err => this.showMessage(err)
    //     )
    //   )
    //   .subscribe();
  }

  addSkill(): void {
    this.isCreateMode = true;
  }

  undoAdd(): void {
    this.isCreateMode = false;
    this.newSkillFormGroup.reset();
  }

  canSaveSkill(): boolean {
    return this.newSkillFormGroup.dirty && this.newSkillFormGroup.valid;
  }

  saveOrCreateSkill(): void {
    const group = this.newSkillFormGroup;
    if (!group) {
      return;
    }
    const skillToSave = group.value as SkillToSend;

    this.skillService
      .addOrCreateSkill(this.currentUser.id, skillToSave)
      .pipe(
        tap(
          skill => {
            this.showMessage(`New skill ${skill.name} saved successfully!`);
            this.isCreateMode = false;
            this.newSkillFormGroup.reset();

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

    this.newSkillFormGroup.setValue(skill);
    this.newSkillFormGroup.markAsDirty();

    this.detector.markForCheck();
  }

  private createUserFormGroup(data: UserData): FormGroup {
    console.log(data);
    return this.formBuilder.group({
      id: this.formBuilder.control(data.id),
      firstName: this.formBuilder.control(data.firstName, [Validators.required, Validators.minLength(1)]),
      lastName: this.formBuilder.control(data.lastName, [Validators.required, Validators.minLength(1)]),
      username: this.formBuilder.control(data.username, [Validators.required, Validators.minLength(1)]),
      city: this.formBuilder.control(data.city, [Validators.required, Validators.minLength(1)]),
      position: this.formBuilder.control(data.position, [Validators.required, Validators.minLength(1)]),
    });
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
