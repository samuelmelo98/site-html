// 🔹 Angular
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

// 🔹 RxJS
import { Observable, shareReplay, of, map, catchError } from 'rxjs';

// 🔹 Environment
import { environment } from '../../../../environments/environment';

// 🔹 Shared
import { Page } from '../../../shared/search-generic/models/page.model';
import { Cliente } from '../model/cliente-listar.dto';

// 🔹 Feature (models / DTOs)


@Injectable({ providedIn: 'root' })
export class ClienteService {
  private readonly API = `${environment.apiUrl}/clientes`;
  private http = inject(HttpClient);

  listar() {
    return this.http.get<Cliente[]>(this.API);
  }

  listarPaginado(
    page: number,
    size: number,
    sortField: string,
    sortOrder: string,
    filtro?: string,
  ): Observable<Page<any>> {
    let params = `page=${page}&size=${size}&sort=${sortField},${sortOrder}`;

    if (filtro) {
      params += `&search=${encodeURIComponent(filtro)}`;
    }

    return this.http.get<Page<any>>(
      `${this.API}?${params}`,
    );
  }

  buscar(amparoLegalId: number) {
    return this.http.get<Cliente>(`${this.API}/${amparoLegalId}`);
  }

  listarTodos(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(`${this.API}/all`);
  }

  criar(amparo: Cliente) {
    return this.http.post<Cliente>(this.API, amparo);
  }

  editar(id: number, amparo: any) {
    return this.http.put<Cliente>(`${this.API}/${id}`, amparo);
  }

  editarParcial(id: number, dto: any) {
    console.log(dto);
    return this.http.patch<void>(`${this.API}/${id}`, dto);
  }

  apagar(id: number) {
    return this.http.delete<void>(`${this.API}/${id}`);
  }

  salvar(dto: any): Observable<void> {
    console.log(this.API);
    console.log(dto);
    return this.http.post<void>(this.API, dto);
  }
  /*
  listarTipoDespesa(): Observable<TipoDespesa[]> {
  console.log('tipoDespesaService-listarParaDropdown.');

  return this.http
    .get<TipoDespesa[]>(`${this.API}/dropdown`)
    .pipe(
      map(tipos =>
        tipos.map(tipo => ({
          label: tipo.descricao,
          value: tipo.tipoDespesaId
        }))
      ),
      shareReplay(1)
    );
}
    */

  listarTipoDespesa(): Observable<Cliente[]> {
    return this.http
      .get<Cliente[]>(`${this.API}/dropdown`)
      .pipe(shareReplay(1));
  }

  buscarPorMatricula(matricula: string) {
    return this.http.get<any>(
      `${this.API}/matricula/${matricula}`,
    );
  }

  buscarPorMatriculaLista(matricula: string) {
    return this.http
      .get<any>(`${this.API}/matricula/${matricula}`)
      .pipe(
        map((conta) => (conta ? [conta] : [])), // 🔥 objeto → array
        catchError((err) => {
          if (err.status === 404) {
            return of([]); // 🔥 sem conta → lista vazia
          }
          throw err; // outros erros continuam
        }),
      );
  }
}
