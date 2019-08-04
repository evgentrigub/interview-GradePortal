import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthenticationService } from '../account/services/authentication.service';
import { UserService } from '../account/services/user.service';
import { User } from '../_models/user';
import { first } from 'rxjs/operators';
import { Router } from '@angular/router';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { UserViewModel } from '../_models/user-view-model';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css'],
})
export class TableComponent implements OnInit {
  users: UserViewModel[] = [];

  displayedColumns: string[] = ['num', 'name', 'city', 'position'];
  dataSource: MatTableDataSource<UserViewModel>;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    private authenticationService: AuthenticationService,
    private userService: UserService,
    private router: Router) { }

  ngOnInit() {
    this._getUsers();
  }

  private _getUsers() {
    this.userService.getAll()
      .pipe(first())
      .subscribe(users => {
        this.users = users;
        this.dataSource = new MatTableDataSource(this.users);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      });
  }
}
