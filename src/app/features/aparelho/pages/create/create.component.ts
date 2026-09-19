import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PanelModule } from 'primeng/panel';

export interface OpcaoAparelho {
  label: string;
  value: string;
}

export interface CadastroAparelho {
  clienteId: number;
  marca: string;
  modelo: string;
  modeloComercial: string;
  numeroSerie: string;
  descricao: string;
  tipo: string | null;
  defeito: string;
  observacao: string;
}

@Component({
  selector: 'app-aparelho-create',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    PanelModule,
  ],
  templateUrl: './create.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateComponent {
  readonly clienteNome = input('');
  readonly salvando = input(false);
  readonly erroSalvar = input('');

  readonly marcas = input<readonly OpcaoAparelho[]>([]);
  readonly tipos = input<readonly OpcaoAparelho[]>([]);

  readonly salvarAparelho = output<CadastroAparelho>();

  private readonly route = inject(ActivatedRoute);

  private readonly parametrosRota = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });

  readonly clienteId = computed<number | null>(() => {
    const parametro =
      this.parametrosRota()?.get('clienteId') ?? null;

    if (parametro === null || !/^[1-9]\d*$/.test(parametro)) {
      return null;
    }

    const id = Number(parametro);

    return Number.isSafeInteger(id) ? id : null;
  });

  readonly voltarPara = computed<string[]>(() => {
    const clienteId = this.clienteId();

    return clienteId === null
      ? ['/cliente']
      : ['/aparelho', String(clienteId)];
  });

  private readonly textoObrigatorio = [
    Validators.required,
    Validators.pattern(/\S/),
  ];

  readonly form = new FormGroup({
    marca: new FormControl('', {
      nonNullable: true,
      validators: this.textoObrigatorio,
    }),
    modelo: new FormControl('', {
      nonNullable: true,
      validators: this.textoObrigatorio,
    }),
    modeloComercial: new FormControl('', {
      nonNullable: true,
    }),
    numeroSerie: new FormControl('', {
      nonNullable: true,
      validators: this.textoObrigatorio,
    }),
    descricao: new FormControl('', {
      nonNullable: true,
    }),
    tipo: new FormControl<string | null>(null),
    defeito: new FormControl('', {
      nonNullable: true,
      validators: this.textoObrigatorio,
    }),
    observacao: new FormControl('', {
      nonNullable: true,
    }),
  });

  invalido(campo: keyof typeof this.form.controls): boolean {
    const controle = this.form.controls[campo];

    return controle.invalid && controle.touched;
  }

  salvar(): void {
    if (this.salvando()) {
      return;
    }

    this.form.markAllAsTouched();

    const clienteId = this.clienteId();

    if (this.form.invalid || clienteId === null) {
      return;
    }

    const dados = this.form.getRawValue();

    this.salvarAparelho.emit({
      clienteId,
      marca: dados.marca,
      modelo: dados.modelo.trim(),
      modeloComercial: dados.modeloComercial.trim(),
      numeroSerie: dados.numeroSerie.trim(),
      descricao: dados.descricao.trim(),
      tipo: dados.tipo,
      defeito: dados.defeito.trim(),
      observacao: dados.observacao.trim(),
    });
  }
}
