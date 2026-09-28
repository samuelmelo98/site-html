export interface OrdemServicoAbertaDTO {

  ordemServicoId: number;

  numero: string;

  statusCodigo: string;

  statusDescricao: string;

  dataAbertura: string;

  dataAtualizacao: string | null;


  // CLIENTE

  clienteId: number;

  clienteNome: string;

  clienteCpf: string | null;

  clienteTelefone: string | null;


  // APARELHO

  aparelhoId: number;

  marca: string | null;

  modelo: string | null;

  modeloComercial: string | null;

  numeroSerie: string | null;

}