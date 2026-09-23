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
  HttpErrorResponse,
} from '@angular/common/http';

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
  InputMaskModule,
} from 'primeng/inputmask';

import {
  ClienteService,
} from '../../services/cliente.service';

import {
  Cliente,
} from '../../model/cliente-listar.dto';

import {
  ClienteAtualizarDTO,
} from '../../model/cliente-atualizar.dto';


interface ApiErrorResponse {
  title?: string;
  detail?: string;
  message?: string;
  status?: number;
  instance?: string;
  path?: string;
}


@Component({
  selector: 'app-edit',

  standalone: true,

  imports: [
    ReactiveFormsModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    InputMaskModule,
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
        [
          Validators.required,
        ],
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

    if (!this.clienteId) {
      return;
    }


    this.carregando = true;

    this.clienteOriginal = null;


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
              this.somenteNumeros(
                cliente.cpf,
              ),

            telefone:
              this.somenteNumeros(
                cliente.telefone,
              ),

          });


          this.carregando = false;

        },


        error: (
          error: HttpErrorResponse,
        ) => {

          this.carregando = false;


          this.exibirErroApi(
            error,
            'Erro',
            'Não foi possível carregar os dados do cliente.',
          );

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


    if (cpf.length !== 11) {

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


    this.salvando = true;


    this.clienteService
      .editar(
        this.clienteId,
        dto,
      )
      .subscribe({

        next: (
          cliente,
        ) => {

          this.salvando = false;


          this.messageService.add({

            severity: 'success',

            summary: 'Sucesso',

            detail:
              'Cliente atualizado com sucesso.',

            life: 4000,

          });


          this.atualizado.emit(
            cliente,
          );


          this.fechar();

        },


        error: (
          error: HttpErrorResponse,
        ) => {

          this.salvando = false;


          /*
           * Exemplo retornado pelo backend:
           *
           * {
           *   "title": "Dados inválidos",
           *   "detail": "CPF inválido.",
           *   "status": 400
           * }
           */


          if (error.status === 409) {

            this.exibirErroApi(
              error,
              'CPF já cadastrado',
              'Este CPF já pertence a outro cliente.',
              'warn',
            );

            return;

          }


          this.exibirErroApi(
            error,
            'Erro',
            'Não foi possível atualizar o cliente.',
          );

        },

      });

  }


  /**
   * Exibe no Toast a mensagem REAL retornada
   * pelo backend.
   *
   * Prioridade:
   *
   * summary:
   *   error.error.title
   *
   * detail:
   *   error.error.detail
   *   error.error.message
   *   resposta String
   *   fallback
   */
  private exibirErroApi(
    error: HttpErrorResponse,
    summaryFallback: string,
    detailFallback: string,
    severity:
      'error' |
      'warn' = 'error',
  ): void {

    const body =
      error.error;


    let summary =
      summaryFallback;

    let detail =
      detailFallback;


    /*
     * Backend retornou apenas texto.
     *
     * Exemplo:
     *
     * "CPF inválido."
     */
    if (
      typeof body === 'string'
    ) {

      const mensagem =
        body.trim();


      if (mensagem) {
        detail = mensagem;
      }

    }


    /*
     * Backend retornou JSON.
     *
     * Exemplo:
     *
     * {
     *   title: "Dados inválidos",
     *   detail: "CPF inválido."
     * }
     */
    if (
      body &&
      typeof body === 'object'
    ) {

      const apiError =
        body as ApiErrorResponse;


      if (
        apiError.title?.trim()
      ) {

        summary =
          apiError.title.trim();

      }


      if (
        apiError.detail?.trim()
      ) {

        detail =
          apiError.detail.trim();

      } else if (
        apiError.message?.trim()
      ) {

        detail =
          apiError.message.trim();

      }

    }


    this.messageService.add({

      severity,

      summary,

      detail,

      life: 6000,

    });

  }


  fechar(): void {

    if (this.salvando) {
      return;
    }


    this.visible = false;


    this.visibleChange.emit(
      false,
    );


    this.form.reset();

    this.clienteOriginal = null;

  }


  onVisibleChange(
    visible: boolean,
  ): void {

    this.visible =
      visible;


    this.visibleChange.emit(
      visible,
    );


    if (!visible) {

      this.form.reset();

      this.clienteOriginal = null;

    }

  }


  private somenteNumeros(
    valor?: string | null,
  ): string {

    return (
      valor ?? ''
    ).replace(
      /\D/g,
      '',
    );

  }

}