import { Component, OnInit } from '@angular/core';
import { MatAutocompleteSelectedEvent, MatSnackBar } from '@angular/material';
import { Observable, of } from 'rxjs';
import { startWith, debounceTime, distinctUntilChanged, switchMap, map } from 'rxjs/operators';
import { FormControl, AbstractControl } from '@angular/forms';
import { SearchPanelService } from 'src/app/_services/search-panel.service';
import { SearchGroup } from 'src/app/_enums/search-group-enum';

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
  autoCompleteObjects: AutoCompleteObject[];

  cityOptions: Observable<Array<string>>;
  positionOptions: Observable<Array<string>>;
  skillOptions: Observable<Array<string>>;

  citySearchControl: FormControl = new FormControl();
  positionSearchControl: FormControl = new FormControl();
  skillSearchControl: FormControl = new FormControl();

  constructor(private searchService: SearchPanelService, private snackBar: MatSnackBar) {
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
    this.showMessage('Search!!');
  }

  autocompleteEvent(event: MatAutocompleteSelectedEvent): void {
    const skill = event.option.value;
    console.log(skill);
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
