import { environment } from '../../../../environments/environment';
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Fornecedor, FornecedorOpcao, FornecedorRequest, Pagina } from '../model/fornecedor.model';

@Injectable({ providedIn: 'root' })
export class FornecedorService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/fornecedores`;

  listar(
    busca: string,
    ativo: boolean | null,
    page = 0,
    size = 10,
  ): Observable<Pagina<Fornecedor>> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sort', 'fornecedorId,desc');
    if (busca.trim()) params = params.set('busca', busca.trim());
    if (ativo !== null) params = params.set('ativo', ativo);
    return this.http.get<Pagina<Fornecedor>>(this.baseUrl, { params });
  }

  buscar(id: number): Observable<Fornecedor> {
    return this.http.get<Fornecedor>(`${this.baseUrl}/${id}`);
  }

  criar(dados: FornecedorRequest): Observable<Fornecedor> {
    return this.http.post<Fornecedor>(this.baseUrl, dados);
  }

  atualizar(id: number, dados: FornecedorRequest): Observable<Fornecedor> {
    return this.http.put<Fornecedor>(`${this.baseUrl}/${id}`, dados);
  }

  alterarStatus(id: number, ativo: boolean): Observable<Fornecedor> {
    return this.http.patch<Fornecedor>(`${this.baseUrl}/${id}/status`, { ativo });
  }

  opcoes(busca = ''): Observable<FornecedorOpcao[]> {
    return this.http.get<FornecedorOpcao[]>(`${this.baseUrl}/opcoes`, {
      params: busca ? { busca } : {},
    });
  }
}
