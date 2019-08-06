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
import { takeUntil, switchMap, concatAll, distinctUntilChanged, debounceTime, map, exhaustMap, startWith } from 'rxjs/operators';
import { Skill } from 'src/app/_models/skill';

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

  // private readonly positionExpenseAutocomplete: WeakMap<FormGroup, Observable<Skill[]>> =
  //   new WeakMap<FormGroup, Observable<Skill[]>>();

  nameSkillOptions: Observable<Skill[]>;
  skillNameControl = new FormControl();
  skillDescControl = new FormControl();

  private readonly _destroyed$ = new Subject<void>();
  displayedColumns = ['action', 'name', 'description']
  // readonly dataSource: MatTableDataSource<FormGroup> = new MatTableDataSource([]);
  dataSource: MatTableDataSource<Skill>;
  skillGroupForm: FormGroup;
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
    private service: UserService,
    private formBuilder: FormBuilder,
    private detector: ChangeDetectorRef,
    private snackBar: MatSnackBar
  ) {

    this.skillGroupForm = this.formBuilder.group({
      name: this.skillNameControl,
      description: this.skillDescControl
    });

    const navigation = this.route.getCurrentNavigation();
    this.inputUser = navigation.extras.state ? navigation.extras.state.user : null;

    this.currentUserSubscription = this.authenticate.currentUser
      .pipe(switchMap(user => {
        if (user) {
          this.currentUser = user ? user : null;
          return this.service.getUserSkills(user.id);
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
    this.nameSkillOptions = this.skillNameControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      switchMap(value => this.filterData(value))
    )
  }

  ngOnDestroy(): void {
    this._destroyed$.next();
    this._destroyed$.complete();
  }

  addSkill(): void {
    this.createFormGroupSkill({ name: '', description: '', averageAssessment: 0 } as Skill);
  }

  createFormGroupSkill(skill: Skill) {
    return this.formBuilder.group({
      name: this.formBuilder.control(skill.name, [Validators.required, Validators.minLength(1)]),
      description: this.formBuilder.control(skill.description, [Validators.required, Validators.minLength(5)]),
      average: this.formBuilder.control(skill.averageAssessment)
    });
  }

  getEvent(event: MatAutocompleteSelectedEvent): void {
    console.log(event.option.value);
    const skill = event.option.value as Skill;
    if (!skill) {
      return;
    }
    this.skillDescControl.setValue(skill.description);
    this.detector.markForCheck();
    console.log(this.skillGroupForm.value);
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
  // private updateDataSource(): void {
  //   this.dataSource.data = this.skillsFormArray.controls.slice() as FormGroup[];
  //   console.log("TCL: PersonalPageComponent -> this.skillsFormArray.controls", this.dataSource.data)
  // }

  // getAutocompleteSkills(): Observable<string[]> {

  // if (!skillGroup) {
  //   return emptySkills;
  // }

  // const autoComplete = scheduled([[positionControl.value], positionControl.valueChanges], queueScheduler).pipe(
  //   concatAll(),
  //   distinctUntilChanged(this.positionOrTextComparer),
  //   debounceTime(250),
  //   map(value => {
  //     if (typeof value === 'string') {
  //       return this.service.getAutocompleteSkills(value);
  //     }

  //     if (value === this.emptySkill) {
  //       return emptySkills;
  //     }

  //     return of(<Skill[]>[value as Skill]);
  //   }),
  //   exhaustMap(x => x)
  // );

  //   return autoComplete;
  // }

  private filterData(value: string) {
    const obj = { name: 'Back-end', description: 'bbbbbbbbbbbbbbbb' } as Skill;
    const optionsObservable = of([obj]);
    const b = optionsObservable
      .pipe(
        map((response) => response.filter(option => {
          const c = option.name.toLowerCase().indexOf(value.toLowerCase()) === 0;
          return c;
        })),
      );
    return b;
  }

  private textComparer(x: string, y: string): boolean {
    if (x === y) {
      return true;
    }

    const xIsString = typeof x === 'string';
    const yIsString = typeof y === 'string';

    if (xIsString && yIsString) {
      return x === y;
    }
  }


  private showMessage(msg: any): void {
    this.snackBar.open(msg, undefined, { duration: 2000 });
  }

}
