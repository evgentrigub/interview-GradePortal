import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthenticationService } from '../account/services/authentication.service';
import { UserService } from '../account/services/user.service';
import { User } from '../_models/user';
import { first, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { UserViewModel, UserData } from '../_models/user-view-model';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css'],
})
export class TableComponent implements OnInit {
  users: UserData[] = [];

  displayedColumns: string[] = ['num', 'name', 'city', 'position'];
  dataSource: MatTableDataSource<UserData>;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    private authenticationService: AuthenticationService,
    private userService: UserService,
    private router: Router) { }

  ngOnInit() {
    this._loadUsers();
  }

  clickUser(user: UserData) {
    this.router.navigate([`/${user.username}`], { state: { user } });
  }

  private _loadUsers(): void {
    this.userService.getAll()
      .subscribe(data => {
        console.log(data);
        this.dataSource = new MatTableDataSource(data);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      });
  }
}
