import { Component, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { UserService } from '../_services/user.service';
import { Router } from '@angular/router';
import { MatTableDataSource, MatPaginator, MatSort, MatSnackBar } from '@angular/material';
import { UserData } from '../_models/user-view-model';
import { merge, of } from 'rxjs';
import { startWith, switchMap, map, catchError } from 'rxjs/operators';
import { ISearchOptions } from '../_models/search-options';
import { SearchPanelService } from '../_services/search-panel.service';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css'],
})
export class TableComponent implements AfterViewInit {
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;

  private searchParams: ISearchOptions;

  users: UserData[] = [];
  displayedColumns: string[] = ['num', 'name', 'city', 'position'];
  dataSource: MatTableDataSource<UserData>;
  resultsLength = 0;

  isLoading = true;

  constructor(
    private userService: UserService,
    private searchService: SearchPanelService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngAfterViewInit(): void {
    this.loadUsersData();
    this.cdr.detectChanges();
  }

  /**
   * Set search params from emiiter
   * @param params params with filter by city, position or skill
   */
  setFilteredUsers(params: ISearchOptions) {
    this.searchParams = params;
    this.loadUsersData();
  }

  /**
   * Update user table after each change in paginator or search panel
   */
  private loadUsersData(): void {
    merge(this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoading = true;
          if (!this.searchParams || this.searchParams.filter.length === 0) {
            return this.userService.getUsersWithParams(this.paginator.pageIndex, this.paginator.pageSize);
          } else {
            this.searchParams.pageIndex = this.paginator.pageIndex;
            this.searchParams.pageSize = this.paginator.pageSize;
            return this.searchService.getFilteredUsers(this.searchParams);
          }
        }),
        map(result => {
          if (result) {
            const data = result.data;
            this.isLoading = false;
            this.resultsLength = data.totalCount;
            return data.items;
          }
          return [];
        }),
        catchError(e => {
          this.showMessage(e);
          this.isLoading = false;
          return of([]);
        })
      )
      .subscribe(data => {
        this.users = data;
      });
  }

  private showMessage(msg: any): void {
    this.snackBar.open(msg, 'ok');
  }
}
