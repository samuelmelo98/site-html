import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ValidacaoService } from '../../services/validacao.service';

@Component({
  selector: 'app-validacao',
  standalone: true,
  imports: [CommonModule],
  templateUrl: 'validacao.component.html',
  styleUrl: 'validacao.component.css'
})
export class ValidacaoComponent {

  private route = inject(ActivatedRoute);
  private service = inject(ValidacaoService);

  resultado: any;
  loading = true;

  ngOnInit() {
    const codigo = this.route.snapshot.paramMap.get('codigo');

    if (codigo) {
      this.service.validar(codigo).subscribe({
        next: (res) => {
          this.resultado = res;
          this.loading = false;
        },
        error: () => {
          this.resultado = { valido: false };
          this.loading = false;
        }
      });
    }
  }
}