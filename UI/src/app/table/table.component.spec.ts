import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TableComponent } from './table.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { MatSnackBarModule, MatProgressSpinnerModule, MatTableModule, MatCardModule, MatPaginatorModule } from '@angular/material';
import { UserData } from '../_models/user-view-model';
import { UserService } from '../_services/user.service';
import { of } from 'rxjs';

describe('TableComponent', () => {

  function setup() {
    const fixture = TestBed.createComponent(TableComponent);
    const component = fixture.componentInstance;
    const userService = fixture.debugElement.injector.get(UserService);

    return { fixture, component, userService };
  }

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TableComponent],
      providers: [UserService],
      imports: [
        BrowserAnimationsModule,
        HttpClientTestingModule,
        ReactiveFormsModule,
        RouterTestingModule,
        MatSnackBarModule,
        MatProgressSpinnerModule,
        MatCardModule,
        MatTableModule,
        MatPaginatorModule
      ]
    }).compileComponents();
  }));

  describe(':', () => {

    it('should create', () => {
      const { component } = setup();
      expect(component).toBeTruthy();
    });

    it('should display correct data', () => {
      const { fixture, userService } = setup();
      spyOn(userService, "getAll").and.returnValue(of(users));
      fixture.detectChanges();
      fixture.whenStable().then(() => {
        let tableRows = fixture.nativeElement.querySelectorAll('tr');
        let headerRow = tableRows[0];
        let row = tableRows[1];
        expect(tableRows.length).toBe(3);
        expect(headerRow.cells[0].innerHTML).toBe("№");
        expect(headerRow.cells[1].innerHTML).toBe("Name")
        expect(headerRow.cells[2].innerHTML).toBe("City")
        expect(headerRow.cells[3].innerHTML).toBe("Position")

        expect(row.cells[0].innerHTML).toBe("1");
      })
    });
  })

  describe(':', () => {

    it('should correctly send filter data to service', async () => {
      const { fixture, userService, component } = setup();
      var spy = spyOn(userService, "getAll");
      spy.and.returnValues(of(users), of(users));
      fixture.detectChanges();
      // const searchForm = component.searchForm;
      // searchForm.patchValue({ 'searchControl': 'refusal' })
      // jasmine.clock().tick(510);
      // jasmine.clock().uninstall();
      // fixture.detectChanges();
      // expect(spy.calls.count()).toEqual(2);
    });

  });

  const users: UserData[] = [
    {
      num: 1,
      id: '7283243a-8866-41fe-98d6-635e5ac81709',
      firstName: 'Дмитрий',
      lastName: 'Никитин',
      username: 'dmitry',
      city: 'Москва',
      position: 'Ведущий разработчик',
    },
    {
      num: 2,
      id: '28f86d27-d6de-4315-8a37-cf45bc90e870',
      firstName: 'Николай',
      lastName: 'Петров',
      username: 'petrov',
      city: 'Нижний Новгород',
      position: 'Менеджер по продажам',
    },
    {
      num: 3,
      id: 'c5da8998-a1df-4e21-84bf-4ecbe9303adb',
      firstName: 'Алексей',
      lastName: 'Андреев',
      username: 'alexeyAndreev',
      city: 'Москва',
      position: 'Инвестор',
    }
  ]
});
