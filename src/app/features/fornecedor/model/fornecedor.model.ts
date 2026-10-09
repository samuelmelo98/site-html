export type TipoPessoa = 'PF' | 'PJ';

export interface FornecedorRequest {
  tipoPessoa: TipoPessoa;
  razaoSocial: string;
  nomeFantasia: string | null;
  cpfCnpj: string;
  inscricaoEstadual: string | null;
  email: string | null;
  telefone: string | null;
  whatsapp: string | null;
  cep: string | null;
  endereco: string | null;
  numero: string | null;
  complemento: string | null;
  bairro: string | null;
  cidade: string | null;
  estado: string | null;
  observacao: string | null;
}

export interface Fornecedor extends FornecedorRequest {
  fornecedorId: number;
  ativo: boolean;
  dataCadastro: string;
  dataAtualizacao: string;
}

export interface FornecedorOpcao {
  fornecedorId: number;
  nome: string;
  cpfCnpj: string;
}

export interface Pagina<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
