  import {
    Component,
    DestroyRef,
    EventEmitter,
    Output,
    inject,
  } from '@angular/core';
  
  import { CommonModule } from '@angular/common';
  
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
      .replace(/\s+/g, ' ');
      
      if (!valor) {
        return;
      }
      
      const nomeFormatado =
      valor
      .toLocaleLowerCase('pt-BR')
      .split(' ')
      .filter(Boolean)
      .map(
        (palavra) =>
          palavra
        .charAt(0)
        .toLocaleUpperCase('pt-BR') +
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

    this.form.markAllAsTouched();

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
   * enviar para o backend.
   *
   * Exemplo:
   *
   * 014.729.821-66
   *      ↓
   * 01472982166
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
   * Remove erros de backend
   * anteriores do CPF.
   */
  const cpfControl =
    this.form.controls.cpf;


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

            cpfControl.markAsTouched();


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
           * O backend agora fará
           * também a validação real
           * dos dígitos verificadores.
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
           * retornou o ID do cliente.
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


          console.log(
            'Redirecionando para cadastro de aparelho. Cliente ID:',
            clienteId,
          );


          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
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
           * Direciona para:
           *
           * /aparelho/create/9
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
          err:
            HttpErrorResponse |
            Error,
        ) => {

          console.error(
            'Erro ao cadastrar cliente:',
            err,
          );


          /*
           * Erros HTTP retornados
           * pelo backend.
           */
          if (
            err instanceof
              HttpErrorResponse
          ) {

            const detalhe =
              err.error?.detail ??
              err.error?.message ??
              'Não foi possível cadastrar o cliente.';


            /*
             * 400 - Dados inválidos.
             *
             * Exemplo atual:
             *
             * {
             *   status: 400,
             *   title: "Dados inválidos",
             *   detail: "CPF inválido."
             * }
             */
            if (
              err.status === 400
            ) {

              const mensagem =
                String(
                  detalhe,
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


              this.messageService.add({
                severity: 'warn',

                summary:
                  err.error?.title ??
                  'Dados inválidos',

                detail:
                  mensagem,

                life: 5000,
              });


              return EMPTY;
            }


            /*
             * 409 - CPF duplicado.
             */
            if (
              err.status === 409
            ) {

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
                  detalhe ||
                  'Já existe um cliente cadastrado com este CPF.',

                life: 5000,
              });


              return EMPTY;
            }


            /*
             * Sessão expirada.
             */
            if (
              err.status === 401
            ) {

              this.messageService.add({
                severity: 'error',

                summary:
                  'Sessão expirada',

                detail:
                  'Entre novamente para continuar.',

                life: 5000,
              });


              return EMPTY;
            }


            /*
             * Sem permissão.
             */
            if (
              err.status === 403
            ) {

              this.messageService.add({
                severity: 'error',

                summary:
                  'Acesso negado',

                detail:
                  'Você não tem permissão para cadastrar clientes.',

                life: 5000,
              });


              return EMPTY;
            }


            /*
             * Outros erros HTTP.
             */
            this.messageService.add({
              severity: 'error',

              summary:
                'Erro ao cadastrar cliente',

              detail:
                String(
                  detalhe,
                ),

              life: 5000,
            });


            return EMPTY;
          }


          /*
           * Backend cadastrou,
           * mas não retornou clienteId.
           */
          if (
            err instanceof Error &&
            err.message.includes(
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
           * Erro inesperado no front.
           */
          this.messageService.add({
            severity: 'error',

            summary: 'Erro',

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
   
  }