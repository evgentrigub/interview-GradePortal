import { async, ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { SearchPanelComponent } from './search-panel.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { MaterialModule } from 'src/app/material-module';
import { By } from '@angular/platform-browser';
import { SearchOptions } from 'src/app/_models/search-options';
import { SearchPanelService } from 'src/app/_services/search-panel.service';
import { of } from 'rxjs';

// tslint:disable: no-use-before-declare

describe('SearchPanelComponent', () => {
  let component: SearchPanelComponent;
  let fixture: ComponentFixture<SearchPanelComponent>;
  let service: SearchPanelService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SearchPanelComponent],
      imports: [BrowserAnimationsModule, HttpClientTestingModule, ReactiveFormsModule, RouterTestingModule, MaterialModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    service = TestBed.get(SearchPanelService);
    fixture = TestBed.createComponent(SearchPanelComponent);
    component = fixture.componentInstance;
    spyOn(component.outParams, 'emit');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should send search params out', () => {
    // arrange
    const inputs = fixture.debugElement.queryAll(By.css('input'));
    const searchButton = fixture.debugElement.query(By.css('button.search')).nativeElement as HTMLButtonElement;
    expect(searchButton).toBeTruthy();

    const searchOptions: SearchOptions = new SearchOptions();
    searchOptions.filter = [
      { key: 'name', value: 'a' },
      { key: 'city', value: 'a' },
      { key: 'pos', value: 'a' },
      { key: 'skill', value: 'a' }
    ];

    // act
    for (const el of inputs) {
      const element = el.nativeElement as HTMLInputElement;
      element.value = 'a';
      element.dispatchEvent(new Event('input'));
    }

    fixture.detectChanges();
    expect(component.searchForm.dirty).toBeTruthy();
    searchButton.click();
    fixture.detectChanges();

    // assert
    expect(component.outParams.emit).toHaveBeenCalledWith(searchOptions);
  });

  it('should show autocomplete with possible options in search inputs', (done) => {
    // arrange
    spyOn(service, 'getSearchParams').and.returnValues(of(SEARCH_RESULT), of(SEARCH_RESULT), of(SEARCH_RESULT), of(SEARCH_RESULT));
    const panel = fixture.debugElement.query(By.css('mat-expansion-panel')).nativeElement;
    panel.dispatchEvent(new Event('click'));
    fixture.detectChanges();

    const inputs = fixture.debugElement.queryAll(By.css('input'));

    // act
    for (const el of inputs) {
      const element = el.nativeElement as HTMLInputElement;
      element.dispatchEvent(new Event('focusin'));
      element.value = 'aaaa';
      element.dispatchEvent(new Event('input'));
      fixture.detectChanges();
    }

    // assert
    setTimeout(() => {
      fixture.detectChanges();
      const boxes = fixture.debugElement.queryAll(By.css('mat-option'));
      for (const el of boxes) {
        expect(el).toBeTruthy();
      }
      done();
    }, 1000);

  });

});

const SEARCH_RESULT = ['aaaaaa', 'bbbbbbb'];
