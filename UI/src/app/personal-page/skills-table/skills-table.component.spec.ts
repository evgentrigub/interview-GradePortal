import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SkillsTableComponent } from './skills-table.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from 'src/app/material-module';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatIconModule } from '@angular/material';
import { RouterTestingModule } from '@angular/router/testing';

describe('SkillsTableComponent', () => {
  let component: SkillsTableComponent;
  let fixture: ComponentFixture<SkillsTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SkillsTableComponent],
      imports: [BrowserAnimationsModule, MaterialModule, ReactiveFormsModule, HttpClientTestingModule, MatIconModule, RouterTestingModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SkillsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show skill table', () => {
    const a = ''
    expect(a).toBe('No test')
  });

  it('should change view to edit mode for creating new skill', () => {
    const a = ''
    expect(a).toBe('No test')
  });

  it('should change view to edit mode for evaluation skill', () => {
    const a = ''
    expect(a).toBe('No test')
  });

  it('should cancel all changes in edit mode', () => {
    const a = ''
    expect(a).toBe('No test')
  });

  it('should check validation for creating new skill or evaluation', () => {
    const a = ''
    expect(a).toBe('No test')
  });

  it('should save new creating skill', () => {
    const a = ''
    expect(a).toBe('No test')
  });

  it('should save new evaluation', () => {
    const a = ''
    expect(a).toBe('No test')
  });

  it('should get skill object from autocomplete event', () => {
    const a = ''
    expect(a).toBe('No test')
  });

});
