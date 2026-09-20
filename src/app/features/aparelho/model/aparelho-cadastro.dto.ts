export interface CadastroAparelho {
  clienteId: number;
  marcaId: number;
  tipoAparelhoId: number;
  modelo: string;
  modeloComercial: string;
  numeroSerie: string;
  descricao: string;
  defeito: string;
  observacao: string;
  fimGarantia?: string | null;
}