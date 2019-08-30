import { SkillViewModel } from '../_models/skill-view-model';
import { Input } from '@angular/core';
import { User, UserAuthenticated } from '../_models/user';

export type ActionType = 'create skill' | 'add evaluation';

export abstract class EditBaseComponent {
  @Input()
  currentUser: UserAuthenticated;

  public isEditMode: boolean;

  get editMode(): boolean {
    return this.isEditMode;
  }
  set editMode(isEdit: boolean) {
    this.isEditMode = isEdit;
  }

  /**
   * Switch on the edit mode
   */
  protected abstract Edit(type?: ActionType, skill?: SkillViewModel): void;

  /**
   * Switch off the edit mode
   */
  protected abstract CancelEdit(type?: ActionType): void;

  /**
   * Check validation for save changes
   */
  protected abstract CanSave(type?: ActionType): boolean;

  /**
   * Save changes
   */
  protected abstract Save(type?: ActionType, skill?: SkillViewModel): void;
}
