export interface OrdemServicoOrcamentoRequestDTO {
  servicoProposto: string;
  valorMaoObra: number | null;
  valorPecas: number | null;
  desconto: number | null;
  observacao: string | null;
}

export interface OrdemServicoOrcamentoResponseDTO {
  ordemServicoOrcamentoId: number;
  ordemServicoId: number;

  versao: number;

  servicoProposto: string;

  valorMaoObra: number;
  valorPecas: number;
  desconto: number;
  valorTotal: number;

  observacao: string | null;

  status:
    | 'RASCUNHO'
    | 'AGUARDANDO_APROVACAO'
    | 'APROVADO'
    | 'REPROVADO'
    | 'CANCELADO';

  dataCriacao: string;
  dataAtualizacao: string | null;
  dataEnvio: string | null;
  dataAprovacao: string | null;
  dataReprovacao: string | null;
}