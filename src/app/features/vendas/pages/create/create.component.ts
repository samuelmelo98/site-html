import {
  CurrencyPipe,
} from '@angular/common';

import {
  HttpErrorResponse,
} from '@angular/common/http';

import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';

import {
  takeUntilDestroyed,
  toSignal,
} from '@angular/core/rxjs-interop';

import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import {
  ActivatedRoute,
  Router,
} from '@angular/router';

import {
  finalize,
  startWith,
} from 'rxjs';

import {
  MessageService,
} from 'primeng/api';

import {
  AutoCompleteModule,
} from 'primeng/autocomplete';

import {
  ButtonModule,
} from 'primeng/button';

import {
  InputNumberModule,
} from 'primeng/inputnumber';

import {
  InputTextModule,
} from 'primeng/inputtext';

import {
  ProgressSpinnerModule,
} from 'primeng/progressspinner';

import {
  TextareaModule,
} from 'primeng/textarea';

import {
  ClienteOpcaoDTO,
} from '../../model/cliente-opcao.dto';

import {
  ClienteService,
} from '../../../cliente/services/cliente.service';

import {
  VendaRequestDTO,
} from '../../model/venda.dto';

import {
  VendaService,
} from '../../services/venda.service';


interface VendaItemForm {

  descricao:
    FormControl<string>;

  quantidade:
    FormControl<number>;

  valorUnitario:
    FormControl<number>;

  desconto:
    FormControl<number>;

}


@Component({
  selector: 'app-venda-create',

  standalone: true,

  imports: [
    CurrencyPipe,
    ReactiveFormsModule,
    AutoCompleteModule,
    ButtonModule,
    InputNumberModule,
    InputTextModule,
    ProgressSpinnerModule,
    TextareaModule,
  ],

  templateUrl:
    './create.component.html',

  styleUrl:
    './create.component.css',

  changeDetection:
    ChangeDetectionStrategy.OnPush,
})
export class CreateComponent
  implements OnInit {


  /*
   * DEPENDENCIAS
   */

  private readonly fb =
    inject(FormBuilder);

  private readonly vendaService =
    inject(VendaService);

  private readonly clienteService =
    inject(ClienteService);

  private readonly messageService =
    inject(MessageService);

  private readonly router =
    inject(Router);

  private readonly route =
    inject(ActivatedRoute);

  private readonly destroyRef =
    inject(DestroyRef);


  /*
   * VENDA
   */

  readonly vendaId =
    signal<number | null>(
      null,
    );

  readonly carregando =
    signal(false);

  readonly salvando =
    signal(false);

  readonly erro =
    signal('');


  /*
   * CLIENTES
   */

  readonly clientes =
    signal<ClienteOpcaoDTO[]>(
      [],
    );

  readonly clientesFiltrados =
    signal<ClienteOpcaoDTO[]>(
      [],
    );

  readonly carregandoClientes =
    signal(false);

  readonly erroClientes =
    signal('');

  readonly clienteSelecionadoControl =
    new FormControl<ClienteOpcaoDTO | null>(
      null,
    );


  /*
   * FORMULARIO
   */

  readonly form =
    this.fb.group({

      clienteId:
        this.fb.control<number | null>(
          null,
          [
            Validators.min(1),
          ],
        ),

      desconto:
        this.fb.nonNullable.control(
          0,
          [
            Validators.min(0),
          ],
        ),

      observacao:
        this.fb.nonNullable.control(
          '',
          [
            Validators.maxLength(2000),
          ],
        ),

      itens:
        this.fb.array<
          FormGroup<VendaItemForm>
        >([
          this.criarItemForm(),
        ]),

    });


  private readonly formValue =
    toSignal(
      this.form.valueChanges.pipe(
        startWith(
          this.form.getRawValue(),
        ),
      ),
      {
        initialValue:
          this.form.getRawValue(),
      },
    );


  /*
   * COMPUTADOS
   */

  readonly modoEdicao =
    computed(
      () =>
        this.vendaId() !== null,
    );

  readonly titulo =
    computed(
      () =>
        this.modoEdicao()
          ? 'Editar venda'
          : 'Nova venda',
    );

  readonly subtotal =
    computed(() => {

      const itens =
        this.formValue().itens ?? [];

      return itens.reduce(
        (
          total,
          item,
        ) => {

          const quantidade =
            Number(
              item.quantidade ?? 0,
            );

          const valorUnitario =
            Number(
              item.valorUnitario ?? 0,
            );

          return (
            total +
            quantidade *
            valorUnitario
          );
        },
        0,
      );
    });

  readonly descontoItens =
    computed(() => {

      const itens =
        this.formValue().itens ?? [];

      return itens.reduce(
        (
          total,
          item,
        ) =>
          total +
          Number(
            item.desconto ?? 0,
          ),
        0,
      );
    });

  readonly total =
    computed(() => {

      const descontoVenda =
        Number(
          this.formValue()
            .desconto ?? 0,
        );

      return Math.max(
        0,
        this.subtotal() -
          this.descontoItens() -
          descontoVenda,
      );
    });


  get itens():
    FormArray<FormGroup<VendaItemForm>> {

    return this.form.controls.itens;
  }


  /*
   * INICIALIZACAO
   */

  ngOnInit(): void {

    this.carregarClientes();

    const parametro =
      this.route.snapshot
        .paramMap
        .get(
          'vendaId',
        );

    if (
      parametro === null
    ) {
      return;
    }

    if (
      !/^[1-9]\d*$/.test(
        parametro,
      )
    ) {

      this.erro.set(
        'Identificador da venda inválido.',
      );

      return;
    }

    const vendaId =
      Number(
        parametro,
      );

    if (
      !Number.isSafeInteger(
        vendaId,
      )
    ) {

      this.erro.set(
        'Identificador da venda inválido.',
      );

      return;
    }

    this.vendaId.set(
      vendaId,
    );

    this.carregarVenda(
      vendaId,
    );
  }


  /*
   * CLIENTES
   */

  filtrarClientes(
    event: {
      query: string;
    },
  ): void {

    const termo =
      this.normalizar(
        event.query,
      );

    if (!termo) {

      this.clientesFiltrados.set(
        this.clientes(),
      );

      return;
    }

    const filtrados =
      this.clientes()
        .filter(
          cliente =>
            this.normalizar(
              cliente.nome,
            ).includes(
              termo,
            ),
        );

    this.clientesFiltrados.set(
      filtrados,
    );
  }


  selecionarCliente(
    cliente: ClienteOpcaoDTO,
  ): void {

    this.clienteSelecionadoControl
      .setValue(
        cliente,
        {
          emitEvent: false,
        },
      );

    this.form.controls
      .clienteId
      .setValue(
        cliente.clienteId,
      );

    this.form.controls
      .clienteId
      .markAsDirty();

    this.erroClientes.set(
      '',
    );
  }


  limparCliente(): void {

    this.clienteSelecionadoControl
      .setValue(
        null,
        {
          emitEvent: false,
        },
      );

    this.form.controls
      .clienteId
      .setValue(
        null,
      );

    this.form.controls
      .clienteId
      .markAsDirty();
  }


  /*
   * ITENS
   */

  adicionarItem(): void {

    if (
      this.salvando()
    ) {
      return;
    }

    this.itens.push(
      this.criarItemForm(),
    );

    this.form.markAsDirty();
  }


  removerItem(
    index: number,
  ): void {

    if (
      this.salvando() ||
      this.itens.length <= 1
    ) {
      return;
    }

    if (
      !Number.isInteger(
        index,
      ) ||
      index < 0 ||
      index >= this.itens.length
    ) {
      return;
    }

    this.itens.removeAt(
      index,
    );

    this.form.markAsDirty();
  }


  /*
   * SALVAR
   */

  salvar(): void {

    if (
      this.salvando()
    ) {
      return;
    }

    if (
      this.form.invalid ||
      this.itens.length === 0
    ) {

      this.form.markAllAsTouched();

      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail:
          'Preencha os campos obrigatórios da venda.',
      });

      return;
    }

    const validacao =
      this.validarValores();

    if (validacao) {

      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: validacao,
      });

      return;
    }

    const payload =
      this.mapearPayload();

    const vendaId =
      this.vendaId();

    const requisicao =
      vendaId === null
        ? this.vendaService
            .criar(
              payload,
            )
        : this.vendaService
            .atualizar(
              vendaId,
              payload,
            );

    this.salvando.set(
      true,
    );

    this.erro.set(
      '',
    );

    requisicao
      .pipe(
        finalize(
          () =>
            this.salvando.set(
              false,
            ),
        ),

        takeUntilDestroyed(
          this.destroyRef,
        ),
      )
      .subscribe({

        next: venda => {

          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail:
              this.modoEdicao()
                ? 'Venda atualizada com sucesso.'
                : 'Venda registrada com sucesso.',
          });

          this.router.navigate(
            [
              '/vendas',
              venda.vendaId,
            ],
          );
        },

        error: (
          erro: HttpErrorResponse,
        ) => {

          const mensagem =
            this.mensagemErro(
              erro,
              'Não foi possível salvar a venda.',
            );

          this.erro.set(
            mensagem,
          );

          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: mensagem,
          });
        },

      });
  }


  voltar(): void {

    const vendaId =
      this.vendaId();

    if (
      vendaId !== null
    ) {

      this.router.navigate(
        [
          '/vendas',
          vendaId,
        ],
      );

      return;
    }

    this.router.navigate(
      [
        '/vendas/listar',
      ],
    );
  }


  /*
   * HELPERS DA TELA
   */

  campoInvalido(
    controle:
      AbstractControl | null,
  ): boolean {

    return Boolean(
      controle &&
      controle.invalid &&
      (
        controle.dirty ||
        controle.touched
      ),
    );
  }


  valorTotalItem(
    index: number,
  ): number {

    const item =
      this.itens.at(
        index,
      );

    if (!item) {
      return 0;
    }

    const quantidade =
      Number(
        item.controls
          .quantidade
          .value ?? 0,
      );

    const valorUnitario =
      Number(
        item.controls
          .valorUnitario
          .value ?? 0,
      );

    const desconto =
      Number(
        item.controls
          .desconto
          .value ?? 0,
      );

    return Math.max(
      0,
      quantidade *
        valorUnitario -
        desconto,
    );
  }


  /*
   * FORM ITEM
   */

  private criarItemForm(
    item?: {
      descricao?: string;
      quantidade?: number;
      valorUnitario?: number;
      desconto?: number;
    },
  ): FormGroup<VendaItemForm> {

    return this.fb.group({
      descricao:
        this.fb.nonNullable.control(
          item?.descricao ?? '',
          [
            Validators.required,
            Validators.maxLength(
              255,
            ),
          ],
        ),

      quantidade:
        this.fb.nonNullable.control(
          item?.quantidade ?? 1,
          [
            Validators.required,
            Validators.min(
              0.01,
            ),
          ],
        ),

      valorUnitario:
        this.fb.nonNullable.control(
          item?.valorUnitario ?? 0,
          [
            Validators.required,
            Validators.min(
              0,
            ),
          ],
        ),

      desconto:
        this.fb.nonNullable.control(
          item?.desconto ?? 0,
          [
            Validators.min(
              0,
            ),
          ],
        ),
    });
  }


  /*
   * CARREGAR VENDA
   */

  private carregarVenda(
    vendaId: number,
  ): void {

    this.carregando.set(
      true,
    );

    this.erro.set(
      '',
    );

    this.vendaService
      .buscar(
        vendaId,
      )
      .pipe(
        finalize(
          () =>
            this.carregando.set(
              false,
            ),
        ),

        takeUntilDestroyed(
          this.destroyRef,
        ),
      )
      .subscribe({

        next: venda => {

          if (
            venda.status !== 'ABERTA'
          ) {

            this.erro.set(
              'Somente vendas abertas podem ser editadas.',
            );

            return;
          }

          this.form.patchValue({
            clienteId:
              venda.clienteId,

            desconto:
              venda.desconto,

            observacao:
              venda.observacao ?? '',
          });

          this.sincronizarClienteSelecionado();

          this.itens.clear();

          for (
            const item of venda.itens
          ) {

            this.itens.push(
              this.criarItemForm({
                descricao:
                  item.descricao,

                quantidade:
                  item.quantidade,

                valorUnitario:
                  item.valorUnitario,

                desconto:
                  item.desconto,
              }),
            );
          }

          if (
            this.itens.length === 0
          ) {

            this.itens.push(
              this.criarItemForm(),
            );
          }

          this.form.markAsPristine();
        },

        error: (
          erro: HttpErrorResponse,
        ) => {

          this.erro.set(
            this.mensagemErro(
              erro,
              'Não foi possível carregar a venda.',
            ),
          );
        },

      });
  }


  /*
   * CARREGAR CLIENTES
   */

  private carregarClientes(): void {

    this.carregandoClientes.set(
      true,
    );

    this.erroClientes.set(
      '',
    );

    this.clienteService
      .listarOpcoes()
      .pipe(
        finalize(
          () =>
            this.carregandoClientes.set(
              false,
            ),
        ),

        takeUntilDestroyed(
          this.destroyRef,
        ),
      )
      .subscribe({

        next: clientes => {

          this.clientes.set(
            clientes,
          );

          this.clientesFiltrados.set(
            clientes,
          );

          /*
           * Em edição, venda e clientes
           * podem terminar de carregar
           * em qualquer ordem.
           */
          this.sincronizarClienteSelecionado();
        },

        error: (
          erro: HttpErrorResponse,
        ) => {

          this.clientes.set(
            [],
          );

          this.clientesFiltrados.set(
            [],
          );

          this.erroClientes.set(
            this.mensagemErro(
              erro,
              'Não foi possível carregar os clientes.',
            ),
          );
        },

      });
  }


  private sincronizarClienteSelecionado():
    void {

    const clienteId =
      this.form.controls
        .clienteId.value;

    if (
      clienteId === null ||
      clienteId === undefined
    ) {

      this.clienteSelecionadoControl
        .setValue(
          null,
          {
            emitEvent: false,
          },
        );

      return;
    }

    const cliente =
      this.clientes()
        .find(
          item =>
            item.clienteId ===
            clienteId,
        ) ?? null;

    this.clienteSelecionadoControl
      .setValue(
        cliente,
        {
          emitEvent: false,
        },
      );
  }


  /*
   * VALIDACOES
   */

  private validarValores():
    string | null {

    const itens =
      this.itens.getRawValue();

    for (
      let i = 0;
      i < itens.length;
      i++
    ) {

      const item =
        itens[i];

      const bruto =
        Number(
          item.quantidade ?? 0,
        ) *
        Number(
          item.valorUnitario ?? 0,
        );

      const desconto =
        Number(
          item.desconto ?? 0,
        );

      if (
        desconto > bruto
      ) {

        return (
          `O desconto do item ${i + 1} ` +
          'não pode ser maior que seu valor bruto.'
        );
      }
    }

    const totalAposItens =
      this.subtotal() -
      this.descontoItens();

    const descontoVenda =
      Number(
        this.form.controls
          .desconto.value ?? 0,
      );

    if (
      descontoVenda >
      totalAposItens
    ) {

      return (
        'O desconto geral não pode ser maior ' +
        'que o valor dos itens.'
      );
    }

    return null;
  }


  /*
   * PAYLOAD
   */

  private mapearPayload():
    VendaRequestDTO {

    const raw =
      this.form.getRawValue();

    return {
      clienteId:
        raw.clienteId ?? null,

      desconto:
        Number(
          raw.desconto ?? 0,
        ),

      observacao:
        raw.observacao
          ?.trim() || null,

      itens:
        raw.itens.map(
          item => ({
            descricao:
              String(
                item.descricao ?? '',
              ).trim(),

            quantidade:
              Number(
                item.quantidade ?? 0,
              ),

            valorUnitario:
              Number(
                item.valorUnitario ?? 0,
              ),

            desconto:
              Number(
                item.desconto ?? 0,
              ),
          }),
        ),
    };
  }


  /*
   * NORMALIZACAO
   */

  private normalizar(
    valor:
      string | null | undefined,
  ): string {

    return (
      valor ?? ''
    )
      .normalize(
        'NFD',
      )
      .replace(
        /[\u0300-\u036f]/g,
        '',
      )
      .toLowerCase()
      .trim();
  }


  /*
   * ERROS
   */

  private mensagemErro(
    erro: HttpErrorResponse,
    padrao: string,
  ): string {

    const mensagem =
      erro.error?.message ??
      erro.error?.mensagem ??
      erro.error?.detail;

    if (
      typeof mensagem === 'string' &&
      mensagem.trim()
    ) {
      return mensagem;
    }

    switch (
      erro.status
    ) {

      case 401:
        return (
          'Sua sessão expirou. ' +
          'Entre novamente.'
        );

      case 403:
        return (
          'Você não tem permissão ' +
          'para executar esta operação.'
        );

      case 404:
        return (
          'Registro não encontrado.'
        );

      case 409:
        return (
          'A operação não pôde ser concluída ' +
          'no estado atual da venda.'
        );

      default:
        return padrao;
    }
  }

}
