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
      imports: [
        BrowserAnimationsModule, MaterialModule, ReactiveFormsModule,
        HttpClientTestingModule, MatIconModule,
        RouterTestingModule]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SkillsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
