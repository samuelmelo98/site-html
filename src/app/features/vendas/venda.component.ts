import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';

import {
  RouterOutlet,
} from '@angular/router';

@Component({
  selector: 'app-venda',
  standalone: true,
  imports: [
    RouterOutlet,
  ],
  templateUrl: './venda.component.html',
  styleUrl: './venda.component.css',
  changeDetection:
    ChangeDetectionStrategy.OnPush,
})
export class VendaComponent {
}
