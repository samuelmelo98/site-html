export interface User {
  name: string;
  email: string;

   // opcionais (ótimo para expansão)
   role?: string;
   status?: 'ATIVO' | 'INATIVO';
   createdAt?: string;
}
