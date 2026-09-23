export interface ConsultaOrdemServicoRequestDTO {
  ultimosDigitosCpf: string;
  token: string;
}

export interface ConsultaOrdemServicoResponseDTO {
  numero: string;

  clienteNome: string;

  aparelhoMarca: string | null;
  aparelhoModelo: string | null;
  aparelhoModeloComercial: string | null;
  aparelhoNumeroSerie: string | null;

  statusCodigo: string | null;
  statusDescricao: string | null;

  defeitoRelatado: string | null;
  diagnostico: string | null;
  solucao: string | null;
  observacao: string | null;

  valorOrcamento: number | null;
  valorFinal: number | null;

  dataAbertura: string | null;
  dataAprovacao: string | null;
  dataInicioServico: string | null;
  dataConclusao: string | null;
  dataEntrega: string | null;
}