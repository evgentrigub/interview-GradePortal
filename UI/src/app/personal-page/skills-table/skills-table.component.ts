import { Component, OnInit, ChangeDetectorRef, Input, OnChanges, ViewChild } from '@angular/core';
import { EditBaseComponent } from 'src/app/edit-base/edit-base-component';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { SkillService } from 'src/app/_services/skill.service';
import { SkillToSend } from 'src/app/_models/skill-to-send';
import { tap, startWith, debounceTime, distinctUntilChanged, switchMap, map } from 'rxjs/operators';
import { MatSnackBar, MatTableDataSource, MatAutocompleteSelectedEvent, MatPaginator, MatSort } from '@angular/material';
import { SkillViewModel } from 'src/app/_models/skill-view-model';
import { Observable, of } from 'rxjs';
import { EvaluationToSend } from 'src/app/_models/evaluation-to-send';
import { Result } from 'src/app/_models/result-model';

@Component({
  selector: 'app-skills-table',
  templateUrl: './skills-table.component.html',
  styleUrls: ['./skills-table.component.css']
})
export class SkillsTableComponent extends EditBaseComponent implements OnInit, OnChanges {

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  @Input()
  userSkillsResult: Result<SkillViewModel[]>;

  @Input()
  displayedColumns: string[];

  @Input()
  routeUsername: string;

  @Input()
  pageOwner: boolean;

  @Input()
  userId: string;

  get isSkillExisted(): boolean {
    if (!this.newSkillNameControl) {
      return false;
    }
    const skillName = this.newSkillNameControl.value;
    return this.lastAutoCompleteValue === skillName ? true : false;
  }

  get evaluatedSkill(): string {
    return this.evaluateSkillId;
  }
  set evaluatedSkill(skillId: string) {
    this.evaluateSkillId = skillId;
  }

  evaluationControl: FormControl;
  private evaluateSkillId = '';
  readonly newSkillFormGroup: FormGroup;
  private newSkillNameControl: FormControl = new FormControl();
  private lastAutoCompleteValue = '';
  nameSkillOptions: Observable<SkillViewModel[]>;
  dataSource: MatTableDataSource<SkillViewModel>;
  private isLoading = true;

  constructor(
    private skillService: SkillService,
    private formBuilder: FormBuilder,
    private detector: ChangeDetectorRef,
    private snackBar: MatSnackBar
  ) {
    super();
    this.newSkillNameControl = this.formBuilder.control('', [Validators.required, Validators.minLength(1)]);
    this.newSkillFormGroup = this.formBuilder.group({
      id: [null],
      name: this.newSkillNameControl,
      description: ['', [Validators.required, Validators.minLength(5)]],
      averageEvaluate: [0],
      expertEvaluate: [0],
    });
  }

  ngOnInit() {
    this.nameSkillOptions = this.getAutocompleteSkills();
  }

  ngOnChanges(changes: import('@angular/core').SimpleChanges): void {
    if (changes.hasOwnProperty('userSkillsResult')) {
      const chg = changes.userSkillsResult;
      const result = chg.currentValue as Result<SkillViewModel[]>;
      if (!result) {
        return;
      }
      this.dataSource = new MatTableDataSource(result.data);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
      this.detector.markForCheck();
      this.isLoading = false;
    }
  }

  protected Edit(groupNum: number, skill: SkillViewModel): void {
    switch (groupNum) {
      case (1):
        this.isEditMode = true;
        break;

      case (2):
        this.evaluatedSkill = skill.id;
        this.evaluationControl = new FormControl(skill.expertEvaluate, [Validators.required, Validators.min(0), Validators.max(5)]);
        break;
    }
  }
  protected CancelEdit(groupNum: number): void {
    switch (groupNum) {
      case (1):
        this.isEditMode = false;
        this.newSkillFormGroup.reset();
        break;

      case (2):
        this.evaluatedSkill = '';
        break;
    }
  }

  protected CanSave(groupNum: number): boolean {
    switch (groupNum) {
      case (1):
        return this.newSkillFormGroup.dirty && this.newSkillFormGroup.valid;

      case (2):
        return this.evaluationControl.dirty && this.evaluationControl.valid;
    }
  }
  protected Save(groupNum: number, skill: SkillViewModel): void {
    switch (groupNum) {
      case (1):
        const group = this.newSkillFormGroup;
        if (!group) {
          return;
        }
        const skillToSave = group.value as SkillToSend;

        this.skillService
          .addOrCreateSkill(this.currentUser.id, skillToSave)
          .pipe(
            tap(
              newSkill => {
                this.showMessage(`New skill ${newSkill.name} saved successfully!`);
                this.isEditMode = false;
                this.newSkillFormGroup.reset();
                this.updateSkillsDataSource();
                this.detector.markForCheck();
              },
              err => this.showMessage(err)
            )
          )
          .subscribe();
        break;

      case (2):
        const evaluateControl = this.evaluationControl;
        if (!evaluateControl) {
          return;
        }

        const evaluation: EvaluationToSend = {
          userId: this.userId,
          skillId: skill.id,
          expertId: this.currentUser.id,
          value: evaluateControl.value,
        };

        this.skillService
          .addEvaluation(evaluation)
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
        break;
    }
  }

  setAutocompleteEvent(event: MatAutocompleteSelectedEvent): void {
    const skill = event.option.value as SkillToSend;

    if (!skill) {
      return;
    }
    this.lastAutoCompleteValue = skill.name;

    this.newSkillFormGroup.setValue(skill);
    this.newSkillFormGroup.markAsDirty();

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
          return option.name.toLowerCase().includes(value.toLowerCase());
          // return option.name.toLowerCase().indexOf(value.toLowerCase()) === 0;
          // return option.name;
        })
      )
    );
  }

  updateSkillsDataSource(): void {
    this.skillService.getUserSkills(this.routeUsername, this.currentUser.id).subscribe(res => {
      if (res.isSuccess) {
        this.dataSource.data = res.data;
      }
    });
  }

  private showMessage(msg: any): void {
    this.snackBar.open(msg, 'ok');
  }

}
