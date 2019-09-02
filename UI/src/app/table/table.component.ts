import { Component, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { UserService } from '../_services/user.service';
import { MatTableDataSource, MatPaginator, MatSort, MatSnackBar } from '@angular/material';
import { UserData } from '../_models/user-view-model';
import { startWith, switchMap, map } from 'rxjs/operators';
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
  dataSource: MatTableDataSource<UserData> = new MatTableDataSource<UserData>();
  resultsLength = 0;

  isLoading: boolean;

  constructor(
    private userService: UserService,
    private searchService: SearchPanelService,
    private snackBar: MatSnackBar,
    private detector: ChangeDetectorRef
  ) {}

  ngAfterViewInit(): void {
    this.loadUsersData();
    this.detector.detectChanges();
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
    this.paginator.page
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoading = true;
          if (!this.searchParams || this.searchParams.filter.length === 0) {
            return this.userService.getUsersWithParams(this.paginator.pageIndex, this.paginator.pageSize);
          }
          this.searchParams.pageIndex = this.paginator.pageIndex;
          this.searchParams.pageSize = this.paginator.pageSize;
          return this.searchService.getFilteredUsers(this.searchParams);
        }),
        map(result => {
          if (result.isSuccess) {
            this.isLoading = false;
            const data = result.data;
            this.users = data.items;

            this.resultsLength = data.totalCount;
            return data.items;
          }
          return [];
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
