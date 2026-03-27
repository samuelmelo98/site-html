import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { MenuComponent } from "../menu/menu.component";
import { SideBar } from "../side-bar/side-bar";

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    MenuComponent,
     SideBar],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.css'
})

export class ShellComponent {
  menuOpen = true;

  toggleMenu(){
    this.menuOpen = !this.menuOpen;
  }
}
