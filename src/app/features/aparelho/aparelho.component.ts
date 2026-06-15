// 🔹 Angular
import { Component, inject, ViewChild } from '@angular/core';
import { Router, RouterModule,ActivatedRoute  } from '@angular/router';

// 🔹 Third-party (PrimeNG)
import { Button } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { Panel } from 'primeng/panel';

// 🔹 Shared components
import { SearchGenericComponent } from '../../shared/search-generic/search-generic.component';
import { SearchEvent } from '../../shared/search-generic/models/search-event.model';

import { NavigationService } from '../../shared/services/navegation-service'; 

// 🔹 Feature components (mesmo módulo)
import { CreateComponent } from './pages/create/create.component';
import { ListComponent } from './pages/list/list.component';
import { EditComponent } from './pages/edit/edit.component';


@Component({
  selector: 'app-aparelho',
  imports: [
    SearchGenericComponent,
    Button,
    DialogModule,
    EditComponent,
    Panel,
    ListComponent,
    RouterModule,

  ],
  templateUrl: './aparelho.component.html',
  styleUrl: './aparelho.component.css',
})
export class AparelhoComponent {
  private router = inject(Router);

    private navegationService = inject(NavigationService);

  private readonly route =
  inject(ActivatedRoute);

  clienteId!: number;

  visible = false;
  @ViewChild('lista')
  lista!: ListComponent;
  termoBusca = '';

  @ViewChild('modalEditar')
  modalEditar!: EditComponent;


ngOnInit(): void {

  this.clienteId = Number(
    this.route.snapshot.paramMap.get(
      'clienteId'
    )
  );

  console.log(this.clienteId);
}


  onSearch(event: SearchEvent): void {

    this.termoBusca = event.termo;

    this.lista.buscar(event.termo);

  }

  public irPara(path: string[]): void {
    this.router
      .navigate(path)
      .then((sucesso) => {
        if (!sucesso) {
          console.log('Erro ao navegar', path);
        }
      })
      .catch((err) => {
        console.log('Erro na navegação', err);
      });
  }

  
public adicionarAparelho(): void {

  this.navegationService.irPara([
    'aparelho',
    'create',
    this.clienteId.toString()
  ]);

}
}
