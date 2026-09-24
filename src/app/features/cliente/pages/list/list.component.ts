import {
  Component,
  ViewChild,
  inject,
} from '@angular/core';

import {
  CommonModule,
} from '@angular/common';

import {
  Table,
  TableModule,
} from 'primeng/table';

import {
  TagModule,
} from 'primeng/tag';

import {
  ProgressSpinnerModule,
} from 'primeng/progressspinner';

import {
  ButtonModule,
} from 'primeng/button';

import {
  CpfPipe,
} from '../../../../shared/pipes/cpf.pipe';

import {
  ClienteService,
} from '../../services/cliente.service';

import {
  NavigationService,
} from '../../../../shared/services/navegation-service';

import {
  Cliente,
} from '../../model/cliente-listar.dto';

import {
  EditComponent,
} from '../edit/edit.component';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    TagModule,
    ProgressSpinnerModule,
    ButtonModule,
    CpfPipe,
    EditComponent,
  ],
  templateUrl: './list.component.html',
  styleUrl: './list.component.css',
})
export class ListComponent {

  modalEdicaoVisivel = false;

  clienteEdicaoId: number | null = null;

  dados2: Cliente[] = [];

  total = 0;

  loading = false;

  termoBusca = '';

  clienteSelecionado: Cliente | null = null;

  private readonly clienteService =
    inject(ClienteService);

  private readonly navegationService =
    inject(NavigationService);

  @ViewChild('tabela')
  tabela!: Table;

  buscar(valor: string): void {
    this.termoBusca = valor;
    this.tabela.reset();
  }

  carregar(event: any): void {

    this.loading = true;

    const page =
      event.first / event.rows;

    const size =
      event.rows;

    const sortField =
      event.sortField ?? 'clienteId';

    const sortOrder =
      event.sortOrder === 1
        ? 'asc'
        : 'desc';

    this.clienteService
      .listarPaginado(
        page,
        size,
        sortField,
        sortOrder,
        this.termoBusca,
      )
      .subscribe({
        next: (res) => {

          this.dados2 =
            res.content;

          this.total =
            res.totalElements;

          this.loading =
            false;
        },
        error: () => {

          this.loading =
            false;
        },
      });
  }

  recarregar(): void {
    this.tabela.reset();
  }

  public adicionarAparelho(
    cliente: Cliente,
  ): void {

    this.clienteSelecionado =
      cliente;

    this.navegationService.irPara([
      'aparelho',
      cliente.clienteId.toString(),
    ]);
  }

  formatarTelefone(
    telefone?: string | null,
  ): string {

    if (!telefone) {
      return '—';
    }

    const numeros =
      telefone.replace(/\D/g, '');

    if (numeros.length === 11) {

      return numeros.replace(
        /(\d{2})(\d{5})(\d{4})/,
        '($1) $2-$3',
      );
    }

    if (numeros.length === 10) {

      return numeros.replace(
        /(\d{2})(\d{4})(\d{4})/,
        '($1) $2-$3',
      );
    }

    return telefone;
  }

  editarCliente(
    event: Event,
    cliente: Cliente,
  ): void {

    event.stopPropagation();

    this.clienteEdicaoId =
      cliente.clienteId;

    this.modalEdicaoVisivel =
      true;
  }

  clienteAtualizado(): void {
    this.recarregar();
  }
}