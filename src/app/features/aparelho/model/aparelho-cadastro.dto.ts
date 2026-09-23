export interface AparelhoResponse {

  aparelhoId: number;

  marcaId: number | null;

  marca: string | null;

  tipoAparelhoId: number | null;

  tipoAparelho: string | null;

  modelo: string | null;

  modeloComercial: string | null;

  numeroSerie: string | null;

  statusAparelhoId: number | null;

  statusAparelho: string | null;

  dataEntradaAparelho: string | null;

  observacao: string | null;
}