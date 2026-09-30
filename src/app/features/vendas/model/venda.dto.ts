export type StatusVenda =
  | 'ABERTA'
  | 'FINALIZADA'
  | 'CANCELADA';

export interface VendaItemRequestDTO {
  descricao: string;
  quantidade: number;
  valorUnitario: number;
  desconto: number;
}

export interface VendaRequestDTO {
  clienteId: number | null;
  desconto: number;
  observacao: string | null;
  itens: VendaItemRequestDTO[];
}

export interface VendaItemResponseDTO {
  vendaItemId: number;
  descricao: string;
  quantidade: number;
  valorUnitario: number;
  desconto: number;
  valorTotal: number;
}

export interface VendaResponseDTO {
  vendaId: number;
  numero: string;
  clienteId: number | null;
  clienteNome: string | null;
  dataVenda: string;
  status: StatusVenda;
  valorSubtotal: number;
  descontoItens: number;
  desconto: number;
  valorTotal: number;
  quantidadeItens: number;
}

export interface VendaDetalheDTO {
  vendaId: number;
  numero: string;
  clienteId: number | null;
  clienteNome: string | null;
  dataVenda: string;
  status: StatusVenda;
  valorSubtotal: number;
  descontoItens: number;
  desconto: number;
  valorTotal: number;
  observacao: string | null;
  dataCriacao: string;
  dataAtualizacao: string | null;
  itens: VendaItemResponseDTO[];
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}
