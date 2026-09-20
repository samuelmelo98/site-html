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
          'Preencha os campos obrigatórios corretamente',
        });
        
        return;
      }
      
      /*
      * Cria o payload.
      */
      const payload =
      this.formFactory.toPayload(
        this.form,
      );
      
      this.salvando = true;
      
      /*
      * Primeiro verifica se o CPF
      * já está cadastrado.
      */
      this.clienteService
      .existePorCpf(
        payload.cpf,
      )
      .pipe(
        
        switchMap((existe) => {
          
          /*
          * CPF já cadastrado.
          */
          if (existe) {
            
            const cpfControl =
            this.form.controls.cpf;
            
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
          * Pode criar o cliente.
          */
          return this.clienteService
          .salvar(payload);
        }),
        
        tap((cliente) => {
          
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
            'Cliente cadastrado com sucesso',
          });
          
          /*
          * Informa outros componentes
          * que o cliente foi salvo.
          */
          this.salvo.emit();
          
          /*
          * Direciona para:
          *
          * /aparelho/create?clienteId=9
          */
          void this.router.navigate(
            [
              '/aparelho',
              'create',
              clienteId,
            ],
          );
        }),
        
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
            * CPF duplicado detectado
            * pelo backend/banco.
            */
            if (
              err instanceof HttpErrorResponse &&
              err.status === 409
            ) {
              
              const cpfControl =
              this.form.controls.cpf;
              
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
            * Backend cadastrou mas não
            * retornou clienteId.
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
        
        finalize(() => {
          
          this.salvando = false;
          
        }),
        
        takeUntilDestroyed(
          this.destroyRef,
        ),
      )
      .subscribe();
    }
  }