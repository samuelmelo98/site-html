import { CurrencyPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, startWith } from 'rxjs';
import { MessageService } from 'primeng/api';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TextareaModule } from 'primeng/textarea';
import { Cliente } from '../../../cliente/model/cliente-listar.dto';
import { ClienteService } from '../../../cliente/services/cliente.service';
import { ClienteOpcaoDTO } from '../../model/cliente-opcao.dto';
import { FormaPagamento, VendaDetalheDTO, VendaRequestDTO } from '../../model/venda.dto';
import { VendaService } from '../../services/venda.service';
import { SelectModule } from 'primeng/select';
interface VendaItemForm {
  descricao: FormControl<string>;
  quantidade: FormControl<number>;
  valorUnitario: FormControl<number>;
  desconto: FormControl<number>;
}
interface VendaItemValor {
  descricao: string;
  quantidade: number;
  valorUnitario: number;
  desconto: number;
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
    SelectModule,
    TextareaModule,
  ],
  templateUrl: './create.component.html',
  styleUrl: './create.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateComponent implements OnInit {
  private static readonly MIN_CARACTERES_CLIENTE = 2;
  private static readonly LIMITE_CLIENTES = 20;
  /*
   * DEPENDÊNCIAS
   */
  private readonly fb = inject(FormBuilder);
  private readonly vendaService = inject(VendaService);
  private readonly clienteService = inject(ClienteService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  /*
   * VENDA
   */
  readonly vendaId = signal<number | null>(null);
  readonly carregando = signal(false);
  readonly salvando = signal(false);
  readonly erro = signal('');

  /** Opções disponíveis para pagamento da venda. */
  readonly formasPagamento: { label: string; value: FormaPagamento }[] = [
    { label: 'Dinheiro', value: 'DINHEIRO' },
    { label: 'PIX', value: 'PIX' },
    { label: 'Cartão de crédito', value: 'CARTAO_CREDITO' },
    { label: 'Cartão de débito', value: 'CARTAO_DEBITO' },
  ];
  /*
   * CLIENTES
   */
  readonly clientesFiltrados = signal<ClienteOpcaoDTO[]>([]);
  readonly carregandoClientes = signal(false);
  readonly erroClientes = signal('');
  readonly clienteSelecionadoControl = new FormControl<ClienteOpcaoDTO | null>(null);
  /*
   * FORMULÁRIO
   */
  readonly form = this.fb.group({
    clienteId: this.fb.control<number | null>(null, [Validators.min(1)]),
    formaPagamento: this.fb.control<FormaPagamento | null>(null, [Validators.required]),
    desconto: this.fb.nonNullable.control(0, [Validators.min(0)]),
    observacao: this.fb.nonNullable.control('', [Validators.maxLength(2000)]),
    itens: this.fb.array<FormGroup<VendaItemForm>>([this.criarItemForm()]),
  });
  private readonly formValue = toSignal(
    this.form.valueChanges.pipe(startWith(this.form.getRawValue())),
    {
      initialValue: this.form.getRawValue(),
    },
  );
  /*
   * COMPUTADOS
   */
  readonly modoEdicao = computed(() => this.vendaId() !== null);
  readonly titulo = computed(() => (this.modoEdicao() ? 'Editar venda' : 'Nova venda'));
  readonly subtotal = computed(() => this.calcularSubtotal());
  readonly descontoItens = computed(() => this.calcularDescontoItens());
  readonly total = computed(() => this.calcularTotalVenda());
  get itens(): FormArray<FormGroup<VendaItemForm>> {
    return this.form.controls.itens;
  }
  /*
   * INICIALIZAÇÃO
   */
  ngOnInit(): void {
    const parametro = this.obterParametroVendaId();
    if (parametro === null) {
      return;
    }
    const vendaId = this.converterVendaId(parametro);
    if (vendaId === null) {
      this.erro.set('Identificador da venda inválido.');
      return;
    }
    this.inicializarEdicao(vendaId);
  }
  /*
   * CLIENTES
   */
  filtrarClientes(event: { query: string }): void {
    const nome = event.query.trim();
    this.erroClientes.set('');
    if (!this.podePesquisarCliente(nome)) {
      this.limparSugestoesClientes();
      return;
    }
    this.pesquisarClientes(nome);
  }
  selecionarCliente(cliente: ClienteOpcaoDTO): void {
    this.definirClienteSelecionado(cliente);
    this.definirClienteId(cliente.clienteId);
    this.erroClientes.set('');
  }
  limparCliente(): void {
    this.definirClienteSelecionado(null);
    this.definirClienteId(null);
  }
  /*
   * ITENS
   */
  adicionarItem(): void {
    if (this.salvando()) {
      return;
    }
    this.itens.push(this.criarItemForm());
    this.form.markAsDirty();
  }
  removerItem(index: number): void {
    if (!this.podeRemoverItem(index)) {
      return;
    }
    this.itens.removeAt(index);
    this.form.markAsDirty();
  }
  /*
   * SALVAR
   */
  salvar(): void {
    if (this.salvando()) {
      return;
    }
    const mensagemValidacao = this.validarVendaParaSalvar();
    if (mensagemValidacao) {
      this.notificarAviso(mensagemValidacao);
      return;
    }
    this.persistirVenda(this.mapearPayload());
  }
  /*
   * NAVEGAÇÃO
   */
  voltar(): void {
    const vendaId = this.vendaId();
    if (vendaId !== null) {
      this.router.navigate(['/vendas', vendaId]);
      return;
    }
    this.router.navigate(['/vendas/listar']);
  }
  /*
   * HELPERS DA TELA
   */
  campoInvalido(controle: AbstractControl | null): boolean {
    return Boolean(controle && controle.invalid && (controle.dirty || controle.touched));
  }
  valorTotalItem(index: number): number {
    const item = this.itens.at(index);
    if (!item) {
      return 0;
    }
    return this.calcularTotalItem(item.getRawValue());
  }
  /*
   * INICIALIZAÇÃO DA EDIÇÃO
   */
  private obterParametroVendaId(): string | null {
    return this.route.snapshot.paramMap.get('vendaId');
  }
  private converterVendaId(parametro: string): number | null {
    if (!/^[1-9]\d*$/.test(parametro)) {
      return null;
    }
    const vendaId = Number(parametro);
    return Number.isSafeInteger(vendaId) ? vendaId : null;
  }
  private inicializarEdicao(vendaId: number): void {
    this.vendaId.set(vendaId);
    this.carregarVenda(vendaId);
  }
  /*
   * PESQUISA DE CLIENTES
   */
  private podePesquisarCliente(nome: string): boolean {
    return nome.length >= CreateComponent.MIN_CARACTERES_CLIENTE;
  }
  private pesquisarClientes(nome: string): void {
    this.carregandoClientes.set(true);
    this.clienteService
      .buscarOpcoes(nome, 0, CreateComponent.LIMITE_CLIENTES)
      .pipe(
        finalize(() => this.carregandoClientes.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (pagina) => this.clientesFiltrados.set(pagina.content),
        error: (erro) => this.tratarErroPesquisaClientes(erro),
      });
  }
  private tratarErroPesquisaClientes(erro: HttpErrorResponse): void {
    this.limparSugestoesClientes();
    this.erroClientes.set(this.mensagemErro(erro, 'Não foi possível pesquisar os clientes.'));
  }
  private limparSugestoesClientes(): void {
    this.clientesFiltrados.set([]);
  }
  private definirClienteSelecionado(cliente: ClienteOpcaoDTO | null): void {
    this.clienteSelecionadoControl.setValue(cliente, {
      emitEvent: false,
    });
  }
  private definirClienteId(clienteId: number | null): void {
    this.form.controls.clienteId.setValue(clienteId);
    this.form.controls.clienteId.markAsDirty();
  }
  /*
   * REGRAS DOS ITENS
   */
  private podeRemoverItem(index: number): boolean {
    return (
      !this.salvando() &&
      this.itens.length > 1 &&
      Number.isInteger(index) &&
      index >= 0 &&
      index < this.itens.length
    );
  }
  private criarItemForm(item?: Partial<VendaItemValor>): FormGroup<VendaItemForm> {
    return this.fb.group({
      descricao: this.fb.nonNullable.control(item?.descricao ?? '', [
        Validators.required,
        Validators.maxLength(255),
      ]),
      quantidade: this.fb.nonNullable.control(item?.quantidade ?? 1, [
        Validators.required,
        Validators.min(0.01),
      ]),
      valorUnitario: this.fb.nonNullable.control(item?.valorUnitario ?? 0, [
        Validators.required,
        Validators.min(0),
      ]),
      desconto: this.fb.nonNullable.control(item?.desconto ?? 0, [Validators.min(0)]),
    });
  }
  /*
   * CÁLCULOS
   */
  private calcularSubtotal(): number {
    return (this.formValue().itens ?? []).reduce(
      (total, item) => total + this.calcularValorBrutoItem(item),
      0,
    );
  }
  private calcularDescontoItens(): number {
    return (this.formValue().itens ?? []).reduce(
      (total, item) => total + Number(item.desconto ?? 0),
      0,
    );
  }
  private calcularTotalVenda(): number {
    const descontoVenda = Number(this.formValue().desconto ?? 0);
    return Math.max(0, this.subtotal() - this.descontoItens() - descontoVenda);
  }
  private calcularValorBrutoItem(item: {
    quantidade?: number | null;
    valorUnitario?: number | null;
  }): number {
    return Number(item.quantidade ?? 0) * Number(item.valorUnitario ?? 0);
  }
  private calcularTotalItem(item: VendaItemValor): number {
    return Math.max(0, this.calcularValorBrutoItem(item) - Number(item.desconto ?? 0));
  }
  /*
   * PERSISTÊNCIA DA VENDA
   */
  private validarVendaParaSalvar(): string | null {
    if (this.form.invalid || this.itens.length === 0) {
      this.form.markAllAsTouched();
      return 'Preencha os campos obrigatórios ' + 'da venda.';
    }
    return this.validarValores();
  }
  private persistirVenda(payload: VendaRequestDTO): void {
    const vendaId = this.vendaId();
    const requisicao =
      vendaId === null
        ? this.vendaService.criar(payload)
        : this.vendaService.atualizar(vendaId, payload);
    this.iniciarSalvamento();
    requisicao
      .pipe(
        finalize(() => this.salvando.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (venda) => this.tratarVendaSalva(venda),
        error: (erro) => this.tratarErroSalvarVenda(erro),
      });
  }
  private iniciarSalvamento(): void {
    this.salvando.set(true);
    this.erro.set('');
  }
  private tratarVendaSalva(venda: VendaDetalheDTO): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Sucesso',
      detail: this.modoEdicao() ? 'Venda atualizada com sucesso.' : 'Venda registrada com sucesso.',
    });
    this.router.navigate(['/vendas', venda.vendaId]);
  }
  private tratarErroSalvarVenda(erro: HttpErrorResponse): void {
    const mensagem = this.mensagemErro(erro, 'Não foi possível salvar a venda.');
    this.erro.set(mensagem);
    this.messageService.add({
      severity: 'error',
      summary: 'Erro',
      detail: mensagem,
    });
  }
  private notificarAviso(mensagem: string): void {
    this.messageService.add({
      severity: 'warn',
      summary: 'Atenção',
      detail: mensagem,
    });
  }
  /*
   * CARREGAR VENDA
   */
  private carregarVenda(vendaId: number): void {
    this.iniciarCarregamentoVenda();
    this.vendaService
      .buscar(vendaId)
      .pipe(
        finalize(() => this.carregando.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (venda) => this.aplicarVendaCarregada(venda),
        error: (erro) => this.tratarErroCarregarVenda(erro),
      });
  }
  private iniciarCarregamentoVenda(): void {
    this.carregando.set(true);
    this.erro.set('');
  }
  private aplicarVendaCarregada(venda: VendaDetalheDTO): void {
    if (!this.vendaPodeSerEditada(venda)) {
      return;
    }
    this.preencherDadosVenda(venda);
    this.sincronizarClienteSelecionado();
    this.substituirItensVenda(venda.itens);
    this.form.markAsPristine();
  }
  private vendaPodeSerEditada(venda: VendaDetalheDTO): boolean {
    if (venda.status === 'ABERTA') {
      return true;
    }
    this.erro.set('Somente vendas abertas podem ser editadas.');
    return false;
  }
  private preencherDadosVenda(venda: VendaDetalheDTO): void {
    this.form.patchValue({
      clienteId: venda.clienteId,
      formaPagamento: venda.formaPagamento ?? null,
      desconto: venda.desconto,
      observacao: venda.observacao ?? '',
    });
  }
  private substituirItensVenda(itensVenda: VendaDetalheDTO['itens']): void {
    this.itens.clear();
    for (const item of itensVenda) {
      this.itens.push(this.criarItemForm(item));
    }
    this.garantirItemInicial();
  }
  private garantirItemInicial(): void {
    if (this.itens.length > 0) {
      return;
    }
    this.itens.push(this.criarItemForm());
  }
  private tratarErroCarregarVenda(erro: HttpErrorResponse): void {
    this.erro.set(this.mensagemErro(erro, 'Não foi possível carregar a venda.'));
  }
  /*
   * CLIENTE DA VENDA EM EDIÇÃO
   */
  private sincronizarClienteSelecionado(): void {
    const clienteId = this.form.controls.clienteId.value;
    if (clienteId == null) {
      this.definirClienteSelecionado(null);
      return;
    }
    this.carregarClienteSelecionado(clienteId);
  }
  private carregarClienteSelecionado(clienteId: number): void {
    this.clienteService
      .buscarPorId(clienteId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (cliente) => this.definirClienteSelecionado(this.mapearClienteOpcao(cliente)),
        error: (erro) => this.tratarErroCarregarCliente(erro),
      });
  }
  private mapearClienteOpcao(cliente: Cliente): ClienteOpcaoDTO {
    return {
      clienteId: cliente.clienteId,
      nome: cliente.nome,
      cpf: cliente.cpf ?? null,
      telefone: cliente.telefone ?? null,
    };
  }
  private tratarErroCarregarCliente(erro: HttpErrorResponse): void {
    this.definirClienteSelecionado(null);
    this.erroClientes.set(this.mensagemErro(erro, 'Não foi possível carregar o cliente da venda.'));
  }
  /*
   * VALIDAÇÕES DE VALORES
   */
  private validarValores(): string | null {
    return this.validarDescontosItens() ?? this.validarDescontoGeral();
  }
  private validarDescontosItens(): string | null {
    const itens = this.itens.getRawValue();
    for (let index = 0; index < itens.length; index++) {
      if (this.descontoItemValido(itens[index])) {
        continue;
      }
      return `O desconto do item ${index + 1} ` + 'não pode ser maior que seu valor bruto.';
    }
    return null;
  }
  private descontoItemValido(item: VendaItemValor): boolean {
    const valorBruto = this.calcularValorBrutoItem(item);
    return Number(item.desconto ?? 0) <= valorBruto;
  }
  private validarDescontoGeral(): string | null {
    const totalAposItens = this.subtotal() - this.descontoItens();
    const descontoVenda = Number(this.form.controls.desconto.value ?? 0);
    if (descontoVenda <= totalAposItens) {
      return null;
    }
    return 'O desconto geral não pode ser maior ' + 'que o valor dos itens.';
  }
  /*
   * PAYLOAD
   */
  private mapearPayload(): VendaRequestDTO {
    const raw = this.form.getRawValue();
    return {
      clienteId: raw.clienteId ?? null,
      formaPagamento: raw.formaPagamento!,
      desconto: Number(raw.desconto ?? 0),
      observacao: raw.observacao?.trim() || null,
      itens: raw.itens.map((item) => this.mapearItemPayload(item)),
    };
  }
  private mapearItemPayload(item: VendaItemValor): VendaRequestDTO['itens'][number] {
    return {
      descricao: String(item.descricao ?? '').trim(),
      quantidade: Number(item.quantidade ?? 0),
      valorUnitario: Number(item.valorUnitario ?? 0),
      desconto: Number(item.desconto ?? 0),
    };
  }
  /*
   * ERROS HTTP
   */
  private mensagemErro(erro: HttpErrorResponse, padrao: string): string {
    const mensagemApi = this.obterMensagemApi(erro);
    if (mensagemApi) {
      return mensagemApi;
    }
    return this.mensagemPorStatus(erro.status, padrao);
  }
  private obterMensagemApi(erro: HttpErrorResponse): string | null {
    const mensagem = erro.error?.message ?? erro.error?.mensagem ?? erro.error?.detail;
    return typeof mensagem === 'string' && mensagem.trim() ? mensagem : null;
  }
  private mensagemPorStatus(status: number, padrao: string): string {
    switch (status) {
      case 401:
        return 'Sua sessão expirou. ' + 'Entre novamente.';
      case 403:
        return 'Você não tem permissão ' + 'para executar esta operação.';
      case 404:
        return 'Registro não encontrado.';
      case 409:
        return 'A operação não pôde ser concluída ' + 'no estado atual da venda.';
      default:
        return padrao;
    }
  }
}
