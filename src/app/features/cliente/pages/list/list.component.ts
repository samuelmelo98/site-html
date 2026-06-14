// 🔹 Angular core
import { Component, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

// 🔹 PrimeNG v20 Modules
import { TableModule, Table } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ButtonModule } from 'primeng/button';

// 🔹 Services
import { ClienteService } from '../../services/cliente.service';

@Component({
  selector: 'app-list',
  standalone: true, // Adicionado explicitamente para garantir o escopo no Angular 20
  imports: [
    CommonModule,
    TableModule,
    TagModule,
    ProgressSpinnerModule,
    ButtonModule,
  ],
  templateUrl: './list.component.html',
  styleUrl: './list.component.css',
})
export class ListComponent {
  dados2: any[] = [];
  total = 0;
  loading = false;
  termoBusca = '';

  private clienteService = inject(ClienteService);
  @ViewChild('tabela') tabela!: Table;

  buscar(valor: string): void {
    this.termoBusca = valor;
    this.tabela.reset();
  }

  carregar(event: any): void {
    this.loading = true;

    const page = event.first / event.rows;
    const size = event.rows;
    const sortField = event.sortField ?? 'id';
    const sortOrder = event.sortOrder === 1 ? 'asc' : 'desc';

    this.clienteService
      .listarPaginado(page, size, sortField, sortOrder, this.termoBusca)
      .subscribe({
        next: (res) => {
          this.dados2 = res.content;
          this.total = res.totalElements;
          this.loading = false;
        },
        error: () => (this.loading = false),
      });
  }

  recarregar(): void {
    this.tabela.reset();
  }
}