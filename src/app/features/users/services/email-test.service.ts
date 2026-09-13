import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface EmailTestResponse {
  status: string;
  destinatarios: number;
  anexos: number;
  requestId: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmailTestService {

  private readonly API = `${environment.apiUrl}/test/email`;

  constructor(private http: HttpClient) {}

  testar(): Observable<EmailTestResponse> {
    return this.http.post<EmailTestResponse>(this.API, {});
  }
}