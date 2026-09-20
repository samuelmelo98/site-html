import {
  CurrencyPipe,
  DatePipe,
} from '@angular/common';

import {
  HttpErrorResponse,
} from '@angular/common/http';

import {
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';

import {
  takeUntilDestroyed,
} from '@angular/core/rxjs-interop';

import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import {
  ActivatedRoute,
  Router,
} from '@angular/router';

import {
  finalize,
  forkJoin,
} from 'rxjs';

import {
  ButtonModule,
} from 'primeng/button';

import {
  TagModule,
} from 'primeng/tag';

import {
  OrdemServicoService,
} from '../../services/ordem-servico.service';

import {
  TecnicoService,
} from '../../services/tecnico.service';

import {
  OrdemServicoDetalheDTO,
} from '../../model/ordem-servico-detalhe.dto';

import {
  OrdemServicoOrcamentoResponseDTO,
} from '../../model/ordem-servico-orcamento.dto';

import {
  TecnicoDTO,
} from '../../model/tecnico.dto';


interface EtapaOS {
  codigo: string;
  titulo: string;
  icone: string;
}


@Component({
  selector: 'app-ordem-servico-detail',

  standalone: true,

  imports: [
    DatePipe,
    CurrencyPipe,
    ReactiveFormsModule,
    ButtonModule,
    TagModule,
  ],

  templateUrl: './detail.component.html',

  styleUrl: './detail.component.css',
})
export class DetailComponent
  implements OnInit {


  /*
   * DEPENDENCIAS
   */

  private readonly route =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);

  private readonly destroyRef =
    inject(DestroyRef);

  private readonly formBuilder =
    inject(FormBuilder);

  private readonly ordemServicoService =
    inject(OrdemServicoService);

  private readonly tecnicoService =
    inject(TecnicoService);


  /*
   * Recupera a OS enviada via Router NavigationExtras.
   *
   * Importante:
   * usamos getCurrentNavigation() em vez de history.state.
   *
   * Assim:
   *
   * - navegacao normal da lista -> reutiliza a OS retornada pelo POST;
   * - F5 -> nao usa estado antigo e consulta novamente o backend.
   */
  private readonly ordemRecebidaNaNavegacao =
    this.router
      .getCurrentNavigation()
      ?.extras
      .state?.['ordem'] as
        OrdemServicoDetalheDTO |
        undefined;


  /*
   * ESTADO GERAL
   */

  readonly carregando =
    signal(false);

  readonly erro =
    signal('');

  readonly ordem =
    signal<OrdemServicoDetalheDTO | null>(
      null,
    );

    readonly registrandoEntrega =
  signal(false);


  /*
   * ORCAMENTO
   */

  readonly mostrarFormularioOrcamento =
    signal(false);

  readonly salvandoOrcamento =
    signal(false);

  readonly enviandoOrcamento =
    signal(false);

  readonly orcamentoSalvo =
    signal<OrdemServicoOrcamentoResponseDTO | null>(
      null,
    );

  readonly mostrarAprovacao =
    signal(false);

  readonly processandoAprovacao =
    signal(false);


  /*
   * TECNICO
   */

  readonly mostrarSelecaoTecnico =
    signal(false);

  readonly carregandoTecnicos =
    signal(false);

  readonly atribuindoTecnico =
    signal(false);

  readonly tecnicos =
    signal<TecnicoDTO[]>([]);

  readonly tecnicoSelecionadoId =
    signal<number | null>(
      null,
    );


  /*
   * CONCLUSAO
   */

  readonly mostrarConclusao =
    signal(false);

  readonly concluindoServico =
    signal(false);


  /*
   * FORMULARIO DO ORCAMENTO
   */

  readonly formOrcamento =
    this.formBuilder.group({

      servicoProposto: [
        '',
        [
          Validators.required,
        ],
      ],

      valorMaoObra: [
        0,
        [
          Validators.min(0),
        ],
      ],

      valorPecas: [
        0,
        [
          Validators.min(0),
        ],
      ],

      desconto: [
        0,
        [
          Validators.min(0),
        ],
      ],

      observacao: [
        '',
      ],

    });


  /*
   * FORMULARIO DE CONCLUSAO
   */

  readonly formConclusao =
    this.formBuilder.group({

      solucao: [
        '',
        [
          Validators.required,
        ],
      ],

      valorFinal: [
        0,
        [
          Validators.required,
          Validators.min(0),
        ],
      ],

      observacao: [
        '',
      ],

    });


  /*
   * TIMELINE
   */

  readonly etapas: EtapaOS[] = [

    {
      codigo: 'ABERTA',
      titulo: 'Aberta',
      icone: 'pi pi-file',
    },

    {
      codigo: 'EM_ANALISE',
      titulo: 'Em análise',
      icone: 'pi pi-search',
    },

    {
      codigo: 'AGUARDANDO_APROVACAO',
      titulo: 'Aguardando aprovação',
      icone: 'pi pi-clock',
    },

    {
      codigo: 'APROVADA',
      titulo: 'Aprovada',
      icone: 'pi pi-check',
    },

    {
      codigo: 'EM_EXECUCAO',
      titulo: 'Em execução',
      icone: 'pi pi-wrench',
    },

    {
      codigo: 'CONCLUIDA',
      titulo: 'Concluída',
      icone: 'pi pi-check-circle',
    },

    {
      codigo: 'ENTREGUE',
      titulo: 'Entregue',
      icone: 'pi pi-box',
    },

  ];


  readonly indiceAtual =
    computed(() => {

      const status =
        this.ordem()?.statusCodigo;

      if (!status) {
        return -1;
      }

      return this.etapas
        .findIndex(
          etapa =>
            etapa.codigo === status,
        );
    });


  readonly statusEspecial =
    computed(() => {

      const status =
        this.ordem()?.statusCodigo;

      return (
        status === 'REPROVADA' ||
        status === 'CANCELADA'
      );
    });


  /*
   * ACAO PRINCIPAL
   */

  readonly acaoPrincipal =
    computed(() => {

      const ordem =
        this.ordem();

      if (!ordem) {
        return null;
      }

      switch (
        ordem.statusCodigo
      ) {

        case 'ABERTA':

          return 'INICIAR_ANALISE';


        case 'EM_ANALISE':

          return 'CRIAR_ORCAMENTO';


        case 'AGUARDANDO_APROVACAO':

          return 'ANALISAR_APROVACAO';


        case 'APROVADA':

          if (
            ordem.tecnicoResponsavelId
          ) {

            return 'INICIAR_EXECUCAO';
          }

          return 'ATRIBUIR_TECNICO';


        case 'EM_EXECUCAO':

          return 'CONCLUIR';


        case 'CONCLUIDA':

          return 'ENTREGAR';


        default:

          return null;
      }
    });


  /*
   * INICIALIZACAO
   */

  ngOnInit(): void {

    const id = Number(
      this.route
        .snapshot
        .paramMap
        .get('id'),
    );

    if (
      !Number.isSafeInteger(id) ||
      id <= 0
    ) {

      this.erro.set(
        'Identificador da ordem de serviço inválido.',
      );

      return;
    }


    /*
     * A OS acabou de vir da listagem de aparelhos.
     *
     * O POST /ordens-servico já retornou o DTO completo.
     *
     * Não fazemos outro GET da mesma OS.
     */
    if (
      this.ordemRecebidaNaNavegacao &&
      this.ordemRecebidaNaNavegacao
        .ordemServicoId === id
    ) {

      this.ordem.set(
        this.ordemRecebidaNaNavegacao,
      );

      this.carregarSomenteOrcamento(
        id,
      );

      return;
    }


    /*
     * Acesso direto pela URL ou F5.
     *
     * Carregamos OS e orçamento em paralelo.
     */
    this.carregar(
      id,
    );
  }


  /*
   * CARREGAMENTO COMPLETO
   *
   * GET OS
   * GET ORCAMENTO
   *
   * Os dois executam simultaneamente.
   */

  carregar(
    id: number,
  ): void {

    this.carregando.set(
      true,
    );

    this.erro.set(
      '',
    );

    forkJoin({

      ordem:
        this.ordemServicoService
          .buscarPorId(
            id,
          ),

      orcamento:
        this.ordemServicoService
          .buscarOrcamentoAtual(
            id,
          ),

    })
      .pipe(

        finalize(() =>
          this.carregando.set(
            false,
          ),
        ),

        takeUntilDestroyed(
          this.destroyRef,
        ),

      )
      .subscribe({

        next: ({
          ordem,
          orcamento,
        }) => {

          this.ordem.set(
            ordem,
          );

          this.aplicarOrcamento(
            orcamento,
          );
        },

        error: (
          erro: HttpErrorResponse,
        ) => {

          console.error(
            'Erro ao carregar OS:',
            erro,
          );

          this.ordem.set(
            null,
          );

          this.erro.set(
            erro.error?.detail ??
            erro.error?.message ??
            'Não foi possível carregar a ordem de serviço.',
          );

        },

      });
  }


  /*
   * QUANDO A OS JA VEIO DA NAVEGACAO,
   * BUSCAMOS APENAS O ORCAMENTO.
   */

  private carregarSomenteOrcamento(
    ordemServicoId: number,
  ): void {

    this.ordemServicoService
      .buscarOrcamentoAtual(
        ordemServicoId,
      )
      .pipe(

        takeUntilDestroyed(
          this.destroyRef,
        ),

      )
      .subscribe({

        next: orcamento => {

          this.aplicarOrcamento(
            orcamento,
          );

        },

        error: (
          erro: HttpErrorResponse,
        ) => {

          console.error(
            'Erro ao carregar orçamento:',
            erro,
          );

        },

      });
  }


  /*
   * ATUALIZA SOMENTE A OS.
   *
   * Usado quando o endpoint de orçamento
   * já devolveu o orçamento atualizado.
   *
   * Evita buscar o orçamento novamente.
   */

  private recarregarOrdem(
    ordemServicoId: number,
  ): void {

    this.ordemServicoService
      .buscarPorId(
        ordemServicoId,
      )
      .pipe(

        takeUntilDestroyed(
          this.destroyRef,
        ),

      )
      .subscribe({

        next: ordemAtualizada => {

          this.ordem.set(
            ordemAtualizada,
          );

        },

        error: (
          erro: HttpErrorResponse,
        ) => {

          console.error(
            'Erro ao atualizar OS:',
            erro,
          );

          this.erro.set(
            erro.error?.detail ??
            erro.error?.message ??
            'Não foi possível atualizar a ordem de serviço.',
          );

        },

      });
  }


  /*
   * CENTRALIZA O ESTADO DO ORCAMENTO.
   */

  private aplicarOrcamento(
    orcamento:
      OrdemServicoOrcamentoResponseDTO |
      null,
  ): void {

    if (!orcamento) {

      this.orcamentoSalvo.set(
        null,
      );

      this.mostrarFormularioOrcamento.set(
        false,
      );

      return;
    }


    this.orcamentoSalvo.set(
      orcamento,
    );


    this.formOrcamento
      .patchValue({

        servicoProposto:
          orcamento.servicoProposto,

        valorMaoObra:
          orcamento.valorMaoObra,

        valorPecas:
          orcamento.valorPecas,

        desconto:
          orcamento.desconto,

        observacao:
          orcamento.observacao ?? '',

      });


    /*
     * Apenas orçamento RASCUNHO
     * pode continuar editável.
     */
    this.mostrarFormularioOrcamento.set(
      orcamento.status ===
      'RASCUNHO',
    );
  }


  /*
   * TIMELINE
   */

  etapaConcluida(
    index: number,
  ): boolean {

    return (
      index <
      this.indiceAtual()
    );
  }


  etapaAtual(
    index: number,
  ): boolean {

    return (
      index ===
      this.indiceAtual()
    );
  }


  /*
   * EXECUTAR ACAO PRINCIPAL
   */

  executarAcaoPrincipal(): void {

    if (
      this.carregando()
    ) {
      return;
    }

    switch (
      this.acaoPrincipal()
    ) {

      case 'INICIAR_ANALISE':

        this.iniciarAnalise();

        break;


      case 'CRIAR_ORCAMENTO':

        this.criarOrcamento();

        break;


      case 'ANALISAR_APROVACAO':

        this.analisarAprovacao();

        break;


      case 'ATRIBUIR_TECNICO':

        this.atribuirTecnico();

        break;


      case 'INICIAR_EXECUCAO':

        this.iniciarExecucao();

        break;


      case 'CONCLUIR':

        this.concluir();

        break;


      case 'ENTREGAR':

        this.entregar();

        break;

    }
  }


  textoAcaoPrincipal(): string {

    switch (
      this.acaoPrincipal()
    ) {

      case 'INICIAR_ANALISE':
        return 'Iniciar análise';

      case 'CRIAR_ORCAMENTO':
        return 'Criar orçamento';

      case 'ANALISAR_APROVACAO':
        return 'Aprovar / Reprovar';

      case 'ATRIBUIR_TECNICO':
        return 'Atribuir técnico';

      case 'INICIAR_EXECUCAO':
        return 'Iniciar serviço';

      case 'CONCLUIR':
        return 'Concluir serviço';

      case 'ENTREGAR':
        return 'Registrar entrega';

      default:
        return '';
    }
  }


  /*
   * ABERTA -> EM_ANALISE
   */

  iniciarAnalise(): void {

    const ordem =
      this.ordem();

    if (!ordem) {
      return;
    }

    this.carregando.set(
      true,
    );

    this.erro.set(
      '',
    );

    this.ordemServicoService
      .iniciarAnalise(
        ordem.ordemServicoId,
      )
      .pipe(

        finalize(() =>
          this.carregando.set(
            false,
          ),
        ),

        takeUntilDestroyed(
          this.destroyRef,
        ),

      )
      .subscribe({

        next: ordemAtualizada => {

          this.ordem.set(
            ordemAtualizada,
          );

        },

        error: (
          erro: HttpErrorResponse,
        ) => {

          console.error(
            'Erro ao iniciar análise:',
            erro,
          );

          this.erro.set(
            erro.error?.detail ??
            erro.error?.message ??
            'Não foi possível iniciar a análise.',
          );

        },

      });
  }


  /*
   * CRIAR ORCAMENTO
   */

  criarOrcamento(): void {

    this.erro.set(
      '',
    );

    this.mostrarFormularioOrcamento.set(
      true,
    );
  }


  /*
   * SALVAR RASCUNHO
   */

  salvarOrcamento(): void {

    const ordem =
      this.ordem();

    if (!ordem) {
      return;
    }

    if (
      this.formOrcamento.invalid
    ) {

      this.formOrcamento
        .markAllAsTouched();

      return;
    }

    const valor =
      this.formOrcamento
        .getRawValue();

    this.salvandoOrcamento.set(
      true,
    );

    this.erro.set(
      '',
    );

    this.ordemServicoService
      .salvarOrcamentoRascunho(
        ordem.ordemServicoId,
        {

          servicoProposto:
            valor.servicoProposto ?? '',

          valorMaoObra:
            valor.valorMaoObra ?? 0,

          valorPecas:
            valor.valorPecas ?? 0,

          desconto:
            valor.desconto ?? 0,

          observacao:
            valor.observacao || null,

        },
      )
      .pipe(

        finalize(() =>
          this.salvandoOrcamento.set(
            false,
          ),
        ),

        takeUntilDestroyed(
          this.destroyRef,
        ),

      )
      .subscribe({

        next: orcamento => {

          this.aplicarOrcamento(
            orcamento,
          );

        },

        error: (
          erro: HttpErrorResponse,
        ) => {

          console.error(
            'Erro ao salvar orçamento:',
            erro,
          );

          this.erro.set(
            erro.error?.detail ??
            erro.error?.message ??
            'Não foi possível salvar o orçamento.',
          );

        },

      });
  }


  /*
   * RASCUNHO -> AGUARDANDO_APROVACAO
   */

  enviarOrcamentoParaAprovacao(): void {

    const ordem =
      this.ordem();

    const orcamento =
      this.orcamentoSalvo();

    if (
      !ordem ||
      !orcamento
    ) {
      return;
    }

    if (
      orcamento.status !==
      'RASCUNHO'
    ) {
      return;
    }

    this.enviandoOrcamento.set(
      true,
    );

    this.erro.set(
      '',
    );

    this.ordemServicoService
      .enviarOrcamentoParaAprovacao(
        ordem.ordemServicoId,
        orcamento
          .ordemServicoOrcamentoId,
      )
      .pipe(

        finalize(() =>
          this.enviandoOrcamento.set(
            false,
          ),
        ),

        takeUntilDestroyed(
          this.destroyRef,
        ),

      )
      .subscribe({

        next: orcamentoAtualizado => {

          /*
           * O POST já devolveu o orçamento.
           *
           * Não consultamos o orçamento novamente.
           */
          this.aplicarOrcamento(
            orcamentoAtualizado,
          );

          /*
           * Precisamos apenas buscar
           * o novo status da OS.
           */
          this.recarregarOrdem(
            ordem.ordemServicoId,
          );

        },

        error: (
          erro: HttpErrorResponse,
        ) => {

          console.error(
            'Erro ao enviar orçamento:',
            erro,
          );

          this.erro.set(
            erro.error?.detail ??
            erro.error?.message ??
            'Não foi possível enviar o orçamento para aprovação.',
          );

        },

      });
  }


  /*
   * APROVACAO
   */

  analisarAprovacao(): void {

    const orcamento =
      this.orcamentoSalvo();

    if (!orcamento) {
      return;
    }

    if (
      orcamento.status !==
      'AGUARDANDO_APROVACAO'
    ) {
      return;
    }

    this.mostrarAprovacao.set(
      true,
    );
  }


  aprovarOrcamento(): void {

    const ordem =
      this.ordem();

    const orcamento =
      this.orcamentoSalvo();

    if (
      !ordem ||
      !orcamento
    ) {
      return;
    }

    this.processandoAprovacao.set(
      true,
    );

    this.erro.set(
      '',
    );

    this.ordemServicoService
      .aprovarOrcamento(
        ordem.ordemServicoId,
        orcamento
          .ordemServicoOrcamentoId,
      )
      .pipe(

        finalize(() =>
          this.processandoAprovacao.set(
            false,
          ),
        ),

        takeUntilDestroyed(
          this.destroyRef,
        ),

      )
      .subscribe({

        next: orcamentoAtualizado => {

          this.aplicarOrcamento(
            orcamentoAtualizado,
          );

          this.mostrarAprovacao.set(
            false,
          );

          /*
           * O orçamento já está atualizado.
           *
           * Recarregamos somente a OS.
           */
          this.recarregarOrdem(
            ordem.ordemServicoId,
          );

        },

        error: (
          erro: HttpErrorResponse,
        ) => {

          console.error(
            'Erro ao aprovar orçamento:',
            erro,
          );

          this.erro.set(
            erro.error?.detail ??
            erro.error?.message ??
            'Não foi possível aprovar o orçamento.',
          );

        },

      });
  }


  reprovarOrcamento(): void {

    const ordem =
      this.ordem();

    const orcamento =
      this.orcamentoSalvo();

    if (
      !ordem ||
      !orcamento
    ) {
      return;
    }

    this.processandoAprovacao.set(
      true,
    );

    this.erro.set(
      '',
    );

    this.ordemServicoService
      .reprovarOrcamento(
        ordem.ordemServicoId,
        orcamento
          .ordemServicoOrcamentoId,
      )
      .pipe(

        finalize(() =>
          this.processandoAprovacao.set(
            false,
          ),
        ),

        takeUntilDestroyed(
          this.destroyRef,
        ),

      )
      .subscribe({

        next: orcamentoAtualizado => {

          this.aplicarOrcamento(
            orcamentoAtualizado,
          );

          this.mostrarAprovacao.set(
            false,
          );

          this.recarregarOrdem(
            ordem.ordemServicoId,
          );

        },

        error: (
          erro: HttpErrorResponse,
        ) => {

          console.error(
            'Erro ao reprovar orçamento:',
            erro,
          );

          this.erro.set(
            erro.error?.detail ??
            erro.error?.message ??
            'Não foi possível reprovar o orçamento.',
          );

        },

      });
  }


  /*
   * TECNICO
   */

  atribuirTecnico(): void {

    this.mostrarSelecaoTecnico.set(
      true,
    );

    this.tecnicoSelecionadoId.set(
      null,
    );

    if (
      this.tecnicos().length > 0
    ) {
      return;
    }

    this.carregarTecnicos();
  }


  carregarTecnicos(): void {

    this.carregandoTecnicos.set(
      true,
    );

    this.erro.set(
      '',
    );

    this.tecnicoService
      .listar()
      .pipe(

        finalize(() =>
          this.carregandoTecnicos.set(
            false,
          ),
        ),

        takeUntilDestroyed(
          this.destroyRef,
        ),

      )
      .subscribe({

        next: tecnicos => {

          this.tecnicos.set(
            tecnicos,
          );

        },

        error: (
          erro: HttpErrorResponse,
        ) => {

          console.error(
            'Erro ao carregar técnicos:',
            erro,
          );

          this.erro.set(
            erro.error?.detail ??
            erro.error?.message ??
            'Não foi possível carregar os técnicos.',
          );

        },

      });
  }


  selecionarTecnico(
    event: Event,
  ): void {

    const elemento =
      event.target as HTMLSelectElement;

    const valor =
      elemento.value;

    if (!valor) {

      this.tecnicoSelecionadoId.set(
        null,
      );

      return;
    }

    const tecnicoId =
      Number(valor);

    if (
      !Number.isSafeInteger(tecnicoId) ||
      tecnicoId <= 0
    ) {

      this.tecnicoSelecionadoId.set(
        null,
      );

      return;
    }

    this.tecnicoSelecionadoId.set(
      tecnicoId,
    );
  }


  confirmarTecnico(): void {

    const ordem =
      this.ordem();

    const tecnicoId =
      this.tecnicoSelecionadoId();

    if (
      !ordem ||
      tecnicoId === null
    ) {
      return;
    }

    this.atribuindoTecnico.set(
      true,
    );

    this.erro.set(
      '',
    );

    this.ordemServicoService
      .atribuirTecnico(
        ordem.ordemServicoId,
        tecnicoId,
      )
      .pipe(

        finalize(() =>
          this.atribuindoTecnico.set(
            false,
          ),
        ),

        takeUntilDestroyed(
          this.destroyRef,
        ),

      )
      .subscribe({

        next: ordemAtualizada => {

          /*
           * O endpoint já devolve a OS atualizada.
           *
           * Não fazemos outro GET.
           */
          this.ordem.set(
            ordemAtualizada,
          );

          this.mostrarSelecaoTecnico.set(
            false,
          );

          this.tecnicoSelecionadoId.set(
            null,
          );

        },

        error: (
          erro: HttpErrorResponse,
        ) => {

          console.error(
            'Erro ao atribuir técnico:',
            erro,
          );

          this.erro.set(
            erro.error?.detail ??
            erro.error?.message ??
            'Não foi possível atribuir o técnico.',
          );

        },

      });
  }


  /*
   * APROVADA -> EM_EXECUCAO
   */

  iniciarExecucao(): void {

    const ordem =
      this.ordem();

    if (!ordem) {
      return;
    }

    this.carregando.set(
      true,
    );

    this.erro.set(
      '',
    );

    this.ordemServicoService
      .iniciarExecucao(
        ordem.ordemServicoId,
      )
      .pipe(

        finalize(() =>
          this.carregando.set(
            false,
          ),
        ),

        takeUntilDestroyed(
          this.destroyRef,
        ),

      )
      .subscribe({

        next: ordemAtualizada => {

          /*
           * O POST já retorna a OS completa.
           */
          this.ordem.set(
            ordemAtualizada,
          );

        },

        error: (
          erro: HttpErrorResponse,
        ) => {

          console.error(
            'Erro ao iniciar serviço:',
            erro,
          );

          this.erro.set(
            erro.error?.detail ??
            erro.error?.message ??
            'Não foi possível iniciar o serviço.',
          );

        },

      });
  }


  /*
   * ABRIR FORMULARIO DE CONCLUSAO
   */

  concluir(): void {

    const ordem =
      this.ordem();

    if (!ordem) {
      return;
    }

    this.formConclusao.reset({

      solucao:
        ordem.solucao ?? '',

      valorFinal:
        ordem.valorOrcamento ?? 0,

      observacao:
        '',

    });

    this.erro.set(
      '',
    );

    this.mostrarConclusao.set(
      true,
    );
  }


  /*
   * EM_EXECUCAO -> CONCLUIDA
   */

  confirmarConclusao(): void {

    const ordem =
      this.ordem();

    if (!ordem) {
      return;
    }

    if (
      this.formConclusao.invalid
    ) {

      this.formConclusao
        .markAllAsTouched();

      return;
    }

    const valor =
      this.formConclusao
        .getRawValue();

    const solucao =
      valor.solucao?.trim() ?? '';

    if (!solucao) {

      this.formConclusao
        .controls
        .solucao
        .setErrors({
          required: true,
        });

      this.formConclusao
        .controls
        .solucao
        .markAsTouched();

      return;
    }

    this.concluindoServico.set(
      true,
    );

    this.erro.set(
      '',
    );

    this.ordemServicoService
      .concluir(
        ordem.ordemServicoId,
        {

          solucao,

          valorFinal:
            valor.valorFinal ?? 0,

          observacao:
            valor.observacao?.trim() ||
            undefined,

        },
      )
      .pipe(

        finalize(() =>
          this.concluindoServico.set(
            false,
          ),
        ),

        takeUntilDestroyed(
          this.destroyRef,
        ),

      )
      .subscribe({

        next: ordemAtualizada => {

          /*
           * O POST já retorna a OS completa.
           *
           * Não fazemos outro GET.
           */
          this.ordem.set(
            ordemAtualizada,
          );

          this.mostrarConclusao.set(
            false,
          );

          this.formConclusao.reset({

            solucao: '',

            valorFinal: 0,

            observacao: '',

          });

        },

        error: (
          erro: HttpErrorResponse,
        ) => {

          console.error(
            'Erro ao concluir serviço:',
            erro,
          );

          this.erro.set(
            erro.error?.detail ??
            erro.error?.message ??
            'Não foi possível concluir o serviço.',
          );

        },

      });
  }


  /*
   * ENTREGA
   */

  entregar(): void {

  const ordem =
    this.ordem();

  if (!ordem) {
    return;
  }

  if (
    ordem.statusCodigo !==
    'CONCLUIDA'
  ) {
    return;
  }

  this.registrandoEntrega.set(
    true,
  );

  this.erro.set(
    '',
  );

  this.ordemServicoService
    .entregar(
      ordem.ordemServicoId,
    )
    .pipe(

      finalize(() =>
        this.registrandoEntrega.set(
          false,
        ),
      ),

      takeUntilDestroyed(
        this.destroyRef,
      ),

    )
    .subscribe({

      next: ordemAtualizada => {

        this.ordem.set(
          ordemAtualizada,
        );

      },

      error: (
        erro: HttpErrorResponse,
      ) => {

        console.error(
          'Erro ao registrar entrega:',
          erro,
        );

        this.erro.set(
          erro.error?.detail ??
          erro.error?.message ??
          'Não foi possível registrar a entrega.',
        );

      },

    });
}


  /*
   * IMPRESSAO
   */

  imprimir(): void {

    const ordem =
      this.ordem();

    if (!ordem) {
      return;
    }

    this.ordemServicoService
      .imprimir(
        ordem.ordemServicoId,
      );
  }


  /*
   * VOLTAR
   */

  voltar(): void {

    const ordem =
      this.ordem();

    if (!ordem) {

      this.router.navigate([
        '/cliente',
      ]);

      return;
    }

    this.router.navigate([
      '/aparelho',
      ordem.clienteId,
    ]);
  }
}