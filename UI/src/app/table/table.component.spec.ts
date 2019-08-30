import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { TableComponent } from './table.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { UserDataTable } from '../_models/user-view-model';
import { UserService } from '../_services/user.service';
import { of } from 'rxjs';
import { MaterialModule } from '../material-module';
import { SearchPanelComponent } from './search-panel/search-panel.component';
import { Result } from '../_models/result-model';
import { PageEvent } from '@angular/material';
import { PersonalPageComponent } from '../personal-page/personal-page.component';
import { UserDataComponent } from '../personal-page/user-data/user-data.component';
import { SkillsTableComponent } from '../personal-page/skills-table/skills-table.component';
import { Location } from '@angular/common';
import { SearchOptions } from '../_models/search-options';
import { SearchPanelService } from '../_services/search-panel.service';

// tslint:disable: no-use-before-declare

describe('TableComponent', () => {
  let component: TableComponent;
  let fixture: ComponentFixture<TableComponent>;
  let userService: UserService;
  let searchService: SearchPanelService;
  let location: Location;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TableComponent, SearchPanelComponent, PersonalPageComponent, UserDataComponent, SkillsTableComponent],
      providers: [UserService, SearchPanelService],
      imports: [
        BrowserAnimationsModule,
        MaterialModule,
        ReactiveFormsModule,
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([
          {
            path: 'dmitry',
            component: PersonalPageComponent,
          },
        ]),
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    userService = TestBed.get(UserService);
    searchService = TestBed.get(SearchPanelService);
    spyOn(userService, 'getUsersWithParams').and.returnValues(of(users), of(nextUsers));
    fixture = TestBed.createComponent(TableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display correct data', fakeAsync(() => {
    // assert

    tick();
    const tableRows = fixture.nativeElement.querySelectorAll('tr');
    const headerRow = tableRows[0];
    const row = tableRows[1];
    expect(tableRows.length).toBe(4);
    expect(headerRow.cells[0].innerHTML).toBe('Name');
    expect(headerRow.cells[1].innerHTML).toBe('City');
    expect(headerRow.cells[2].innerHTML).toBe('Position');
    expect(row.cells[0].innerHTML).toBe('Дмитрий Никитин');
  }));

  it('should return new page after click paginator', () => {
    // arrange
    const pagEmit: PageEvent = { pageIndex: 1, pageSize: 3, length: 3, previousPageIndex: 0 };

    // act
    component.paginator.page.emit(pagEmit);
    fixture.detectChanges();

    // assert
    const numbers: Array<string> = ['Дмитрий Никитин', 'Николай Петров', 'Алексей Андреев'];
    const tableRows = fixture.nativeElement.querySelectorAll('tr.table-row');
    for (const element of tableRows) {
      const num = element.cells[0].innerHTML;
      const res = numbers.find(r => {
        return r === num;
      });

      expect(res).toBe(num);
    }
  });

  it('should route by username after click table row', fakeAsync(() => {
    // arrange
    location = TestBed.get(Location);
    const tableRows = fixture.nativeElement.querySelectorAll('tr');
    const row = tableRows[1] as HTMLTableRowElement;

    // act
    row.click();
    fixture.detectChanges();
    tick();

    // assert
    expect(location.path()).toBe('/' + users.data.items[0].username);
  }));

  it('should get filtered params from search panel', () => {
    // arrange
    spyOn(searchService, 'getFilteredUsers').and.returnValues(of(filteredData));

    const searchOptions: SearchOptions = new SearchOptions();
    (searchOptions.pageIndex = 0),
      (searchOptions.pageSize = 3),
      (searchOptions.filter = [
        { key: 'name', value: 'evgen' },
        { key: 'city', value: '' },
        { key: 'pos', value: '' },
        { key: 'skill', value: '' },
      ]);

    // act
    component.setFilteredUsers(searchOptions);
    fixture.detectChanges();
    const row = fixture.nativeElement.querySelector('tr.table-row');

    // assert
    expect(row.cells[0].innerHTML).toBe('Evgen Trigubov');
  });
});

const users: Result<UserDataTable> = {
  message: '',
  isSuccess: true,
  data: {
    items: [
      {
        id: '7283243a-8866-41fe-98d6-635e5ac81709',
        firstName: 'Дмитрий',
        lastName: 'Никитин',
        username: 'dmitry',
        city: 'Москва',
        position: 'Ведущий разработчик',
      },
      {
        id: '28f86d27-d6de-4315-8a37-cf45bc90e870',
        firstName: 'Николай',
        lastName: 'Петров',
        username: 'petrov',
        city: 'Нижний Новгород',
        position: 'Менеджер по продажам',
      },
      {
        id: 'c5da8998-a1df-4e21-84bf-4ecbe9303adb',
        firstName: 'Алексей',
        lastName: 'Андреев',
        username: 'alexeyAndreev',
        city: 'Москва',
        position: 'Инвестор',
      },
    ],
    totalCount: 6,
  },
};

const nextUsers: Result<UserDataTable> = {
  message: '',
  isSuccess: true,
  data: {
    items: [
      {
        id: '7283243a-8866-41fe-98d6-635e5ac81709',
        firstName: 'Дмитрий',
        lastName: 'Никитин',
        username: 'dmitry',
        city: 'Москва',
        position: 'Ведущий разработчик',
      },
      {
        id: '28f86d27-d6de-4315-8a37-cf45bc90e870',
        firstName: 'Николай',
        lastName: 'Петров',
        username: 'petrov',
        city: 'Нижний Новгород',
        position: 'Менеджер по продажам',
      },
      {
        id: 'c5da8998-a1df-4e21-84bf-4ecbe9303adb',
        firstName: 'Алексей',
        lastName: 'Андреев',
        username: 'alexeyAndreev',
        city: 'Москва',
        position: 'Инвестор',
      },
    ],
    totalCount: 6,
  },
};

const filteredData: Result<UserDataTable> = {
  message: '',
  isSuccess: true,
  data: {
    items: [
      {
        id: '1',
        firstName: 'Evgen',
        lastName: 'Trigubov',
        username: 'evgentrigub',
        city: 'Zelek',
        position: 'Dev',
      },
    ],
    totalCount: 1,
  },
};
