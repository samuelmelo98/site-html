// 🔹 Angular
import { Component, inject, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

// 🔹 Third-party (PrimeNG)
import { Button } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { Panel } from 'primeng/panel';

// 🔹 Shared components
import { SearchGenericComponent } from '../../shared/search-generic/search-generic.component';
import { SearchEvent } from '../../shared/search-generic/models/search-event.model';

// 🔹 Feature components (mesmo módulo)
import { CreateComponent } from './pages/create/create.component';
import { ListComponent } from './pages/list/list.component';
import { EditComponent } from './pages/edit/edit.component';


@Component({
  selector: 'app-cliente',
  imports: [
    SearchGenericComponent,
    Button,
    DialogModule,
    EditComponent,
    Panel,
    ListComponent,
    RouterModule,
  ],
  templateUrl: './cliente.component.html',
  styleUrl: './cliente.component.css',
})
export class ClienteComponent {
  private router = inject(Router);

  visible = false;
  @ViewChild('lista')
  lista!: ListComponent;
  termoBusca = '';

  @ViewChild('modalEditar')
  modalEditar!: EditComponent;

  onSearch(event: SearchEvent): void {

    this.termoBusca = event.termo;

    this.lista.buscar(event.termo);

  }

}
