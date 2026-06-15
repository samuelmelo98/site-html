import {
  Component,
  DestroyRef,
  EventEmitter,
  Output,
  inject,
} from '@angular/core';

import { ReactiveFormsModule } from '@angular/forms';

import { CommonModule } from '@angular/common';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import {
  EMPTY,
  catchError,
  finalize,
  tap,
} from 'rxjs';

import { MessageService } from 'primeng/api';

import { InputMaskModule } from 'primeng/inputmask';

import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { Panel } from 'primeng/panel';

import { ClienteApiService } from '../../services/cliente-api.service';

import {
  ClienteForm,
  ClienteFormFactoryService,
} from '../../services/cliente-form-factory-service';

import { ConsultaCpfDTO } from '../../model/consulta-cpf.dto';

import { Router } from '@angular/router';

@Component({
  selector: 'app-create',

  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    DividerModule,
    InputTextModule,
    Panel,
    InputMaskModule,
  
  ],

  templateUrl: './create.component.html',

  styleUrl: './create.component.css',
})
export class CreateComponent {

resultadoConsulta?: ConsultaCpfDTO;

consultando = false;

  @Output()
  readonly salvo = new EventEmitter<void>();

  private readonly destroyRef = inject(DestroyRef);

  private readonly clienteApiService = inject(ClienteApiService);

  private readonly messageService = inject(MessageService);

  private readonly formFactory = inject(
    ClienteFormFactoryService,
  );

   private router = inject(Router);

  readonly form: ClienteForm =
    this.formFactory.create();

  salvando = false;

  salvar(): void {

    if (this.form.invalid) {

      this.form.markAllAsTouched();

      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Preencha os campos obrigatórios',
      });

      return;
    }

    const payload =
      this.formFactory.toPayload(this.form);

    this.salvando = true;

    this.clienteApiService
      .salvar(payload)
      .pipe(

        tap(() => {

          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Cliente cadastrado com sucesso',
          });

          this.salvo.emit();
        }),

        catchError((err) => {

          console.error(err);

          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao salvar cliente',
          });

          return EMPTY;
        }),

        finalize(() => {
          this.salvando = false;
        }),

        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  buscarCpf(): void {

  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }

  const cpf =
    this.form.controls.cpf.value;

  const birthdate = this.formatarDataParaApi(
    this.form.controls.dataNascimento.value);

  this.consultando = true;

  this.clienteApiService
    .buscarCpf(cpf, birthdate)
    .pipe(
      finalize(() => {
        this.consultando = false;
      })
    )
    .subscribe({

      next: (cliente) => {

        this.resultadoConsulta =
          cliente;

        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Cliente localizado'
        });
      },

      error: () => {

        this.resultadoConsulta =
          undefined;

        this.messageService.add({
          severity: 'warn',
          summary: 'Aviso',
          detail: 'Cliente não encontrado'
        });
      }
    });
}

adicionarBase(): void {

  if (!this.resultadoConsulta) {
    return;
  }

  const dto = {

    nome:
      this.resultadoConsulta.nome,

    cpf:
      this.resultadoConsulta.matricula,

    email: '',

    telefone: '',

    endereco: '',

    cidade: '',

    estado: '',

    cep: ''
  };

  this.clienteApiService
    .salvar(dto)
    .subscribe({

      next: () => {

        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Cliente adicionado à base'
        });

      }
    });
}

private formatarDataParaApi(data: string): string {

  if (!data || !data.includes('/')) {
    return data;
  }

  const partes = data.split('/');

  if (partes.length !== 3) {
    return data;
  }

  const [dia, mes, ano] = partes;

  return `${ano}-${mes}-${dia}`;
}

public irPara(path: string[]): void {
    this.router
      .navigate(path)
      .then((sucesso) => {
        if (!sucesso) {
          console.log('Erro ao navegar', path);
        }
      })
      .catch((err) => {
        console.log('Erro na navegação', err);
      });
  }
}