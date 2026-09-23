import {
  Component,
  DestroyRef,
  EventEmitter,
  Output,
  inject,
} from '@angular/core';

import {
  CommonModule,
} from '@angular/common';

import {
  ReactiveFormsModule,
} from '@angular/forms';

import {
  HttpErrorResponse,
} from '@angular/common/http';

import {
  Router,
} from '@angular/router';

import {
  takeUntilDestroyed,
} from '@angular/core/rxjs-interop';

import {
  EMPTY,
  catchError,
  finalize,
  switchMap,
  tap,
} from 'rxjs';

import {
  MessageService,
} from 'primeng/api';

import {
  ButtonModule,
} from 'primeng/button';

import {
  DividerModule,
} from 'primeng/divider';

import {
  InputMaskModule,
} from 'primeng/inputmask';

import {
  InputTextModule,
} from 'primeng/inputtext';

import {
  Panel,
} from 'primeng/panel';

import {
  ClienteService,
} from '../../services/cliente.service';

import {
  ClienteForm,
  ClienteFormFactoryService,
} from '../../services/cliente-form-factory-service';

import {
  ApiErrorResponse,
} from '../../model/api-error-response';

import {
  ToastModule,
} from 'primeng/toast';


@Component({
  selector: 'app-create',

  standalone: true,

   imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    DividerModule,
    InputTextModule,
    InputMaskModule,
    Panel,
    ToastModule,
  ],

   providers: [
    MessageService,
  ],

  templateUrl: './create.component.html',

  styleUrl: './create.component.css',
})
export class CreateComponent {

  @Output()
  readonly salvo =
    new EventEmitter<void>();


  private readonly destroyRef =
    inject(DestroyRef);

  private readonly clienteService =
    inject(ClienteService);

  private readonly messageService =
    inject(MessageService);

  private readonly formFactory =
    inject(ClienteFormFactoryService);

  private readonly router =
    inject(Router);


  readonly form: ClienteForm =
    this.formFactory.create();


  salvando = false;


  /**
   * Formata o nome digitado.
   *
   * Exemplo:
   *
   * samuel anderson melo silva
   *
   * Resultado:
   *
   * Samuel Anderson Melo Silva
   */
  formatarNome(): void {

    const control =
      this.form.controls.nome;

    const valor =
      control.value
        ?.trim()
        .replace(
          /\s+/g,
          ' ',
        );

    if (!valor) {
      return;
    }

    const nomeFormatado =
      valor
        .toLocaleLowerCase(
          'pt-BR',
        )
        .split(' ')
        .filter(Boolean)
        .map(
          (palavra) =>
            palavra
              .charAt(0)
              .toLocaleUpperCase(
                'pt-BR',
              ) +
            palavra.slice(1),
        )
        .join(' ');

    control.setValue(
      nomeFormatado,
      {
        emitEvent: false,
      },
    );

  }


  salvar(): void {

    /*
     * Evita envio duplicado.
     */
    if (this.salvando) {
      return;
    }


    /*
     * Garante o nome formatado
     * antes da validação/envio.
     */
    this.formatarNome();


    /*
     * Validação do formulário.
     */
    if (this.form.invalid) {

      this.form
        .markAllAsTouched();

      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail:
          'Preencha os campos obrigatórios corretamente.',
        life: 5000,
      });

      return;

    }


    /*
     * Cria o payload original.
     */
    const payloadOriginal =
      this.formFactory.toPayload(
        this.form,
      );


    /*
     * Remove máscaras antes de
     * enviar ao backend.
     *
     * CPF:
     *
     * 014.729.821-66
     *      ↓
     * 01472982166
     *
     * Telefone:
     *
     * (61) 99999-9999
     *      ↓
     * 61999999999
     */
    const payload = {

      ...payloadOriginal,

      cpf:
        payloadOriginal.cpf
          ?.replace(
            /\D/g,
            '',
          ) ?? '',

      telefone:
        payloadOriginal.telefone
          ?.replace(
            /\D/g,
            '',
          ) ?? '',

    };


    /*
     * Referência do campo CPF.
     */
    const cpfControl =
      this.form.controls.cpf;


    /*
     * Remove erros anteriores
     * retornados pelo backend.
     */
    if (
      cpfControl.hasError(
        'cpfExistente',
      ) ||
      cpfControl.hasError(
        'cpfInvalido',
      )
    ) {

      const erros = {
        ...cpfControl.errors,
      };

      delete erros[
        'cpfExistente'
      ];

      delete erros[
        'cpfInvalido'
      ];

      cpfControl.setErrors(
        Object.keys(erros).length > 0
          ? erros
          : null,
      );

    }


    this.salvando =
      true;


    /*
     * Primeiro verifica se o CPF
     * já está cadastrado.
     */
    this.clienteService
      .existePorCpf(
        payload.cpf,
      )
      .pipe(

        switchMap(
          (
            existe,
          ) => {

            /*
             * CPF já cadastrado.
             */
            if (existe) {

              cpfControl.setErrors({
                ...cpfControl.errors,
                cpfExistente: true,
              });

              cpfControl
                .markAsTouched();


              this.messageService.add({
                severity: 'warn',

                summary:
                  'Cliente já cadastrado',

                detail:
                  'Já existe um cliente cadastrado com este CPF.',

                life: 5000,
              });


              return EMPTY;

            }


            /*
             * CPF não cadastrado.
             *
             * O backend fará também
             * a validação dos dígitos
             * verificadores do CPF.
             */
            return this.clienteService
              .salvar(
                payload,
              );

          },
        ),


        tap(
          (
            cliente,
          ) => {

            /*
             * Garante que o backend
             * retornou clienteId.
             */
            if (
              !cliente ||
              !cliente.clienteId
            ) {

              throw new Error(
                'Cliente cadastrado, mas o backend não retornou clienteId.',
              );

            }


            const clienteId =
              cliente.clienteId;


            console.log(
              'Cliente criado:',
              cliente,
            );


            this.messageService.add({
              severity: 'success',

              summary:
                'Sucesso',

              detail:
                'Cliente cadastrado com sucesso.',

              life: 4000,
            });


            /*
             * Informa outros componentes
             * que o cliente foi salvo.
             */
            this.salvo.emit();


            /*
             * Direciona para o cadastro
             * de aparelho do cliente.
             */
            void this.router.navigate(
              [
                '/aparelho',
                'create',
                clienteId,
              ],
            );

          },
        ),


        catchError(
          (
            error:
              HttpErrorResponse |
              Error,
          ) => {

            console.error(
              'Erro ao cadastrar cliente:',
              error,
            );


            /*
             * Erros HTTP retornados
             * pelo backend.
             */
            if (
              error instanceof
                HttpErrorResponse
            ) {

              /*
               * 400 - Dados inválidos.
               *
               * Exemplo:
               *
               * {
               *   "status": 400,
               *   "title": "Dados inválidos",
               *   "detail": "CPF inválido."
               * }
               */
              if (
                error.status === 400
              ) {

                const mensagem =
                  this.obterDetalheErro(
                    error,
                    'Não foi possível cadastrar o cliente.',
                  );


                /*
                 * Se o erro estiver
                 * relacionado ao CPF,
                 * marca o campo.
                 */
                if (
                  mensagem
                    .toLowerCase()
                    .includes(
                      'cpf',
                    )
                ) {

                  cpfControl.setErrors({
                    ...cpfControl.errors,
                    cpfInvalido: true,
                  });

                  cpfControl
                    .markAsTouched();

                }


                /*
                 * Mesmo padrão do Edit:
                 *
                 * 400 utiliza severity
                 * padrão = error.
                 */
                this.exibirErroApi(
                  error,
                  'Dados inválidos',
                  'Não foi possível cadastrar o cliente.',
                );


                return EMPTY;

              }


              /*
               * 409 - CPF duplicado.
               */
              if (
                error.status === 409
              ) {

                cpfControl.setErrors({
                  ...cpfControl.errors,
                  cpfExistente: true,
                });

                cpfControl
                  .markAsTouched();


                this.exibirErroApi(
                  error,
                  'Cliente já cadastrado',
                  'Já existe um cliente cadastrado com este CPF.',
                  'warn',
                );


                return EMPTY;

              }


              /*
               * 401 - Sessão expirada.
               */
              if (
                error.status === 401
              ) {

                this.exibirErroApi(
                  error,
                  'Sessão expirada',
                  'Entre novamente para continuar.',
                );


                return EMPTY;

              }


              /*
               * 403 - Sem permissão.
               */
              if (
                error.status === 403
              ) {

                this.exibirErroApi(
                  error,
                  'Acesso negado',
                  'Você não tem permissão para cadastrar clientes.',
                );


                return EMPTY;

              }


              /*
               * Outros erros HTTP.
               */
              this.exibirErroApi(
                error,
                'Erro ao cadastrar cliente',
                'Não foi possível cadastrar o cliente.',
              );


              return EMPTY;

            }


            /*
             * Cliente foi cadastrado,
             * mas o backend não retornou
             * clienteId.
             */
            if (
              error instanceof Error &&
              error.message.includes(
                'clienteId',
              )
            ) {

              this.messageService.add({
                severity: 'error',

                summary:
                  'Erro ao redirecionar',

                detail:
                  'O cliente foi cadastrado, mas não foi possível identificar o ID retornado pelo servidor.',

                life: 5000,
              });


              return EMPTY;

            }


            /*
             * Erro inesperado do front.
             */
            this.messageService.add({
              severity: 'error',

              summary:
                'Erro',

              detail:
                'Não foi possível cadastrar o cliente.',

              life: 5000,
            });


            return EMPTY;

          },
        ),


        finalize(
          () => {

            this.salvando =
              false;

          },
        ),


        takeUntilDestroyed(
          this.destroyRef,
        ),

      )
      .subscribe();

  }


  /**
   * Extrai a mensagem real
   * retornada pelo backend.
   */
  private obterDetalheErro(
    error: HttpErrorResponse,
    fallback: string,
  ): string {

    const body =
      error.error;


    /*
     * Backend retornou texto.
     */
    if (
      typeof body === 'string'
    ) {

      const mensagem =
        body.trim();

      return mensagem ||
        fallback;

    }


    /*
     * Backend retornou JSON.
     */
    if (
      body &&
      typeof body === 'object'
    ) {

      const apiError =
        body as ApiErrorResponse;


      if (
        apiError.detail?.trim()
      ) {

        return apiError.detail
          .trim();

      }


      if (
        apiError.message?.trim()
      ) {

        return apiError.message
          .trim();

      }

    }


    return fallback;

  }


  /**
   * Exibe no Toast global a
   * mensagem real retornada
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
     * Backend retornou texto puro.
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

        detail =
          mensagem;

      }

    }


    /*
     * Backend retornou JSON.
     *
     * Exemplo:
     *
     * {
     *   "title": "Dados inválidos",
     *   "detail": "CPF inválido."
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


    /*
     * Usa o Toast global
     * da aplicação.
     */
    this.messageService.add({
      severity,
      summary,
      detail,
      life: 6000,
    });

  }

}