import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { finalize } from 'rxjs';
import { Fornecedor } from './model/fornecedor.model';
import { FornecedorService } from './services/fornecedor.service';

@Component({
  selector: 'app-fornecedores-lista',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TableModule, ButtonModule],
  templateUrl: './fornecedor.component.html',
})
export class FornecedorComponent {
  private readonly service = inject(FornecedorService);
  private readonly router = inject(Router);
  fornecedores: Fornecedor[] = [];
  busca = '';
  filtroAtivo: '' | 'true' | 'false' = '';
  carregando = false;
  erro = '';
  total = 0;
  pagina = 0;
  tamanho = 10;

  carregar(event?: TableLazyLoadEvent): void {
    if (event) {
      this.tamanho = event.rows || 10;
      this.pagina = Math.floor((event.first || 0) / this.tamanho);
    }
    this.erro = '';
    this.carregando = true;
    const ativo = this.filtroAtivo === '' ? null : this.filtroAtivo === 'true';
    this.service
      .listar(this.busca, ativo, this.pagina, this.tamanho)
      .pipe(finalize(() => (this.carregando = false)))
      .subscribe({
        next: (resposta) => {
          this.fornecedores = resposta.content;
          this.total = resposta.totalElements;
        },
        error: () => (this.erro = 'Não foi possível carregar os fornecedores.'),
      });
  }

  pesquisar(): void {
    this.pagina = 0;
    this.carregar();
  }
  editar(id: number): void {
    void this.router.navigate(['/fornecedores/edit', id]);
  }

  alternarStatus(fornecedor: Fornecedor): void {
    const acao = fornecedor.ativo ? 'desativar' : 'ativar';
    if (!window.confirm(`Deseja ${acao} ${fornecedor.razaoSocial}?`)) return;
    this.service.alterarStatus(fornecedor.fornecedorId, !fornecedor.ativo).subscribe({
      next: () => this.carregar(),
      error: () => (this.erro = `Não foi possível ${acao} o fornecedor.`),
    });
  }
}
