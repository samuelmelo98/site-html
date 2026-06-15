import { Injectable, inject } from '@angular/core';

import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';

import { ClienteCreateDTO } from '../model/cliente-criar.dto';

/* =========================================================
 * FORM TYPE
 * ========================================================= */

export type ClienteForm = FormGroup<{
  nome: FormControl<string>;

  cpf: FormControl<string>;

  email: FormControl<string>;

  telefone: FormControl<string>;

  endereco: FormControl<string>;

  cidade: FormControl<string>;

  estado: FormControl<string>;

  cep: FormControl<string>;
}>;

/* =========================================================
 * FACTORY
 * ========================================================= */

@Injectable({
  providedIn: 'root',
})
export class ClienteFormFactoryService {
  private readonly fb = inject(FormBuilder);

  create(): ClienteForm {
    return this.fb.group({
      nome: this.fb.nonNullable.control(
        '',
        Validators.required,
      ),

      cpf: this.fb.nonNullable.control(
        '',
        Validators.required,
      ),

      email: this.fb.nonNullable.control(
        '',
        [Validators.required, Validators.email],
      ),

      telefone: this.fb.nonNullable.control(
        '',
        Validators.required,
      ),

      endereco: this.fb.nonNullable.control(
        '',
        Validators.required,
      ),

      cidade: this.fb.nonNullable.control(
        '',
        Validators.required,
      ),

      estado: this.fb.nonNullable.control(
        '',
        Validators.required,
      ),

      cep: this.fb.nonNullable.control(
        '',
        Validators.required,
      ),
    });
  }

  reset(form: ClienteForm): void {
    form.reset({
      nome: '',
      cpf: '',
      email: '',
      telefone: '',
      endereco: '',
      cidade: '',
      estado: '',
      cep: '',
    });
  }

  toPayload(form: ClienteForm): ClienteCreateDTO {
    const raw = form.getRawValue();

    return {
      nome: raw.nome,
      cpf: raw.cpf,
      email: raw.email,
      telefone: raw.telefone,
      endereco: raw.endereco,
      cidade: raw.cidade,
      estado: raw.estado,
      cep: raw.cep,
    };
  }
}