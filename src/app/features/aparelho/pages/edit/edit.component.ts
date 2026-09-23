import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject,
  signal,
} from '@angular/core';

import {
  HttpErrorResponse,
} from '@angular/common/http';

import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import {
  takeUntilDestroyed,
} from '@angular/core/rxjs-interop';

import {
  finalize,
} from 'rxjs';

import {
  ButtonModule,
} from 'primeng/button';

import {
  DialogModule,
} from 'primeng/dialog';

import {
  InputTextModule,
} from 'primeng/inputtext';

import {
  SelectModule,
} from 'primeng/select';

import {
  AparelhoService,
} from '../../services/aparelho.service';

import {
  MarcaService,
} from '../../services/marca.service';

import {
  MarcaResponse,
} from '../../model/marca.dto';

import {
  AparelhoAtualizarDTO,
} from '../../model/aparelho-atualizar.dto';

import {
  TipoAparelhoResponse,
  TipoAparelhoService,
} from '../../services/tipo-aparelho.service';


@Component({
  selector: 'app-aparelho-edit',

  standalone: true,

  imports: [
    ReactiveFormsModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    SelectModule,
  ],

  templateUrl: './edit.component.html',

  styleUrl: './edit.component.css',

  changeDetection:
    ChangeDetectionStrategy.OnPush,
})
export class EditComponent
  implements OnChanges {

    readonly tipos =
  signal<TipoAparelhoResponse[]>(
    [],
  );

readonly carregandoTipos =
  signal(false);

readonly erroTipos =
  signal('');

    private readonly tipoAparelhoService =
  inject(TipoAparelhoService);

  @Input()
  visible = false;

  @Input()
  aparelhoId:
    number | null = null;


  @Output()
  visibleChange =
    new EventEmitter<boolean>();

  @Output()
  atualizado =
    new EventEmitter<void>();


  private readonly aparelhoService =
    inject(AparelhoService);

  private readonly marcaService =
    inject(MarcaService);

  private readonly destroyRef =
    inject(DestroyRef);


  readonly carregando =
    signal(false);

  readonly salvando =
    signal(false);

  readonly carregandoMarcas =
    signal(false);

  readonly erro =
    signal('');

  readonly erroMarcas =
    signal('');

  readonly marcas =
    signal<MarcaResponse[]>([]);


  private readonly textoObrigatorio = [
    Validators.required,
    Validators.pattern(/\S/),
  ];


  readonly form =
    new FormGroup({

      marcaId:
        new FormControl<number | null>(
          null,
          {
            validators: [
              Validators.required,
              Validators.min(1),
            ],
          },
        ),

        tipoAparelhoId:
  new FormControl<number | null>(
    null,
    {
      validators: [
        Validators.required,
        Validators.min(1),
      ],
    },
  ),

      modelo:
        new FormControl(
          '',
          {
            nonNullable: true,
            validators:
              this.textoObrigatorio,
          },
        ),

      modeloComercial:
        new FormControl(
          '',
          {
            nonNullable: true,
          },
        ),

      numeroSerie:
        new FormControl(
          '',
          {
            nonNullable: true,
            validators:
              this.textoObrigatorio,
          },
        ),

    });


  ngOnChanges(
    changes: SimpleChanges,
  ): void {

    const abriu =
      changes['visible'] &&
      this.visible;

    const mudouAparelho =
      changes['aparelhoId'] &&
      this.visible;


    if (
      (abriu || mudouAparelho) &&
      this.aparelhoId !== null
    ) {

      this.carregarMarcas();

this.carregarTipos();

this.carregarAparelho();
    }
  }


  private carregarAparelho(): void {

    const aparelhoId =
      this.aparelhoId;


    if (
      aparelhoId === null ||
      !Number.isSafeInteger(
        aparelhoId,
      ) ||
      aparelhoId <= 0
    ) {

      this.erro.set(
        'Aparelho inválido.',
      );

      return;
    }


    this.carregando.set(
      true,
    );

    this.erro.set(
      '',
    );


    this.aparelhoService
      .buscarPorId(
        aparelhoId,
      )
      .pipe(

        finalize(
          () =>
            this.carregando.set(
              false,
            ),
        ),

        takeUntilDestroyed(
          this.destroyRef,
        ),

      )
      .subscribe({

        next: aparelho => {

          this.form.reset({

  marcaId:
    aparelho.marcaId,

  tipoAparelhoId:
    aparelho.tipoAparelhoId,

  modelo:
    aparelho.modelo ?? '',

  modeloComercial:
    aparelho.modeloComercial ?? '',

  numeroSerie:
    aparelho.numeroSerie ?? '',

});
        },


        error: (
          erro: HttpErrorResponse,
        ) => {

          switch (
            erro.status
          ) {

            case 401:

              this.erro.set(
                'Sua sessão expirou. Entre novamente.',
              );

              break;


            case 403:

              this.erro.set(
                'Você não tem permissão para consultar este aparelho.',
              );

              break;


            case 404:

              this.erro.set(
                'Aparelho não encontrado.',
              );

              break;


            default:

              this.erro.set(
                erro.error?.detail ??
                erro.error?.message ??
                'Não foi possível carregar o aparelho.',
              );
          }
        },

      });
  }


  private carregarMarcas(): void {

    if (
      this.carregandoMarcas()
    ) {
      return;
    }


    this.carregandoMarcas.set(
      true,
    );

    this.erroMarcas.set(
      '',
    );


    this.marcaService
      .listarAtivas()
      .pipe(

        finalize(
          () =>
            this.carregandoMarcas.set(
              false,
            ),
        ),

        takeUntilDestroyed(
          this.destroyRef,
        ),

      )
      .subscribe({

        next: marcas => {

          this.marcas.set(
            marcas,
          );
        },


        error: () => {

          this.marcas.set(
            [],
          );

          this.erroMarcas.set(
            'Não foi possível carregar as marcas.',
          );
        },

      });
  }


  invalido(
    campo:
      keyof typeof this.form.controls,
  ): boolean {

    const controle =
      this.form.controls[
        campo
      ];

    return (
      controle.invalid &&
      controle.touched
    );
  }


  salvar(): void {

    if (
      this.salvando()
    ) {
      return;
    }
    


    const aparelhoId =
      this.aparelhoId;


    if (
      aparelhoId === null ||
      aparelhoId <= 0
    ) {

      this.erro.set(
        'Aparelho inválido.',
      );

      return;
    }


    this.erro.set(
      '',
    );


    this.form
      .markAllAsTouched();


    const dados =
      this.form
        .getRawValue();


   if (
  this.form.invalid ||
  dados.marcaId === null ||
  dados.tipoAparelhoId === null
) {
  return;
}


    const dto:
  AparelhoAtualizarDTO = {

    marcaId:
      dados.marcaId,

    tipoAparelhoId:
      dados.tipoAparelhoId,

    modelo:
      dados.modelo.trim(),

    modeloComercial:
      dados.modeloComercial.trim(),

    numeroSerie:
      dados.numeroSerie.trim(),

  };


    this.salvando.set(
      true,
    );


    this.aparelhoService
      .atualizar(
        aparelhoId,
        dto,
      )
      .pipe(

        finalize(
          () =>
            this.salvando.set(
              false,
            ),
        ),

        takeUntilDestroyed(
          this.destroyRef,
        ),

      )
      .subscribe({

        next: () => {

  this.atualizado.emit();

  this.visible =
    false;

  this.visibleChange.emit(
    false,
  );

  this.limpar();
},


        error: (
          erro: HttpErrorResponse,
        ) => {

          switch (
            erro.status
          ) {

            case 400:
            case 422:

              this.erro.set(
                erro.error?.detail ??
                'Confira os dados informados.',
              );

              break;


            case 401:

              this.erro.set(
                'Sua sessão expirou. Entre novamente.',
              );

              break;


            case 403:

              this.erro.set(
                'Você não tem permissão para alterar este aparelho.',
              );

              break;


            case 404:

              this.erro.set(
                erro.error?.detail ??
                'Aparelho ou marca não encontrado.',
              );

              break;


            default:

              this.erro.set(
                erro.error?.detail ??
                erro.error?.message ??
                'Não foi possível atualizar o aparelho.',
              );
          }
        },

      });
  }


  fechar(): void {

    if (
      this.salvando()
    ) {
      return;
    }


    this.visible =
      false;


    this.visibleChange.emit(
      false,
    );


    this.limpar();
  }


  alterarVisibilidade(
    visible: boolean,
  ): void {

    this.visible =
      visible;


    this.visibleChange.emit(
      visible,
    );


    if (
      !visible
    ) {
      this.limpar();
    }
  }


  private limpar(): void {

  this.form.reset();

  this.erro.set(
    '',
  );

  this.erroMarcas.set(
    '',
  );

  this.erroTipos.set(
    '',
  );
}

  private carregarTipos(): void {

  if (
    this.carregandoTipos()
  ) {
    return;
  }


  this.carregandoTipos.set(
    true,
  );

  this.erroTipos.set(
    '',
  );


  this.tipoAparelhoService
    .listarAtivos()
    .pipe(

      finalize(
        () =>
          this.carregandoTipos.set(
            false,
          ),
      ),

      takeUntilDestroyed(
        this.destroyRef,
      ),

    )
    .subscribe({

      next: tipos => {

        this.tipos.set(
          tipos,
        );
      },


      error: (
        erro: HttpErrorResponse,
      ) => {

        console.error(
          'Erro ao carregar tipos de aparelho:',
          erro,
        );

        this.tipos.set(
          [],
        );

        this.erroTipos.set(
          'Não foi possível carregar os tipos de aparelho.',
        );
      },

    });
}
}