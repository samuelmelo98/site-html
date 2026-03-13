import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {

  // ajuste depois para environment
  private readonly API = '/api/users';

  constructor(private http: HttpClient) {}

  create(user: User): Observable<User> {
    console.log(user);
    console.log(this.http.post<User>(this.API, user));
    return this.http.post<User>(this.API, user);
  }

  list(): Observable<User[]> {
    return this.http.get<User[]>(this.API);
  }
}
