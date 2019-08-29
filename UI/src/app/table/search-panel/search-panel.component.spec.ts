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
    expect(component.outParams.emit).toHaveBeenCalledWith(searchOptions)
  });

  // it('should show autocomplete with possible options in search inputs', (done) => {
  //   // arrange
  //   spyOn(service, 'getSearchParams').and.returnValues(of(SEARCH_RESULT)).and.callThrough();
  //   const inputs = fixture.debugElement.queryAll(By.css('input'));

  //   // act

  //   for (const el of inputs) {
  //     console.log(el);
  //     const element = el.nativeElement as HTMLInputElement;
  //     element.value = 'aaaa';
  //     element.dispatchEvent(new Event('input'));
  //   }
  //   fixture.detectChanges();

  //   component.cityOptions.subscribe(el => {
  //     fixture.detectChanges();

  //     console.log(el);
  //   })

  //   // assert
  //   done();
  // });

});

const SEARCH_RESULT = ['aaaaaa', 'bbbbbbb'];
