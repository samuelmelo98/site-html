import { Component, inject } from '@angular/core';

import { NavigationEnd, Router, RouterOutlet } from '@angular/router';

import { filter } from 'rxjs';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { signal } from '@angular/core';

import { HeaderComponent } from '../header/header.component';

import { SideBar } from '../side-bar/side-bar';

import { GlobalLoaderComponent } from '../ui/components/global-loader/global-loader.component';

import { AuthStore } from '../../../../app/features/security/store/auth.store';

@Component({
  selector: 'app-shell',

  standalone: true,

  imports: [RouterOutlet, HeaderComponent, SideBar, GlobalLoaderComponent],

  templateUrl: './shell.component.html',

  styleUrl: './shell.component.css',
})
export class ShellComponent {
  readonly authStore = inject(AuthStore);

  private readonly router = inject(Router);

  readonly rotaPublica = signal(this.isRotaPublica(window.location.pathname));

  menuOpen = false;

  constructor() {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe((event) => {
        this.rotaPublica.set(this.isRotaPublica(event.urlAfterRedirects));
      });
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  private isRotaPublica(url: string): boolean {
    const path = url.split('?')[0].split('#')[0];

    return (
      path.startsWith('/consulta/os/') ||
      path.startsWith('/validacao/') ||
      path === '/acesso-negado'
    );
  }
}
