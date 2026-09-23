// 🔹 Angular
import {
  inject,
  Injectable,
} from '@angular/core';

import {
  HttpClient,
} from '@angular/common/http';

// 🔹 RxJS
import {
  Observable,
  catchError,
  map,
  of,
  shareReplay,
} from 'rxjs';

// 🔹 Environment
import {
  environment,
} from '../../../../environments/environment';

// 🔹 Shared
import {
  Page,
} from '../../../shared/search-generic/models/page.model';

// 🔹 Feature
import {
  Cliente,
} from '../model/cliente-listar.dto';

import { ClienteAtualizarDTO } from '../model/cliente-atualizar.dto';



@Injectable({
  providedIn: 'root',
})
export class ClienteService {

  private readonly API =
    `${environment.apiUrl}/clientes`;

  private readonly http =
    inject(HttpClient);


  listar(): Observable<Cliente[]> {

    return this.http.get<Cliente[]>(
      this.API,
    );
  }


  listarPaginado(
    page: number,
    size: number,
    sortField: string,
    sortOrder: string,
    filtro?: string,
  ): Observable<Page<any>> {

    let params =
      `page=${page}` +
      `&size=${size}` +
      `&sort=${sortField},${sortOrder}`;

    if (filtro) {

      params +=
        `&search=${encodeURIComponent(filtro)}`;
    }

    return this.http.get<Page<any>>(
      `${this.API}?${params}`,
    );
  }


  buscarPorId(
    clienteId: number,
  ): Observable<Cliente> {

    return this.http.get<Cliente>(
      `${this.API}/${clienteId}`,
    );
  }


  listarTodos(): Observable<Cliente[]> {

    return this.http.get<Cliente[]>(
      `${this.API}/all`,
    );
  }


  criar(
    cliente: Cliente,
  ): Observable<Cliente> {

    return this.http.post<Cliente>(
      this.API,
      cliente,
    );
  }


  editar(
  id: number,
  cliente: ClienteAtualizarDTO,
): Observable<Cliente> {

  return this.http.put<Cliente>(
    `${this.API}/${id}`,
    cliente,
  );
}


  editarParcial(
    id: number,
    dto: any,
  ): Observable<void> {

    console.log(dto);

    return this.http.patch<void>(
      `${this.API}/${id}`,
      dto,
    );
  }


  apagar(
    id: number,
  ): Observable<void> {

    return this.http.delete<void>(
      `${this.API}/${id}`,
    );
  }


 salvar(dto: any): Observable<Cliente> {

  return this.http.post<Cliente>(
    this.API,
    dto,
  );
}


  /**
   * Verifica se já existe cliente
   * cadastrado com o CPF informado.
   *
   * Endpoint:
   *
   * GET /clientes/existe-cpf?cpf=12345678900
   */
  existePorCpf(
    cpf: string,
  ): Observable<boolean> {

    const cpfNormalizado =
      cpf.replace(/\D/g, '');

    return this.http.get<boolean>(
      `${this.API}/existe-cpf`,
      {
        params: {
          cpf: cpfNormalizado,
        },
      },
    );
  }


  listarTipoDespesa(): Observable<Cliente[]> {

    return this.http
      .get<Cliente[]>(
        `${this.API}/dropdown`,
      )
      .pipe(
        shareReplay(1),
      );
  }


  buscarPorMatricula(
    matricula: string,
  ): Observable<any> {

    return this.http.get<any>(
      `${this.API}/matricula/${matricula}`,
    );
  }


  buscarPorMatriculaLista(
    matricula: string,
  ): Observable<any[]> {

    return this.http
      .get<any>(
        `${this.API}/matricula/${matricula}`,
      )
      .pipe(

        map(
          (conta) =>
            conta
              ? [conta]
              : [],
        ),

        catchError((err) => {

          if (err.status === 404) {

            return of([]);
          }

          throw err;
        }),

      );
  }

  
}