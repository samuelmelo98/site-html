import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { PanelModule } from 'primeng/panel';

import { SearchGenericComponent } from '../../shared/search-generic/search-generic.component';
import { SearchEvent } from '../../shared/search-generic/models/search-event.model';
import { ListComponent } from './pages/list/list.component';

@Component({
  selector: 'app-aparelho',
  standalone: true,
  imports: [
    RouterModule,
    ButtonModule,
    PanelModule,
    SearchGenericComponent,
    ListComponent,
  ],
  templateUrl: './aparelho.component.html',
  styleUrl: './aparelho.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AparelhoComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private readonly lista = viewChild<ListComponent>('lista');

  private readonly parametrosRota = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });

  readonly clienteId = computed<number | null>(() => {
    const parametro =
      this.parametrosRota()?.get('clienteId') ?? null;

    if (parametro === null || !/^[1-9]\d*$/.test(parametro)) {
      return null;
    }

    const id = Number(parametro);

    return Number.isSafeInteger(id) ? id : null;
  });

  onSearch(event: SearchEvent): void {
    this.lista()?.buscar(event.termo);
  }

  adicionarAparelho(): void {
    const clienteId = this.clienteId();

    if (clienteId === null) {
      return;
    }

    this.irPara(['/aparelho', 'create', String(clienteId)]);
  }

  irPara(path: string[]): void {
    this.router
      .navigate(path)
      .then(sucesso => {
        if (!sucesso) {
          console.error('Navegação cancelada:', path);
        }
      })
      .catch((erro: unknown) => {
        console.error('Erro ao navegar:', erro);
      });
  }
}
