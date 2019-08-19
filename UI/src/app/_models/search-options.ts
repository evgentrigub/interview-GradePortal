import { KeyValue } from '@angular/common';

export interface ISearchOptions {
  filter: KeyValue<string, string>[];
  toQueryString(): string;
}

export class SearchOptions implements ISearchOptions {

  quickSearch: string;

  constructor() {
    this.quickSearch = '';
  }

  filter: KeyValue<string, string>[];
  toQueryString(): string {
    const queryString = 'serializedFilters=' + encodeURI(JSON.stringify(this.filter));
    return queryString;
  }

}
