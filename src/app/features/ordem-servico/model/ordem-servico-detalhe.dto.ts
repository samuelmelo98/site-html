export interface OrdemServicoDetalheDTO {

  ordemServicoId: number;

  numero: string;

  clienteId: number;

  clienteNome: string;

  aparelhoId: number;

  marca: string | null;

  modelo: string | null;

  modeloComercial: string | null;

  numeroSerie: string | null;

  statusCodigo: string;

  statusDescricao: string;

  defeitoRelatado: string | null;

  diagnostico: string | null;

  solucao: string | null;

  observacao: string | null;

  valorOrcamento: number | null;

  valorFinal: number | null;

  dataAbertura: string;

  dataAtualizacao: string | null;

  dataAprovacao: string | null;

  dataInicioServico: string | null;

  dataConclusao: string | null;

  dataEntrega: string | null;
  tecnicoResponsavelId: number | null;

tecnicoResponsavelNome: string | null;

dataAtribuicaoTecnico: string | null;
}