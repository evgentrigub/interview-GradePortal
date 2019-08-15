import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonalPageComponent } from './personal-page.component';
import { MatCardModule, MatFormFieldModule, MatInputModule, MatTableModule, MatIconModule, MatButtonModule, MatPaginatorModule, MatAutocompleteModule, MatProgressSpinnerModule, MatSnackBarModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';

describe('PersonalPageComponent', () => {
  let component: PersonalPageComponent;
  let fixture: ComponentFixture<PersonalPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PersonalPageComponent],
      imports: [
        BrowserAnimationsModule,
        HttpClientTestingModule,
        ReactiveFormsModule,
        RouterTestingModule,
        MatSnackBarModule,
        MatProgressSpinnerModule,
        MatAutocompleteModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatTableModule,
        MatIconModule,
        MatButtonModule,
        MatPaginatorModule
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PersonalPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
