import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class NavigationService {

  private readonly router = inject(Router);

  public irPara(path: string[]): void {

    this.router
      .navigate(path)
      .then((sucesso) => {

        if (!sucesso) {
          console.error(
            'Erro ao navegar',
            path
          );
        }

      })
      .catch((err) => {

        console.error(
          'Erro na navegação',
          err
        );

      });
  }

  public voltar(): void {
    window.history.back();
  }
}