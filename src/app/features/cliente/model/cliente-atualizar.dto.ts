export interface ClienteAtualizarDTO {
  nome: string;
  cpf: string;

  email: string | null;
  telefone: string | null;

  endereco: string | null;
  cidade: string | null;
  estado: string | null;
  cep: string | null;
}