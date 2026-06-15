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
  cpf: FormControl<string>;

  dataNascimento: FormControl<string>;

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
      cpf: this.fb.nonNullable.control(
        '',
        Validators.required,
      ),

      dataNascimento: this.fb.nonNullable.control(
        '',
        Validators.required,
      ),

      
    });
  }

  reset(form: ClienteForm): void {
    form.reset({
      cpf: '',
      dataNascimento: '',
  
    });
  }

  toPayload(form: ClienteForm): ClienteCreateDTO {
    const raw = form.getRawValue();

    return {
      cpf: raw.cpf,
      dataNascimento: raw.dataNascimento,
    
    };
  }
}