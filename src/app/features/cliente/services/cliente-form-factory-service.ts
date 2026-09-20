import {
  Injectable,
  inject,
} from '@angular/core';

import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';

import {
  ClienteCreateDTO,
} from '../model/cliente-criar.dto';

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

  private readonly fb =
    inject(FormBuilder);

  create(): ClienteForm {

    return this.fb.group({

      nome: this.fb.nonNullable.control(
        '',
        [
          Validators.required,
          Validators.minLength(3),
        ],
      ),

      cpf: this.fb.nonNullable.control(
        '',
        [
          Validators.required,
          Validators.pattern(
            /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
          ),
        ],
      ),

      email: this.fb.nonNullable.control(
  '',
  [
    Validators.email,
  ],
),

      telefone: this.fb.nonNullable.control(
        '',
        [
          Validators.required,
          Validators.pattern(
            /^\(\d{2}\) \d{5}-\d{4}$/,
          ),
        ],
      ),

      endereco: this.fb.nonNullable.control(
        '',
      ),

      cidade: this.fb.nonNullable.control(
        '',
      ),

      estado: this.fb.nonNullable.control(
        '',
      ),

      cep: this.fb.nonNullable.control(
        '',
      ),

    });
  }

  reset(
    form: ClienteForm,
  ): void {

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

  toPayload(
    form: ClienteForm,
  ): ClienteCreateDTO {

    const raw =
      form.getRawValue();

    return {

      nome:
        raw.nome.trim(),

      cpf:
        raw.cpf,

      email:
        raw.email
          .trim()
          .toLowerCase(),

      telefone:
        raw.telefone,

      endereco:
        raw.endereco.trim(),

      cidade:
        raw.cidade.trim(),

      estado:
        raw.estado
          .trim()
          .toUpperCase(),

      cep:
        raw.cep.trim(),
    };
  }
}