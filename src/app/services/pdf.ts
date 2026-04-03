import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../src/environments/environment';

@Injectable({ providedIn: 'root' })
export class PdfService {

  private readonly API = `${environment.apiUrl}/api/relatorios/pdf`;

  constructor(private http: HttpClient) {}

  downloadPdf() {
    return this.http.get(this.API, {
      responseType: 'blob' // 🔥 essencial
    });
  }
}