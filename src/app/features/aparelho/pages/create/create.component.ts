import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';

import {
  takeUntilDestroyed,
  toSignal,
} from '@angular/core/rxjs-interop';

import { HttpErrorResponse } from '@angular/common/http';

import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import {
  ActivatedRoute,
  Router,
  RouterLink,
} from '@angular/router';

import { finalize } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PanelModule } from 'primeng/panel';
import { SelectModule } from 'primeng/select';

import { MarcaResponse } from '../../model/marca.dto';
import { MarcaService } from '../../services/marca.service';

import {
  TipoAparelhoResponse,
  TipoAparelhoService,
} from '../../services/tipo-aparelho.service';

import { AparelhoService } from '../../services/aparelho.service';

import { Cliente } from '../../../cliente/model/cliente-listar.dto';
import { ClienteService } from '../../../cliente/services/cliente.service';

export interface CadastroAparelho {
  clienteId: number;
  marcaId: number;
  modelo: string;
  modeloComercial: string;
  numeroSerie: string;
  descricao: string;
  tipoAparelhoId: number;
  defeito: string;
  observacao: string;
  fimGarantia: string | null;
}

@Component({
  selector: 'app-aparelho-create',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    PanelModule,
    SelectModule,
  ],
  templateUrl: './create.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateComponent implements OnInit {

  readonly clienteNome = input('');

  readonly salvando = signal(false);
  readonly erroSalvar = signal('');
  readonly salvo = signal(false);

  readonly tipos = signal<TipoAparelhoResponse[]>([]);
  readonly carregandoTipos = signal(false);
  readonly erroTipos = signal('');

  readonly marcas = signal<MarcaResponse[]>([]);
  readonly carregandoMarcas = signal(false);
  readonly erroMarcas = signal('');

  readonly cliente = signal<Cliente | null>(null);
  readonly carregandoCliente = signal(false);
  readonly erroCliente = signal('');

  private readonly aparelhoService = inject(AparelhoService);
  private readonly tipoAparelhoService = inject(TipoAparelhoService);
  private readonly marcaService = inject(MarcaService);
  private readonly clienteService = inject(ClienteService);

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  private readonly parametrosRota = toSignal(
    this.route.paramMap,
    {
      initialValue: this.route.snapshot.paramMap,
    },
  );

  readonly clienteId = computed<number | null>(() => {
    const parametro =
      this.parametrosRota()?.get('clienteId') ?? null;

    if (
      parametro === null ||
      !/^[1-9]\d*$/.test(parametro)
    ) {
      return null;
    }

    const id = Number(parametro);

    return Number.isSafeInteger(id)
      ? id
      : null;
  });

  readonly voltarPara = computed<string[]>(() => {
    const clienteId = this.clienteId();

    return clienteId === null
      ? ['/cliente']
      : ['/aparelho', String(clienteId)];
  });

  private readonly textoObrigatorio = [
    Validators.required,
    Validators.pattern(/\S/),
  ];

  readonly form = new FormGroup({
    marcaId: new FormControl<number | null>(
      null,
      {
        validators: [
          Validators.required,
          Validators.min(1),
        ],
      },
    ),

    modelo: new FormControl('', {
      nonNullable: true,
      validators: this.textoObrigatorio,
    }),

    modeloComercial: new FormControl('', {
      nonNullable: true,
    }),

    numeroSerie: new FormControl('', {
      nonNullable: true,
      validators: this.textoObrigatorio,
    }),

    descricao: new FormControl('', {
      nonNullable: true,
    }),

    tipoAparelhoId: new FormControl<number | null>(
      null,
      {
        validators: [
          Validators.required,
          Validators.min(1),
        ],
      },
    ),

    defeito: new FormControl('', {
      nonNullable: true,
      validators: this.textoObrigatorio,
    }),

    observacao: new FormControl('', {
      nonNullable: true,
    }),
  });

  ngOnInit(): void {
    this.carregarCliente();
    this.carregarMarcas();
    this.carregarTipos();
  }

  carregarCliente(): void {
    const clienteId = this.clienteId();

    if (clienteId === null) {
      this.cliente.set(null);
      this.erroCliente.set('Cliente inválido.');
      return;
    }

    if (this.carregandoCliente()) {
      return;
    }

    this.carregandoCliente.set(true);
    this.erroCliente.set('');

    this.clienteService
      .buscarPorId(clienteId)
      .pipe(
        finalize(() =>
          this.carregandoCliente.set(false),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: cliente => {
          this.cliente.set(cliente);
        },

        error: (erro: HttpErrorResponse) => {
          this.cliente.set(null);

          switch (erro.status) {
            case 401:
              this.erroCliente.set(
                'Sua sessão expirou. Entre novamente.',
              );
              break;

            case 403:
              this.erroCliente.set(
                'Você não tem permissão para consultar este cliente.',
              );
              break;

            case 404:
              this.erroCliente.set(
                'Cliente não encontrado.',
              );
              break;

            default:
              this.erroCliente.set(
                'Não foi possível carregar os dados do cliente.',
              );
          }
        },
      });
  }

  carregarTipos(): void {
    if (this.carregandoTipos()) {
      return;
    }

    this.carregandoTipos.set(true);
    this.erroTipos.set('');

    this.tipoAparelhoService
      .listarAtivos()
      .pipe(
        finalize(() =>
          this.carregandoTipos.set(false),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: tipos => {
          this.tipos.set(tipos);
        },

        error: (erro: HttpErrorResponse) => {
          this.tipos.set([]);

          switch (erro.status) {
            case 401:
              this.erroTipos.set(
                'Sua sessão expirou. Entre novamente.',
              );
              break;

            case 403:
              this.erroTipos.set(
                'Você não tem permissão para consultar tipos de aparelho.',
              );
              break;

            default:
              this.erroTipos.set(
                'Não foi possível carregar os tipos de aparelho.',
              );
          }
        },
      });
  }

  carregarMarcas(): void {
    if (this.carregandoMarcas()) {
      return;
    }

    this.carregandoMarcas.set(true);
    this.erroMarcas.set('');

    this.marcaService
      .listarAtivas()
      .pipe(
        finalize(() =>
          this.carregandoMarcas.set(false),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: marcas => {
          this.marcas.set(marcas);
        },

        error: (erro: HttpErrorResponse) => {
          this.marcas.set([]);

          switch (erro.status) {
            case 401:
              this.erroMarcas.set(
                'Sua sessão expirou. Entre novamente.',
              );
              break;

            case 403:
              this.erroMarcas.set(
                'Você não tem permissão para consultar marcas.',
              );
              break;

            default:
              this.erroMarcas.set(
                'Não foi possível carregar as marcas. Tente novamente.',
              );
          }
        },
      });
  }

  invalido(
    campo: keyof typeof this.form.controls,
  ): boolean {
    const controle = this.form.controls[campo];

    return controle.invalid && controle.touched;
  }

  salvar(): void {
    if (
      this.salvando() ||
      this.salvo() ||
      this.carregandoMarcas() ||
      this.carregandoTipos()
    ) {
      return;
    }

    this.erroSalvar.set('');
    this.form.markAllAsTouched();

    const clienteId = this.clienteId();
    const dados = this.form.getRawValue();

    if (clienteId === null) {
      this.erroSalvar.set(
        'Selecione um cliente válido.',
      );
      return;
    }

    if (
      this.form.invalid ||
      dados.marcaId === null ||
      dados.tipoAparelhoId === null
    ) {
      return;
    }

    const payload: CadastroAparelho = {
      clienteId,
      marcaId: dados.marcaId,
      tipoAparelhoId: dados.tipoAparelhoId,
      modelo: dados.modelo.trim(),
      modeloComercial: dados.modeloComercial.trim(),
      numeroSerie: dados.numeroSerie.trim(),
      descricao: dados.descricao.trim(),
      defeito: dados.defeito.trim(),
      observacao: dados.observacao.trim(),
      fimGarantia: null,
    };

    this.salvando.set(true);

    this.aparelhoService
      .salvar(payload)
      .pipe(
        finalize(() =>
          this.salvando.set(false),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.salvo.set(true);

          void this.abrirHistorico(
            clienteId,
          );
        },

        error: (erro: HttpErrorResponse) => {
          switch (erro.status) {
            case 400:
            case 422:
              this.erroSalvar.set(
                'O cadastro foi rejeitado. Confira os campos e se a marca e o tipo estão ativos.',
              );
              break;

            case 401:
              this.erroSalvar.set(
                'Sua sessão expirou. Entre novamente.',
              );
              break;

            case 403:
              this.erroSalvar.set(
                'Você não tem permissão para cadastrar aparelhos.',
              );
              break;

            case 404:
              this.erroSalvar.set(
                erro.error?.detail ??
                  'Cliente ou recurso de cadastro não encontrado.',
              );
              break;

            case 409:
              this.erroSalvar.set(
                'O cadastro conflita com um registro existente.',
              );
              break;

            default:
              this.erroSalvar.set(
                'Não foi possível confirmar o cadastro. Consulte o histórico antes de tentar novamente.',
              );
          }
        },
      });
  }

  private async abrirHistorico(
    clienteId: number,
  ): Promise<void> {
    try {
      const navegou =
        await this.router.navigate([
          '/aparelho',
          clienteId,
        ]);

      if (!navegou) {
        this.erroSalvar.set(
          'Aparelho salvo. Clique em Voltar ao histórico.',
        );
      }
    } catch {
      this.erroSalvar.set(
        'Aparelho salvo, mas não foi possível abrir o histórico. Clique em Voltar ao histórico.',
      );
    }
  }
}