// 🔹 Angular core
import { Component, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

// 🔹 PrimeNG v20 Modules
import { TableModule, Table } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ButtonModule } from 'primeng/button';

import { CpfPipe } from '../../../../shared/pipes/cpf.pipe';

// 🔹 Services
import { ClienteService } from '../../services/cliente.service';

import { NavigationService } from '../../../../shared/services/navegation-service';

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

  clienteSelecionado: any | null = null;

  private clienteService = inject(ClienteService);

  private navegationService = inject(NavigationService);

  @ViewChild('tabela') tabela!: Table;

  buscar(valor: string): void {
    this.termoBusca = valor;
    this.tabela.reset();
  }

  carregar(event: any): void {
    this.loading = true;

    const page = event.first / event.rows;
    const size = event.rows;
    const sortField = event.sortField ?? 'clienteId';
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

formatCpf(cpf: string): string {
  return cpf.replace(
    /(\d{3})(\d{3})(\d{3})(\d{2})/,
    '$1.$2.$3-$4'
  );
}


public adicionarAparelho(cliente: any){
  this.clienteSelecionado = cliente;
  console.log(this.clienteSelecionado);
    this.navegationService.irPara([
    'aparelho',
    cliente.clienteId.toString()
  ]);
  

}

formatarTelefone(telefone?: string | null): string {
  if (!telefone) {
    return '—';
  }

  const numeros = telefone.replace(/\D/g, '');

  if (numeros.length === 11) {
    return numeros.replace(
      /(\d{2})(\d{5})(\d{4})/,
      '($1) $2-$3'
    );
  }

  if (numeros.length === 10) {
    return numeros.replace(
      /(\d{2})(\d{4})(\d{4})/,
      '($1) $2-$3'
    );
  }

  return telefone;
}
}