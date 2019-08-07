import { Component, OnInit, OnDestroy, Input, OnChanges, ChangeDetectorRef } from '@angular/core';
import { User } from 'src/app/_models/user';
import { Subscription, Subject, of, Observable, scheduled, queueScheduler } from 'rxjs';
import { AuthenticationService } from '../services/authentication.service';
import { UserViewModel } from 'src/app/_models/user-view-model';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { SkillToSend } from 'src/app/_models/skill-to-send';
import { MatTableDataSource, MatSnackBar, MatAutocompleteSelectedEvent } from '@angular/material';
import { takeUntil, switchMap, concatAll, distinctUntilChanged, debounceTime, map, exhaustMap, startWith, tap } from 'rxjs/operators';
import { Skill } from 'src/app/_models/skill';
import { SkillService } from '../services/skill.service';

const emptySkills: Observable<string[]> = of([]);

@Component({
  selector: 'app-personal-page',
  templateUrl: './personal-page.component.html',
  styleUrls: ['./personal-page.component.css'],
})
export class PersonalPageComponent implements OnInit, OnDestroy {
  get isSkillExisted(): boolean {
    if (!this.newSkillNameControl) {
      return false;
    }
    const skillName = this.newSkillNameControl.value;
    return this.lastAutoCompleteValue === skillName ? true : false;
  }

  inputUser: UserViewModel;
  currentUser: User | null;
  currentUserSubscription: Subscription;

  isCreateMode = false;

  nameSkillOptions: Observable<Skill[]>;

  newSkillIdControl: FormControl = new FormControl();
  newSkillNameControl: FormControl = new FormControl();
  newSkillDescControl: FormControl = new FormControl();

  lastAutoCompleteValue = '';

  private readonly destroyed$ = new Subject<void>();
  displayedColumns = ['action', 'name', 'description'];

  dataSource: MatTableDataSource<Skill>;
  skillFormGroup: FormGroup;
  isLoading = true;

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
    this.newSkillIdControl = this.formBuilder.control('');
    this.newSkillNameControl = this.formBuilder.control('', [Validators.required, Validators.minLength(1)]);
    this.newSkillDescControl = this.formBuilder.control('', [Validators.required, Validators.minLength(5)]);

    this.skillFormGroup = this.formBuilder.group({
      id: this.newSkillIdControl,
      name: this.newSkillNameControl,
      description: this.newSkillDescControl,
    });

    const navigation = this.route.getCurrentNavigation();
    this.inputUser = navigation.extras.state ? navigation.extras.state.user : null;

    this.currentUserSubscription = this.authenticate.currentUser
      .pipe(
        switchMap(user => {
          if (user) {
            this.currentUser = user ? user : null;
            return this.skillService.getUserSkills(user.id);
          }
          return of(null);
        }),
        takeUntil(this.destroyed$)
      )
      .subscribe(
        (skills: Skill[]) => {
          if (!skills) {
            this.dataSource.data = [];
            return;
          }

          this.dataSource = new MatTableDataSource(skills);
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
    const skillToSave = group.value as Skill;
    console.log('TCL: PersonalPageComponent -> skillToSave', skillToSave);

    if (this.isSkillExisted) {
      console.log('save exist skill');
      this.skillService
        .addSkillToUser(this.currentUser.id, skillToSave)
        .pipe(
          tap(
            skill => {
              this.showMessage(`New skill ${skill.name} saved successfully!`);
              this.isCreateMode = false;
              this.skillFormGroup.reset();

              this.dataSource.data.push(skill);
              this.dataSource = new MatTableDataSource(this.dataSource.data);
              console.log('TCL: PersonalPageComponent -> this.dataSource.data', this.dataSource.data);
              this.detector.markForCheck();
            },
            err => this.showMessage(err)
          )
        )
        .subscribe();
    } else {
      console.log('save new skill');
      // TO-DO
    }
  }

  setAutocompleteEvent(event: MatAutocompleteSelectedEvent): void {
    const skill = event.option.value as Skill;
    if (!skill) {
      return;
    }
    this.lastAutoCompleteValue = skill.name;

    this.newSkillIdControl.setValue(skill.id);
    this.newSkillDescControl.setValue(skill.description);
    this.newSkillNameControl.setValue(skill.name);
    this.skillFormGroup.markAsDirty();

    this.detector.markForCheck();
  }

  private getAutocompleteSkills(): Observable<Skill[]> {
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

  private filterData(value: any): Observable<Skill[]> {
    if (!value) {
      return of([]);
    }

    return this.skillService.getAutocompleteSkills(value).pipe(
      map(response =>
        response.filter((option: Skill) => {
          return option.name.toLowerCase().indexOf(value.toLowerCase()) === 0;
        })
      )
    );
  }

  private showMessage(msg: any): void {
    this.snackBar.open(msg, undefined, { duration: 2000 });
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
