import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { UserService } from '../_services/user.service';
import { Router } from '@angular/router';
import { MatTableDataSource, MatPaginator, MatSort, MatSnackBar } from '@angular/material';
import { UserData } from '../_models/user-view-model';
import { merge, of } from 'rxjs';
import { startWith, switchMap, map, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css'],
})
export class TableComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;

  users: UserData[] = [];

  displayedColumns: string[] = ['num', 'name', 'city', 'position'];
  dataSource: MatTableDataSource<UserData>;

  resultsLength = 0;
  isLoadingResults = true;
  isRateLimitReached = false;

  constructor(private userService: UserService, private router: Router, private snackBar: MatSnackBar) {}

  ngOnInit() {}

  ngAfterViewInit() {
    // this.sort.sortChange.subscribe(r => this.paginator.pageIndex = 0);
    merge(this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          return this.userService.getAll(this.paginator.pageIndex, this.paginator.pageSize);
        }),
        map(data => {
          this.isLoadingResults = false;
          this.resultsLength = data.totalCount;
          return data.items;
        }),
        catchError(e => {
          this.showMessage(e);
          this.isLoadingResults = false;
          return of([]);
        })
      )
      .subscribe(data => (this.users = data));
  }

  clickUser(user: UserData) {
    this.router.navigate([`/${user.username}`], { state: { user } });
  }

  private showMessage(msg: any): void {
    this.snackBar.open(msg, 'ok');
  }
}
