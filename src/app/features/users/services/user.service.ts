import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UserService {

// Agora ele usa a URL completa: https://api.cluster.stringtecnologiadf.org/users
  private readonly API = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {
    console.log(`API ${this.API}`);
  }

  create(user: User): Observable<User> {
    console.log(user);
    console.log(this.http.post<User>(this.API, user));
    console.log(`API ${this.API}`);
    return this.http.post<User>(this.API, user);
  }

  list(): Observable<User[]> {
    console.log(`API ${this.API}`);
    return this.http.get<User[]>(this.API);

  }
}
