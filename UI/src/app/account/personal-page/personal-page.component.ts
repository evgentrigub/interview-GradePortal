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
  styleUrls: ['./personal-page.component.css']
})
export class PersonalPageComponent implements OnInit, OnDestroy {

  inputUser: UserViewModel;
  currentUser: User | null;
  currentUserSubscription: Subscription;

  isCreateMode = false;
  // private readonly positionExpenseAutocomplete: WeakMap<FormGroup, Observable<Skill[]>> =
  //   new WeakMap<FormGroup, Observable<Skill[]>>();

  nameSkillOptions: Observable<Skill[]>;
  skillNameControl: FormControl = new FormControl();
  skillDescControl: FormControl = new FormControl();

  private readonly _destroyed$ = new Subject<void>();
  displayedColumns = ['action', 'name', 'description']
  // readonly dataSource: MatTableDataSource<FormGroup> = new MatTableDataSource([]);
  dataSource: MatTableDataSource<Skill>;
  skillFormGroup: FormGroup;
  isLoading = true;
  sub: Subscription;

  private readonly emptySkill: Skill = {
    name: '',
    description: '',
    averageAssessment: 0
  };

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

    this.skillFormGroup = this.formBuilder.group({
      name: this.skillNameControl,
      description: this.skillDescControl
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
        takeUntil(this._destroyed$)
      )
      .subscribe((skills: Skill[]) => {

        if (!skills) {
          this.dataSource.data = [];
          return;
        }

        this.dataSource = new MatTableDataSource(skills)
        // const currentUserSkills = true;
        // skills
        //   .map(skill => this.createFormGroupSkill(skill))
        //   .forEach(el => {
        //     this.skillsFormArray.push(el);
        //     if (currentUserSkills) {
        //       el.enable();
        //     } else {
        //       el.disable();
        //     }
        //   });
        // this.updateDataSource()
        this.detector.markForCheck();
      },
        err => this.showMessage(err),
        () => this.isLoading = false
      );
  }

  ngOnInit() {
    this.nameSkillOptions = this.getAutocompleteSkills();
  }

  getAutocompleteSkills(): Observable<Skill[]> {
    const a = this.skillNameControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(value => {
        const options = this.filterData(value || '')
        return options;
      })
    );
    return a;
  }

  ngOnDestroy(): void {
    this._destroyed$.next();
    this._destroyed$.complete();
  }

  addSkill(): void {
    this.isCreateMode = true;
    this.createFormGroupSkill({ name: 'aaaa', description: '', averageAssessment: 0 } as Skill);
  }

  undoAdd(): void {
    this.isCreateMode = false;
    this.skillFormGroup.reset();
  }

  saveSkill(): void {
    const group = this.skillFormGroup;
    if (!group) {
      return;
    }
    const skillToSend = group.value as SkillToSend;

    this.skillService.saveUserSkill(this.currentUser.id, skillToSend)
      .pipe(
        tap(skill => {
          this.showMessage(`New skill ${skill.name} saved successfully!`);
          this.isCreateMode = false;
          this.skillFormGroup.reset();
          this.dataSource.data.push(skill);
          this.detector.markForCheck();
        },
          err => this.showMessage(err)
        )
      ).subscribe();

  }

  canSave(): boolean {
    return this.skillFormGroup.dirty && this.skillFormGroup.valid;
  }

  createFormGroupSkill(skill: Skill) {
    return this.formBuilder.group({
      name: this.formBuilder.control(skill.name, [Validators.required, Validators.minLength(1)]),
      description: this.formBuilder.control(skill.description, [Validators.required, Validators.minLength(5)]),
      average: this.formBuilder.control(skill.averageAssessment)
    });
  }

  getEvent(event: MatAutocompleteSelectedEvent): void {
    const skill = event.option.value as Skill;
    if (!skill) {
      return;
    }
    this.skillDescControl.setValue(skill.description);
    this.skillDescControl.markAsDirty();

    this.skillNameControl.setValue(skill.name);
    this.skillNameControl.markAsDirty();

    this.detector.markForCheck();
  }

  skillDisplay(skill?: Skill): string | null {

    if (!skill) {
      return null;
    }
    if (skill === this.emptySkill) {
      return null;
    }
    return skill.name;
  }

  private filterData(value: any): Observable<Skill[]> {
    if (!value) {
      const a: Skill[] = []
      return of(a);
    }

    const b = this.skillService.getAutocompleteSkills(value)
      .pipe(
        map((response) => response.filter((option: Skill) => {
          const c = option.name.toLowerCase().indexOf(value.toLowerCase()) === 0
          return c;
        })),
      );
    return b;

  }

  private textComparer(x: Skill, y: Skill): boolean {
    return x.name === y.name && x.description === y.description;
  }


  private showMessage(msg: any): void {
    this.snackBar.open(msg, undefined, { duration: 2000 });
  }

}
