// 🔹 Angular core
import { Component, ViewChild, inject, input  } from '@angular/core';
import { CommonModule } from '@angular/common';

// 🔹 PrimeNG v20 Modules
import { TableModule, Table } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ButtonModule } from 'primeng/button';

import { CpfPipe } from '../../../../shared/pipes/cpf.pipe';

// 🔹 Services
import { ClienteService } from '../../services/cliente.service';

import { AparelhoService } from '../../services/aparelho.service';

@Component({
  selector: 'app-list',
  standalone: true, // Adicionado explicitamente para garantir o escopo no Angular 20
  imports: [
    CommonModule,
    TableModule,
    TagModule,
    ProgressSpinnerModule,
    ButtonModule,
    CpfPipe,
  ],
  templateUrl: './list.component.html',
  styleUrl: './list.component.css',
})
export class ListComponent {
  dados2: any[] = [];
  total = 0;
  loading = false;
  termoBusca = '';

  clienteId = input.required<number>();

  clienteSelecionado: any | null = null;

  private clienteService = inject(ClienteService);

   private aparelhoService = inject(AparelhoService);
  @ViewChild('tabela') tabela!: Table;

ngInit(){
  console.log(this.clienteId);
}


  buscar(valor: string): void {
    this.termoBusca = valor;
    this.tabela.reset();
  }

  carregar(event: any): void {
    this.loading = true;

    const page = event.first / event.rows;
    const size = event.rows;
    const sortField = event.sortField ?? 'aparelhoId';
    const sortOrder = event.sortOrder === 1 ? 'asc' : 'desc';

    this.aparelhoService
      .listarPaginado(page, size, sortField, sortOrder, this.termoBusca,this.clienteId())
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

formatCpf(cpf: string): string {
  return cpf.replace(
    /(\d{3})(\d{3})(\d{3})(\d{2})/,
    '$1.$2.$3-$4'
  );
}


public adicionarAparelho(pessoa: any){
  this.clienteSelecionado = pessoa;
  console.log(this.clienteSelecionado);

}
}