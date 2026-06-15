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

import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { Panel } from 'primeng/panel';

import { ClienteService } from '../../services/cliente.service';

import { ClienteForm, ClienteFormFactoryService } from '../../services/cliente-form-factory-service';

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
  ],

  templateUrl: './create.component.html',

  styleUrl: './create.component.css',
})
export class CreateComponent {

  @Output()
  readonly salvo = new EventEmitter<void>();

  private readonly destroyRef = inject(DestroyRef);

  private readonly clienteService = inject(ClienteService);

  private readonly messageService = inject(MessageService);

  private readonly formFactory = inject(
    ClienteFormFactoryService,
  );

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

    this.clienteService
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
}