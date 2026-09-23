export interface MetricaOrdemServicoDTO {

  inicio: string;

  fim: string;

  total: number;

  abertas: number;

  autorizadas: number;

  entregues: number;

  naoAutorizadas: number;

  outros: number;

}

export interface DashboardOrdemServicoDTO {
  semana: MetricaOrdemServicoDTO;
  entreguesSeisDias: MetricaOrdemServicoDTO;
  trintaDias: MetricaOrdemServicoDTO;
  ano: MetricaOrdemServicoDTO;
}
