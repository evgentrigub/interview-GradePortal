import { Component, OnInit, ChangeDetectorRef, Input, OnChanges, ViewChild, AfterViewInit } from '@angular/core';
import { EditBaseComponent, ActionType } from 'src/app/edit-base/edit-base-component';
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
  styleUrls: ['./skills-table.component.css'],
})
export class SkillsTableComponent extends EditBaseComponent implements OnInit, OnChanges {
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  @Input()
  userSkillsResult: Result<SkillViewModel[]>;

  @Input()
  displayedColumns: string[];

  @Input()
  pageOwner: boolean;

  @Input()
  userId: string;

  get isSkillExisted(): boolean {
    if (!this.newSkillNameControl) {
      return false;
    }
    const skillName = this.newSkillNameControl.value as string;
    return this.lastAutoCompleteValue === skillName.trim() ? true : false;
  }

  get evaluatedSkill(): string {
    return this.evaluateSkillId;
  }
  set evaluatedSkill(skillId: string) {
    this.evaluateSkillId = skillId;
  }

  private evaluateSkillId = '';
  readonly newSkillFormGroup: FormGroup;
  private newSkillNameControl: FormControl = new FormControl();
  private lastAutoCompleteValue = '';

  evaluationControl: FormControl;
  nameSkillOptions: Observable<SkillViewModel[]>;
  dataSource: MatTableDataSource<SkillViewModel>;
  isLoading: boolean;

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
      this.isLoading = true;
      const chg = changes.userSkillsResult;
      const result = chg.currentValue as Result<SkillViewModel[]>;
      if (!result) {
        return;
      }

      this.dataSource = new MatTableDataSource(result.data);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
      for (let i = 0; i < this.dataSource.data.length; i++) {
        const el = this.dataSource.data[i];
        el.num = i + 1 + this.paginator.pageIndex * this.paginator.pageSize;
      }
      this.detector.markForCheck();
      this.isLoading = false;
    }
  }

  /**
   * @param groupNum switch case 1)add new skill; 2)evaluate skill
   * @param skill skill model for evaluation
   */
  protected Edit(type: ActionType, skill: SkillViewModel): void {
    switch (type) {
      case 'create skill':
        this.isEditMode = true;
        break;

      case 'add evaluation':
        this.evaluatedSkill = skill.id;
        this.evaluationControl = new FormControl(skill.expertEvaluate, [Validators.required, Validators.min(0), Validators.max(5)]);
        break;
    }
  }

  /**
   * @param groupNum switch case 1)add new skill; 2)evaluate skill
   */
  protected CancelEdit(type: ActionType): void {
    switch (type) {
      case 'create skill':
        this.isEditMode = false;
        this.newSkillFormGroup.reset();
        break;

      case 'add evaluation':
        this.evaluatedSkill = '';
        break;
    }
  }

  /**
   * @param groupNum switch case 1)add new skill; 2)evaluate skill
   */
  protected CanSave(type: ActionType): boolean {
    switch (type) {
      case 'create skill':
        return this.newSkillFormGroup.dirty && this.newSkillFormGroup.valid;

      case 'add evaluation':
        return this.evaluationControl.dirty && this.evaluationControl.valid;
    }
  }

  /**
   * @param groupNum switch case 1)add new skill; 2)evaluate skill
   * @param skill skill model for evaluation
   */
  protected Save(type: ActionType, skill: SkillViewModel): void {
    switch (type) {
      case 'create skill':
        const group = this.newSkillFormGroup;
        if (!group) {
          return;
        }
        const skillToSave = group.value as SkillToSend;

        this.skillService
          .addOrCreateSkill(this.currentUser.id, skillToSave)
          .pipe(
            tap(
              result => {
                if (result.isSuccess) {
                  this.showMessage(result.message);
                  this.isEditMode = false;
                  this.newSkillFormGroup.reset();
                  this.updateSkillsDataSource(this.userId, this.currentUser.id);
                  this.detector.markForCheck();
                }
              },
              err => this.showMessage(err)
            )
          )
          .subscribe();
        break;

      case 'add evaluation':
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

        const a = this.skillService.addEvaluation(evaluation);
        a.pipe(
          tap(
            _ => {
              this.showMessage(`You rated skill at ${evaluateControl.value} points`);
              this.evaluatedSkill = '';
              this.updateSkillsDataSource(this.userId, this.currentUser.id);
              this.detector.markForCheck();
            },
            err => this.showMessage(err)
          )
        ).subscribe();
        break;
    }
  }

  /**
   * Set all skill model from option.
   * Includes skill description and id.
   * @param event option from autocomplete
   */
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

  /**
   * Return autocomplete options after each change in skill name input.
   */
  private getAutocompleteSkills(): Observable<SkillViewModel[]> {
    const a = this.newSkillNameControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(value => {
        const options = this.filterData(value || '');
        return options;
      })
    );

    return a;
  }

  private filterData(value: any): Observable<SkillViewModel[]> {
    if (!value) {
      return of([]);
    }

    return this.skillService.getAutocompleteSkills(value).pipe(
      map(response =>
        response.filter((option: SkillViewModel) => {
          return option.name.toLowerCase().includes(value.toLowerCase());
        })
      )
    );
  }

  /**
   * Update skills table datasource.
   */
  private updateSkillsDataSource(userId: string, currentUserId: string): void {
    this.skillService.getUserSkills(userId, currentUserId).subscribe(res => {
      if (res.isSuccess) {
        this.dataSource.data = res.data;
      }
    });
  }

  private showMessage(msg: any): void {
    this.snackBar.open(msg, 'ok');
  }
}
