export interface OrdemServico {
  ordemServicoId: number;
  numero: string;

  clienteId: number;
  clienteNome: string;

  aparelhoId: number;

  marca: string | null;
  modelo: string | null;
  modeloComercial: string | null;
  numeroSerie: string | null;

  statusCodigo: string | null;
  statusDescricao: string | null;

  defeitoRelatado: string | null;
  diagnostico: string | null;
  solucao: string | null;
  observacao: string | null;

  valorOrcamento: number | null;
  valorFinal: number | null;

  dataAbertura: string | null;
  dataAtualizacao: string | null;
  dataAprovacao: string | null;
  dataInicioServico: string | null;
  dataConclusao: string | null;
  dataEntrega: string | null;
}

export interface AbrirOrdemServicoRequest {
  aparelhoId: number;
}