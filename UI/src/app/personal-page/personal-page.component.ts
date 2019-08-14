import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { User } from 'src/app/_models/user';
import { Subscription, Subject, of, Observable } from 'rxjs';
import { AuthenticationService } from '../account/services/authentication.service';
import { UserViewModel, UserData } from 'src/app/_models/user-view-model';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../account/services/user.service';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MatTableDataSource, MatSnackBar, MatAutocompleteSelectedEvent, MatPaginator, MatSort } from '@angular/material';
import { switchMap, distinctUntilChanged, debounceTime, map, startWith, tap } from 'rxjs/operators';
import { SkillService } from '../account/services/skill.service';
import { SkillViewModel } from 'src/app/_models/skill-view-model';
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

  get pageOwner(): boolean {
    return this._isPageOwner;
  }

  set pageOwner(isOwner: boolean) {
    this._isPageOwner = isOwner;
  }

  get editUserMode(): boolean {
    return this._isEditMode;
  }

  set editUserMode(isEdit: boolean) {
    this._isEditMode = isEdit;
  }

  get evaluateSkill(): string {
    return this._evaluateSkillId;
  }

  set evaluateSkill(skillId: string) {
    this._evaluateSkillId = skillId;
  }

  get newSkillMode(): boolean {
    return this._isCreateNewSkill;
  }

  set newSkillMode(isMode: boolean) {
    this._isCreateNewSkill = isMode;
  }

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
  displayedColumns = ['action', 'name', 'description', 'evaluate'];
  dataSource: MatTableDataSource<SkillViewModel>;

  readonly newSkillFormGroup: FormGroup;
  private newSkillNameControl: FormControl = new FormControl();
  private lastAutoCompleteValue = '';

  private _isEditMode = false;
  private _isCreateNewSkill = false;
  private _evaluateSkillId = '';
  private _isPageOwner = false;

  evaluationControl: FormControl;

  isLoading = true;

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
              this.pageOwner = routeUsername === user.username ? true : false;
            } else {
              this.pageOwner = false;
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

  // USER DATA

  showChangeMode(): void {
    this.editUserMode = true;
    this.previosUserDataState = this.userFormGroup.value;
  }

  cancelChangeMode(): void {
    this.userFormGroup.setValue(this.previosUserDataState);
    this.editUserMode = false;
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
    this.userService.update(data)
      .pipe(
        tap(
          () => {
            this.showMessage(`Account updated successfully! Username: ${data.username}`);
            this._isEditMode = false;
            this.detector.markForCheck();
          },
          err => this.showMessage(err)
        )
      )
      .subscribe();
  }

  // EVALUATION

  addEvaluation(skill: SkillViewModel): void {
    this.evaluateSkill = skill.id;
    this.evaluationControl = new FormControl(skill.averageEvaluate, [Validators.required, Validators.min(0), Validators.max(5)]);
  }

  cancelEvaluation(): void {
    this.evaluateSkill = '';
  }

  canSaveEvaluation(): boolean {
    return this.evaluationControl.dirty && this.evaluationControl.valid;
  }

  saveEvaluate(): void {

  }

  // SKILLS

  addSkill(): void {
    this.newSkillMode = true;
  }

  undoAdd(): void {
    this.newSkillMode = false;
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
            this._isCreateNewSkill = false;
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

  //AUTOCOMPLETE

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
          return option.name.toLowerCase().includes(value.toLowerCase());
          // return option.name.toLowerCase().indexOf(value.toLowerCase()) === 0;
          // return option.name;
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
