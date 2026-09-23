import {
  inject,
  Injectable,
} from '@angular/core';

import {
  HttpClient,
} from '@angular/common/http';

import {
  Observable,
} from 'rxjs';

import {
  environment,
} from '../../../../environments/environment';

import {
  TecnicoDTO,
} from '../model/tecnico.dto';


@Injectable({
  providedIn: 'root',
})
export class TecnicoService {

  private readonly http =
    inject(HttpClient);

  private readonly API =
    `${environment.apiUrl}/usuarios/tecnicos`;


  listar(): Observable<TecnicoDTO[]> {

    return this.http.get<TecnicoDTO[]>(
      this.API,
    );
  }

  
}