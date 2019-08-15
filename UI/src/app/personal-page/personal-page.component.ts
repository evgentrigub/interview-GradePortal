import { Component, OnInit, OnDestroy, ChangeDetectorRef, ViewChild } from '@angular/core';
import { User } from 'src/app/_models/user';
import { Subscription, Subject, of, Observable, concat, forkJoin } from 'rxjs';
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
import { EvaluationToSend } from '../_models/evaluation-to-send';

function reloadComponent() {
  return false;
}

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

  get evaluatedSkill(): string {
    return this._evaluateSkillId;
  }
  set evaluatedSkill(skillId: string) {
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
  private currentUser: User | null;
  private currentUserSubscription: Subscription;

  private userFormGroup: FormGroup;
  private previosUserDataState: UserData;
  nameSkillOptions: Observable<SkillViewModel[]>;
  displayedColumns: string[] = [];
  dataSource: MatTableDataSource<SkillViewModel>;

  readonly newSkillFormGroup: FormGroup;
  private newSkillNameControl: FormControl = new FormControl();
  private lastAutoCompleteValue = '';

  private routeUsername = '';
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
    this.router.routeReuseStrategy.shouldReuseRoute = reloadComponent;

    this.userFormGroup = this.formBuilder.group({});
    this.newSkillNameControl = this.formBuilder.control('', [Validators.required, Validators.minLength(1)]);
    this.newSkillFormGroup = this.formBuilder.group({
      id: this.formBuilder.control(null),
      name: this.newSkillNameControl,
      description: this.formBuilder.control('', [Validators.required, Validators.minLength(5)]),
      averageEvaluate: this.formBuilder.control(0),
      expertEvaluate: this.formBuilder.control(0)
    });

    this.routeUsername = this.route.snapshot.paramMap.get('username') as string;
    this.currentUserSubscription = this.authenticate.currentUser
      .pipe(
        switchMap(user => {
          this.currentUser = user ? user : null;
          if (this.routeUsername) {
            this.pageOwner = (user && user.username === this.routeUsername) ? true : false;
            this.displayedColumns = this.pageOwner ?
              ['action', 'name', 'description', 'rating'] :
              ['action', 'name', 'description', 'rating', 'expertValue'];
            const userByRoute$: Observable<UserData | null> =
              this.routeUsername ? this.userService.getByUsername(this.routeUsername) : of(null);
            const skills$: Observable<SkillViewModel[] | null> =
              this.routeUsername ? this.skillService.getUserSkills(this.routeUsername, this.currentUser.id) : of(null);
            return forkJoin(userByRoute$, skills$);
          } else {
            return of(null);
          }
        })
      )
      .subscribe(
        data => {
          const userData = data[0];
          const skills = data[1];

          if (!data && !userData && !skills) {
            this.dataSource.data = [];
            return;
          }
          this.userFormGroup = this.createUserFormGroup(userData);
          this.dataSource = new MatTableDataSource(skills);
          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
          this.detector.markForCheck();
          this.isLoading = false;
        },
        err => this.showMessage(err)
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
            this.userFormGroup.markAsPristine();
            this.detector.markForCheck();
          },
          err => this.showMessage(err)
        )
      )
      .subscribe();
  }

  // EVALUATION

  addEvaluation(skill: SkillViewModel): void {
    this.evaluatedSkill = skill.id;
    this.evaluationControl = new FormControl(skill.expertEvaluate, [Validators.required, Validators.min(0), Validators.max(5)]);
  }

  cancelEvaluation(): void {
    this.evaluatedSkill = '';
  }

  canSaveEvaluation(): boolean {
    return this.evaluationControl.dirty && this.evaluationControl.valid;
  }

  saveEvaluate(skill: SkillViewModel): void {
    const evaluateControl = this.evaluationControl;
    if (!evaluateControl) {
      return;
    }

    const group = this.userFormGroup;
    if (!group) {
      return;
    }
    const userData = this.userFormGroup.value as UserData;

    const evaluation: EvaluationToSend = {
      userId: userData.id,
      skillId: skill.id,
      expertId: this.currentUser.id,
      value: evaluateControl.value
    };

    this.skillService.addEvaluation(evaluation)
      .pipe(
        tap(
          _ => {
            this.showMessage(`You rated skill at ${evaluateControl.value} points`);
            this.evaluatedSkill = '';
            this.updateSkillsDataSource();
            this.detector.markForCheck();
          },
          err => this.showMessage(err)
        )
      )
      .subscribe();
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
            this.updateSkillsDataSource();
            this.detector.markForCheck();
          },
          err => this.showMessage(err)
        )
      )
      .subscribe();
  }

  // AUTOCOMPLETE

  setAutocompleteEvent(event: MatAutocompleteSelectedEvent): void {
    const skill = event.option.value as SkillToSend;
    console.log(skill);

    if (!skill) {
      return;
    }
    this.lastAutoCompleteValue = skill.name;

    this.newSkillFormGroup.setValue(skill);
    this.newSkillFormGroup.markAsDirty();

    this.detector.markForCheck();
  }

  private updateSkillsDataSource(): void {
    this.skillService.getUserSkills(this.routeUsername, this.currentUser.id)
      .subscribe(res => {
        if (res) { this.dataSource.data = res; }
      });
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
