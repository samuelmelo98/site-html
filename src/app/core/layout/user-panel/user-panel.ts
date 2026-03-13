import { Component, EventEmitter, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-user-panel',
  imports: [CommonModule],
  templateUrl: './user-panel.html',
  styleUrl: './user-panel.css',
})
export class UserPanel {
  perfilSelecionado  = input<string>();
  vinculoSelecionado = input<string>();
  avatarUrl?: string;
  logout = output<void>();
  changeVinculo = output<void>();
  configOpen = false;

  toggleConfig() {
    this.configOpen = !this.configOpen;

}
}
