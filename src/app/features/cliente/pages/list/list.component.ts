// 🔹 Angular core
import {
  Component,
  OnInit,
  ViewChild,
  EventEmitter,
  Output,
  inject,
} from '@angular/core';

// 🔹 Angular modules
import { CommonModule } from '@angular/common';

// 🔹 PrimeNG
import { TableModule, Table } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ButtonModule } from 'primeng/button';
import { ClienteService } from '../../services/cliente.service';

@Component({
  selector: 'app-list',
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
  private clienteService = inject(ClienteService);
  total = 0;
  loading = false;
  termoBusca = '';

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
