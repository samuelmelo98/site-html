import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../services/user.service';
import { User } from '../models/user.model';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  imports: [
  CommonModule,
  RouterModule],
  templateUrl: './user-list.page.html',
  styleUrls: ['./user-list.page.css']
})
export class UserListPage implements OnInit {
  expandedUser: any | null = null;
  users: User[] = [];

  constructor(private service: UserService) {}

  ngOnInit(): void {
    this.service.list().subscribe({
      next: data => this.users = data,
      error: err => console.error(err)
    });
  }



toggle(user: any) {
  this.expandedUser = this.expandedUser === user ? null : user;
}

}
