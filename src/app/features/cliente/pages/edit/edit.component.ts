import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject,
} from '@angular/core';

import {
  CommonModule,
} from '@angular/common';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import {
  DialogModule,
} from 'primeng/dialog';

import {
  ButtonModule,
} from 'primeng/button';

import {
  InputTextModule,
} from 'primeng/inputtext';

import {
  ProgressSpinnerModule,
} from 'primeng/progressspinner';

import {
  ToastModule,
} from 'primeng/toast';

import {
  MessageService,
} from 'primeng/api';

import {
  ClienteService,
} from '../../services/cliente.service';

import {
  Cliente,
} from '../../model/cliente-listar.dto';

import {
  ClienteAtualizarDTO,
} from '../../model/cliente-atualizar.dto';


@Component({

  selector: 'app-edit',

  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    ProgressSpinnerModule,
    ToastModule,
  ],

  providers: [
    MessageService,
  ],

  templateUrl: './edit.component.html',

  styleUrl: './edit.component.css',

})
export class EditComponent
  implements OnChanges {

  @Input()
  visible = false;


  @Input()
  clienteId: number | null = null;


  @Output()
  visibleChange =
    new EventEmitter<boolean>();


  @Output()
  atualizado =
    new EventEmitter<Cliente>();


  private readonly fb =
    inject(FormBuilder);

  private readonly clienteService =
    inject(ClienteService);

  private readonly messageService =
    inject(MessageService);


  clienteOriginal:
    Cliente | null = null;


  carregando = false;

  salvando = false;


  readonly form =
    this.fb.nonNullable.group({

      nome: [
        '',
        [
          Validators.required,
          Validators.maxLength(150),
        ],
      ],

      cpf: [
        '',
        [
          Validators.required,
        ],
      ],

      telefone: [
        '',
      ],

    });


  ngOnChanges(
    changes: SimpleChanges,
  ): void {

    const abriuModal =
      changes['visible'] &&
      this.visible;

    const mudouCliente =
      changes['clienteId'] &&
      this.visible;


    if (
      (abriuModal || mudouCliente) &&
      this.clienteId
    ) {

      this.carregarCliente();
    }
  }


  private carregarCliente(): void {

    if (
      !this.clienteId
    ) {
      return;
    }


    this.carregando =
      true;

    this.clienteOriginal =
      null;


    this.clienteService
      .buscarPorId(
        this.clienteId,
      )
      .subscribe({

        next: (
          cliente,
        ) => {

          this.clienteOriginal =
            cliente;


          this.form.reset({

            nome:
              cliente.nome ?? '',

            cpf:
              this.formatarCpf(
                cliente.cpf,
              ),

            telefone:
              this.formatarTelefone(
                cliente.telefone,
              ),

          });


          this.carregando =
            false;
        },


        error: () => {

          this.carregando =
            false;


          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail:
              'Não foi possível carregar os dados do cliente.',
          });

        },

      });
  }


  salvar(): void {

    if (
      this.form.invalid ||
      !this.clienteOriginal ||
      !this.clienteId
    ) {

      this.form
        .markAllAsTouched();

      return;
    }


    const valores =
      this.form
        .getRawValue();


    const cpf =
      this.somenteNumeros(
        valores.cpf,
      );


    if (
      cpf.length !== 11
    ) {

      this.form
        .controls
        .cpf
        .setErrors({
          cpfInvalido: true,
        });

      this.form
        .controls
        .cpf
        .markAsTouched();

      return;
    }


    const telefone =
      this.somenteNumeros(
        valores.telefone,
      );


    const dto:
      ClienteAtualizarDTO = {

        nome:
          valores.nome.trim(),

        cpf,

        telefone:
          telefone || null,


        /*
         * Esses campos não são editados
         * neste modal, mas precisam ser
         * preservados no PUT.
         */

        email:
          this.clienteOriginal.email,

        endereco:
          this.clienteOriginal.endereco,

        cidade:
          this.clienteOriginal.cidade,

        estado:
          this.clienteOriginal.estado,

        cep:
          this.clienteOriginal.cep,

      };


    this.salvando =
      true;


    this.clienteService
      .editar(
        this.clienteId,
        dto,
      )
      .subscribe({

        next: (
          cliente,
        ) => {

          this.salvando =
            false;


          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail:
              'Cliente atualizado com sucesso.',
          });


          this.atualizado.emit(
            cliente,
          );


          this.fechar();

        },


        error: (
          error,
        ) => {

          this.salvando =
            false;


          if (
            error.status === 409
          ) {

            this.messageService.add({
              severity: 'warn',
              summary:
                'CPF já cadastrado',
              detail:
                'Este CPF já pertence a outro cliente.',
            });

            return;
          }


          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail:
              'Não foi possível atualizar o cliente.',
          });

        },

      });
  }


  fechar(): void {

    if (
      this.salvando
    ) {
      return;
    }


    this.visible =
      false;


    this.visibleChange.emit(
      false,
    );


    this.form.reset();

    this.clienteOriginal =
      null;
  }


  onVisibleChange(
    visible: boolean,
  ): void {

    this.visible =
      visible;


    this.visibleChange.emit(
      visible,
    );


    if (
      !visible
    ) {

      this.form.reset();

      this.clienteOriginal =
        null;
    }
  }


  onCpfInput(
  event: Event,
): void {

  if (
    !(event.target instanceof HTMLInputElement)
  ) {
    return;
  }

  const input =
    event.target;

  const valor =
    this.formatarCpf(
      input.value,
    );

  input.value =
    valor;

  this.form
    .controls
    .cpf
    .setValue(
      valor,
      {
        emitEvent: false,
      },
    );
}


onTelefoneInput(
  event: Event,
): void {

  if (
    !(event.target instanceof HTMLInputElement)
  ) {
    return;
  }

  const input =
    event.target;

  const valor =
    this.formatarTelefone(
      input.value,
    );

  input.value =
    valor;

  this.form
    .controls
    .telefone
    .setValue(
      valor,
      {
        emitEvent: false,
      },
    );
}


  private somenteNumeros(
    valor?: string | null,
  ): string {

    return (
      valor ?? ''
    )
      .replace(
        /\D/g,
        '',
      );
  }


  private formatarCpf(
    valor?: string | null,
  ): string {

    const numeros =
      this.somenteNumeros(
        valor,
      )
        .slice(
          0,
          11,
        );


    return numeros
      .replace(
        /^(\d{3})(\d)/,
        '$1.$2',
      )
      .replace(
        /^(\d{3})\.(\d{3})(\d)/,
        '$1.$2.$3',
      )
      .replace(
        /\.(\d{3})(\d)/,
        '.$1-$2',
      );
  }


  private formatarTelefone(
    valor?: string | null,
  ): string {

    const numeros =
      this.somenteNumeros(
        valor,
      )
        .slice(
          0,
          11,
        );


    if (
      numeros.length <= 10
    ) {

      return numeros
        .replace(
          /^(\d{2})(\d)/,
          '($1) $2',
        )
        .replace(
          /(\d{4})(\d)/,
          '$1-$2',
        );
    }


    return numeros
      .replace(
        /^(\d{2})(\d)/,
        '($1) $2',
      )
      .replace(
        /(\d{5})(\d)/,
        '$1-$2',
      );
  }

}