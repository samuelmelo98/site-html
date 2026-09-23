import {
  Component,
  inject,
  signal,
} from '@angular/core';

import {
  CommonModule,
} from '@angular/common';

import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import {
  ActivatedRoute,
} from '@angular/router';

import {
  HttpErrorResponse,
} from '@angular/common/http';

import {
  finalize,
} from 'rxjs';

import {
  ButtonModule,
} from 'primeng/button';

import {
  CardModule,
} from 'primeng/card';

import {
  InputTextModule,
} from 'primeng/inputtext';

import {
  MessageModule,
} from 'primeng/message';

import {
  ProgressSpinnerModule,
} from 'primeng/progressspinner';

import {
  ConsultaOrdemServicoResponseDTO,
} from '../model/consulta-ordem-servico.dto';

import {
  ConsultaOrdemServicoService,
} from '../services/consulta-ordem-servico.service';

@Component({
  selector: 'app-consulta-ordem-servico',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    MessageModule,
    ProgressSpinnerModule,
  ],
  templateUrl: './consulta-ordem-servico.component.html',
  styleUrl: './consulta-ordem-servico.component.css',
})
export class ConsultaOrdemServicoComponent {

  private readonly route =
    inject(ActivatedRoute);

  private readonly consultaService =
    inject(ConsultaOrdemServicoService);

  readonly numero =
    this.route.snapshot.paramMap.get('numero') ?? '';

  private readonly token =
    this.route.snapshot.queryParamMap.get('t') ?? '';

  readonly carregando =
    signal(false);

  readonly erro =
    signal<string | null>(null);

  readonly ordem =
    signal<ConsultaOrdemServicoResponseDTO | null>(null);

  readonly linkValido =
    signal(
      this.numero.trim().length > 0
      && this.token.trim().length > 0,
    );

  readonly form =
    new FormGroup({
      ultimosDigitosCpf: new FormControl(
        '',
        {
          nonNullable: true,
          validators: [
            Validators.required,
            Validators.pattern(/^\d{2}$/),
          ],
        },
      ),
    });

  consultar(): void {

    this.erro.set(null);

    if (!this.linkValido()) {
      this.erro.set(
        'O link de consulta é inválido ou está incompleto.',
      );

      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();

      return;
    }

    const ultimosDigitosCpf =
      this.form.controls.ultimosDigitosCpf.value;

    this.carregando.set(true);
    this.ordem.set(null);

    this.consultaService
      .consultar(
        this.numero,
        {
          ultimosDigitosCpf,
          token: this.token,
        },
      )
      .pipe(
        finalize(() =>
          this.carregando.set(false),
        ),
      )
      .subscribe({
        next: response => {
          this.ordem.set(response);
        },

        error: (error: HttpErrorResponse) => {
          this.tratarErro(error);
        },
      });
  }

  private tratarErro(
    error: HttpErrorResponse,
  ): void {

    if (error.status === 401) {
      this.erro.set(
        'Não foi possível validar a consulta. Verifique os dois últimos dígitos do CPF.',
      );

      return;
    }

    if (error.status === 400) {
      this.erro.set(
        'Os dados informados são inválidos.',
      );

      return;
    }

    this.erro.set(
      'Não foi possível consultar a ordem de serviço no momento.',
    );
  }
}