import { KeyValue } from '@angular/common';

export interface PaginatorParams {
  pageSize: number;
  pageIndex: number;
}

export interface ISearchOptions {
  filter: KeyValue<string, string>[];
  pageSize: number;
  pageIndex: number;
  toQueryString(): string;
}

export class SearchOptions implements ISearchOptions {
  pageSize: number;
  pageIndex: number;

  quickSearch: string;

  constructor() {
    this.quickSearch = '';
  }

  filter: KeyValue<string, string>[];
  toQueryString(): string {
    const queryString =
      '&page=' + this.pageIndex + '&pageSize=' + this.pageSize + '&serializedFilters=' + encodeURI(JSON.stringify(this.filter));
    return queryString;
  }
}
