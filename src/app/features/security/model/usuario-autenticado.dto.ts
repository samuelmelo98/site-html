export interface UsuarioAutenticadoDTO {
  subject: string;
  username: string;
  nome: string | null;
  email: string | null;
  roles: string[];
  permissoes: string[];
}