import { Component, OnInit, OnDestroy, Input, OnChanges, ChangeDetectorRef } from '@angular/core';
import { User } from 'src/app/_models/user';
import { Subscription, Subject, of, Observable, scheduled, queueScheduler } from 'rxjs';
import { AuthenticationService } from '../services/authentication.service';
import { UserViewModel } from 'src/app/_models/user-view-model';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { SkillToSend } from 'src/app/_models/skill-to-send';
import { MatTableDataSource, MatSnackBar } from '@angular/material';
import { takeUntil, switchMap, concatAll, distinctUntilChanged, debounceTime, map, exhaustMap } from 'rxjs/operators';
import { Skill } from 'src/app/_models/skill';

const emptySkills: Observable<Skill[]> = of([]);

@Component({
  selector: 'app-personal-page',
  templateUrl: './personal-page.component.html',
  styleUrls: ['./personal-page.component.css']
})
export class PersonalPageComponent implements OnInit, OnDestroy {

  inputUser: UserViewModel;
  currentUser: User | null;
  currentUserSubscription: Subscription;


  private readonly positionExpenseAutocomplete: WeakMap<FormGroup, Observable<Skill[]>> =
    new WeakMap<FormGroup, Observable<Skill[]>>();

  private readonly emptySkill = {
    name: '',
  };

  private readonly _destroyed$ = new Subject<void>();
  readonly dataSource: MatTableDataSource<FormGroup> = new MatTableDataSource([]);
  skillsFormArray: FormArray;
  dataForm: FormGroup;
  isLoading = true;

  constructor(
    private authenticate: AuthenticationService,
    private route: Router,
    private acivatedRoute: ActivatedRoute,
    private service: UserService,
    private formBuilder: FormBuilder,
    private detector: ChangeDetectorRef,
    private snackBar: MatSnackBar
  ) {
    this.skillsFormArray = this.formBuilder.array([]);
    this.dataForm = this.formBuilder.group({
      skills: this.skillsFormArray
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
        this.skillsFormArray.clear();

        if (!skills) {
          this.dataSource.data = [];
          return;
        }
        const currentUserSkills = false;
        skills
          .map(skill => this.createFormGroupSkill(skill))
          .forEach(el => {
            this.skillsFormArray.push(el);
            if (currentUserSkills) {
              el.enable();
            } else {
              el.disable();
            }
          });
        this.updateDataSource();
        this.detector.markForCheck();
      },
        err => this.showMessage(err),
        () => this.isLoading = false
      );
  }

  ngOnInit() { }

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
      skill: this.formBuilder.control(skill.averageAssessment)
    });
  }

  private updateDataSource(): void {
    this.dataSource.data = this.skillsFormArray.controls.slice() as FormGroup[];
  }

  private showMessage(msg: any): void {
    this.snackBar.open(msg, undefined, { duration: 2000 });
  }

  /**
   * Последовательность автоподстановки для контрола затрат по должности
   * @param skillControl FrormGroup затрат по одной должности
   */
  getAutocompletePositions(skillControl: FormGroup): Observable<Skill[]> {
    // console.log('getAutocompletePositions called. positionExpenseControl:', positionExpenseControl);

    if (!skillControl) {
      return emptySkills;
    }

    const positionControl = skillControl.get('name') as FormControl;

    if (!positionControl) {
      return emptySkills;
    }

    const exist = this.positionExpenseAutocomplete.get(skillControl);

    if (exist) {
      return exist;
    }

    const autoComplete = scheduled([[positionControl.value], positionControl.valueChanges], queueScheduler).pipe(
      concatAll(),
      distinctUntilChanged(this.positionOrTextComparer),
      debounceTime(250),
      map(value => {
        if (typeof value === 'string') {
          return this.service.autocompleSkill(value);
        }

        if (value === this.emptySkill) {
          return emptySkills;
        }

        return of(<Skill[]>[value as Skill]);
      }),
      exhaustMap(x => x)
    );

    // console.log('getAutocompletePositions autoComplete created');
    this.positionExpenseAutocomplete.set(skillControl, autoComplete);

    return autoComplete;
  }

  private positionOrTextComparer(x: string, y: string): boolean {
    // console.log('positionOrTextComparer x ', x, '; y:', y);
    if (x === y) {
      // console.log('positionOrTextComparer return 1 true');
      return true;
    }

    const xIsString = typeof x === 'string';
    const yIsString = typeof y === 'string';

    if (xIsString && yIsString) {
      // console.log('positionOrTextComparer (xIsString && yIsString)');
      return x === y;
    }
  }
}
