export type FormaPagamento =
  | 'DINHEIRO'
  | 'PIX'
  | 'CARTAO_DEBITO'
  | 'CARTAO_CREDITO'
  | 'TRANSFERENCIA';

export interface RelatorioSemanalTecnicoPagamentoDTO {
  formaPagamento: FormaPagamento;
  valor: number;
  parcelas: number;
}

export interface RelatorioSemanalTecnicoItemDTO {
  ordemServicoId: number;
  numeroOrdemServico: string;
  aparelhoId: number;
  modelo: string | null;
  modeloComercial: string | null;
  numeroSerie: string | null;
  clienteId: number;
  clienteNome: string;
  dataEntrega: string;
  valorOrdemServico: number;
  valorMaterial: number;
  totalPago: number;
  pagamentos: RelatorioSemanalTecnicoPagamentoDTO[];
}

export interface RelatorioSemanalTecnicoDTO {
  tecnicoId: number;
  tecnicoNome: string;
  tecnicoEmail: string | null;
  inicio: string;
  fim: string;
  aparelhos: RelatorioSemanalTecnicoItemDTO[];
  totalOrdensServico: number;
  totalMateriais: number;
  valorLiquido: number;
  valorTecnico: number;
}
