import {
  Component,
  inject,
} from '@angular/core';

import {
  RouterOutlet,
} from '@angular/router';

import {
  HeaderComponent,
} from '../header/header.component';

import {
  SideBar,
} from '../side-bar/side-bar';

import {
  GlobalLoaderComponent,
} from '../ui/components/global-loader/global-loader.component';

import {
  AuthStore,
} from '../../../../app/features/security/store/auth.store';

@Component({
  selector: 'app-shell',

  standalone: true,

  imports: [
    RouterOutlet,
    HeaderComponent,
    SideBar,
    GlobalLoaderComponent,
  ],

  templateUrl: './shell.component.html',

  styleUrl: './shell.component.css',
})
export class ShellComponent {

  readonly authStore =
    inject(AuthStore);

  menuOpen = false;

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }
}