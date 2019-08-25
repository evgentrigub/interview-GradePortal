import { SkillViewModel } from '../_models/skill-view-model';
import { Output, EventEmitter, Input } from '@angular/core';
import { User } from '../_models/user';

export abstract class EditBaseComponent {

  @Input()
  currentUser: User;

  public isEditMode: boolean;

  get editMode(): boolean {
    return this.isEditMode;
  }
  set editMode(isEdit: boolean) {
    this.isEditMode = isEdit;
  }

  protected abstract Edit(caseNum?: number, skill?: SkillViewModel): void;
  protected abstract CancelEdit(caseNum?: number): void;
  protected abstract CanSave(caseNum?: number): boolean;
  protected abstract Save(caseNum?: number, skill?: SkillViewModel): void;
}
