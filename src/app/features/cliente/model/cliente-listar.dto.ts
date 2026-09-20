export interface Cliente {
  clienteId: number;
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  endereco: string;
  cidade: string;
  estado: string;
  cep: string;
  dataNascimento: string | null;
}
