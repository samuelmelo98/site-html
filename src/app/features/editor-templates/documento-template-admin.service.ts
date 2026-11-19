import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface TemplateResumo {
  slug: string;
  version: number;
  active: boolean;
  description: string | null;
}
export interface TemplateDetalhe extends TemplateResumo {
  template: string;
}

@Injectable({ providedIn: 'root' })
export class DocumentoTemplateAdminService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/admin/documento-templates`;

  listar(): Observable<TemplateResumo[]> {
    return this.http.get<TemplateResumo[]>(this.url);
  }
  buscar(slug: string, version: number): Observable<TemplateDetalhe> {
    return this.http.get<TemplateDetalhe>(
      `${this.url}/${encodeURIComponent(slug)}/versoes/${version}`,
    );
  }
  preview(slug: string, html: string, vendaId: number): Observable<{ html: string }> {
    return this.http.post<{ html: string }>(`${this.url}/${encodeURIComponent(slug)}/preview`, {
      html,
      vendaId,
    });
  }
  publicar(
    slug: string,
    html: string,
    description: string,
    baseVersion: number,
  ): Observable<TemplateDetalhe> {
    return this.http.post<TemplateDetalhe>(`${this.url}/${encodeURIComponent(slug)}/publicar`, {
      html,
      description,
      baseVersion,
    });
  }
}
