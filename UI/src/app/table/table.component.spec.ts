import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TableComponent } from './table.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { MatSnackBarModule, MatProgressSpinnerModule, MatTableModule, MatCardModule, MatPaginatorModule } from '@angular/material';
import { UserService } from '../_services/user.service';
import { UserData } from '../_models/user-view-model';
import { of } from 'rxjs';

// tslint:disable: no-use-before-declare
describe('TableComponent', () => {
  let component: TableComponent;
  let fixture: ComponentFixture<TableComponent>;
  let service: UserService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TableComponent],
      imports: [
        BrowserAnimationsModule,
        HttpClientTestingModule,
        ReactiveFormsModule,
        RouterTestingModule,
        MatSnackBarModule,
        MatProgressSpinnerModule,
        MatCardModule,
        MatTableModule,
        MatPaginatorModule,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TableComponent);
    service = TestBed.get(UserService);
    spyOn(service, 'getAll').and.returnValue(of(DATA));

    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

const DATA: UserData[] = [
  {
    num: 0,
    id: '1',
    firstName: 'Evgen',
    lastName: 'Trigubov',
    username: 'evgentrigub',
    city: 'Zelek',
    position: 'Dev',
  },
];
