export interface MetricaVendaDTO {
  inicio: string;
  fim: string;
  quantidade: number;
  valorTotal: number;
  quantidadeCanceladas: number;
  valorCancelado: number;
}

export interface DashboardVendaDTO {
  diaria: MetricaVendaDTO;
  semanal: MetricaVendaDTO;
  mensal: MetricaVendaDTO;
  anual: MetricaVendaDTO;
}