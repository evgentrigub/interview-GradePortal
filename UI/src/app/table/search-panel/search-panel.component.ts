import { Component, OnInit, Output, EventEmitter, Input, OnChanges } from '@angular/core';
import { MatAutocompleteSelectedEvent, MatSnackBar } from '@angular/material';
import { Observable, of } from 'rxjs';
import { startWith, debounceTime, distinctUntilChanged, switchMap, map, tap } from 'rxjs/operators';
import { FormControl, AbstractControl, FormGroup, FormBuilder } from '@angular/forms';
import { SearchPanelService } from 'src/app/_services/search-panel.service';
import { SearchGroup } from 'src/app/_enums/search-group-enum';
import { KeyValue } from '@angular/common';
import { ISearchOptions, SearchOptions, PaginatorParams } from 'src/app/_models/search-options';
import { UserData } from 'src/app/_models/user-view-model';

interface AutoCompleteObject {
  placeholder: string;
  control: AbstractControl;
  autocomplete: string;
  options: Observable<Array<string>>;
}

@Component({
  selector: 'app-search-panel',
  templateUrl: './search-panel.component.html',
  styleUrls: ['./search-panel.component.css'],
})
export class SearchPanelComponent {

  @Input()
  paginatorParams: PaginatorParams;

  // @Output()
  // readonly filteredUsers = new EventEmitter<UserData>();

  @Output()
  readonly outParams = new EventEmitter<ISearchOptions>();

  searchForm: FormGroup;
  filteredParams: ISearchOptions = new SearchOptions();

  autoCompleteObjects: AutoCompleteObject[];

  cityOptions: Observable<Array<string>>;
  positionOptions: Observable<Array<string>>;
  skillOptions: Observable<Array<string>>;

  citySearchControl: FormControl = new FormControl();
  positionSearchControl: FormControl = new FormControl();
  skillSearchControl: FormControl = new FormControl();

  constructor(
    private searchService: SearchPanelService,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar) {

    this.searchForm = this.formBuilder.group({
      name: [''],
      city: this.citySearchControl,
      pos: this.positionSearchControl,
      skill: this.skillSearchControl
    });

    this.cityOptions = this.getAutocompleteOptions(this.citySearchControl, SearchGroup.City);
    this.positionOptions = this.getAutocompleteOptions(this.positionSearchControl, SearchGroup.Position);
    this.skillOptions = this.getAutocompleteOptions(this.skillSearchControl, SearchGroup.Skill);

    this.autoCompleteObjects = [
      {
        placeholder: 'City',
        control: this.citySearchControl,
        autocomplete: 'city',
        options: this.cityOptions,
      },
      {
        placeholder: 'Position',
        control: this.positionSearchControl,
        autocomplete: 'position',
        options: this.positionOptions,
      },
      {
        placeholder: 'Skill',
        control: this.skillSearchControl,
        autocomplete: 'skill',
        options: this.skillOptions,
      },
    ];
  }

  search() {
    const searchValue = this.searchForm.value;
    this.filteredParams.filter = new Array<KeyValue<string, string>>();
    for (const el of Object.getOwnPropertyNames(searchValue)) {
      this.filteredParams.filter.push({ key: el, value: searchValue[el] });
    }
    this.outParams.emit(this.filteredParams);
  }

  reset() {
    this.outParams.emit(null);
  }

  autocompleteEvent(event: MatAutocompleteSelectedEvent): void {
    const skill = event.option.value;
  }

  private getAutocompleteOptions(searchControl: AbstractControl, group: SearchGroup): Observable<Array<string>> {
    return searchControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(value => {
        const options = this.filterData(value || '', group);
        return options;
      })
    );
  }

  private filterData(value: any, group: SearchGroup): Observable<Array<string>> {
    if (!value) {
      return of([]);
    }

    return this.searchService.searchSomething(value, group).pipe(
      map(response =>
        response.filter(option => {
          return option.toLowerCase().includes(value.toLowerCase());
        })
      )
    );
  }

  private showMessage(msg: any): void {
    this.snackBar.open(msg, 'ok');
  }
}
