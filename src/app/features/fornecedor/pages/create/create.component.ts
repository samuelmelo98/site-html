import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { finalize } from 'rxjs';
import { FornecedorRequest, TipoPessoa } from '../../model/fornecedor.model';
import { FornecedorService } from '../../services/fornecedor.service';

@Component({
  selector: 'app-fornecedor-formulario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, ButtonModule],
  templateUrl: './create.component.html',
  styles: [
    `
      .campos {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
        gap: 1rem;
      }
      label {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
      }
      input,
      select,
      textarea {
        width: 100%;
        padding: 0.65rem;
      }
    `,
  ],
})
export class CreateComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(FornecedorService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly ufs = [
    'AC',
    'AL',
    'AP',
    'AM',
    'BA',
    'CE',
    'DF',
    'ES',
    'GO',
    'MA',
    'MT',
    'MS',
    'MG',
    'PA',
    'PB',
    'PR',
    'PE',
    'PI',
    'RJ',
    'RN',
    'RS',
    'RO',
    'RR',
    'SC',
    'SP',
    'SE',
    'TO',
  ];
  id: number | null = null;
  salvando = false;
  carregando = false;
  erro = '';

  form = this.fb.nonNullable.group({
    tipoPessoa: 'PJ' as TipoPessoa,
    razaoSocial: ['', [Validators.required, Validators.maxLength(200)]],
    nomeFantasia: ['', Validators.maxLength(200)],
    cpfCnpj: ['', Validators.required],
    inscricaoEstadual: ['', Validators.maxLength(30)],
    email: ['', Validators.email],
    telefone: ['', Validators.maxLength(20)],
    whatsapp: ['', Validators.maxLength(20)],
    cep: [''],
    endereco: ['', Validators.maxLength(200)],
    numero: ['', Validators.maxLength(20)],
    complemento: ['', Validators.maxLength(100)],
    bairro: ['', Validators.maxLength(100)],
    cidade: ['', Validators.maxLength(100)],
    estado: [''],
    observacao: [''],
  });

  ngOnInit(): void {
    const valorId = this.route.snapshot.paramMap.get('fornecedorId');
    if (!valorId) return;
    this.id = Number(valorId);
    if (!Number.isSafeInteger(this.id) || this.id <= 0) {
      this.erro = 'ID inválido.';
      return;
    }
    this.carregando = true;
    this.service
      .buscar(this.id)
      .pipe(finalize(() => (this.carregando = false)))
      .subscribe({
        next: (fornecedor) => {
          this.form.patchValue({
            tipoPessoa: fornecedor.tipoPessoa,
            razaoSocial: fornecedor.razaoSocial,
            nomeFantasia: fornecedor.nomeFantasia ?? '',
            cpfCnpj: fornecedor.cpfCnpj,
            inscricaoEstadual: fornecedor.inscricaoEstadual ?? '',
            email: fornecedor.email ?? '',
            telefone: fornecedor.telefone ?? '',
            whatsapp: fornecedor.whatsapp ?? '',
            cep: fornecedor.cep ?? '',
            endereco: fornecedor.endereco ?? '',
            numero: fornecedor.numero ?? '',
            complemento: fornecedor.complemento ?? '',
            bairro: fornecedor.bairro ?? '',
            cidade: fornecedor.cidade ?? '',
            estado: fornecedor.estado ?? '',
            observacao: fornecedor.observacao ?? '',
          });
        },
        error: () => (this.erro = 'Não foi possível localizar o fornecedor.'),
      });
  }

  salvar(): void {
    if (this.form.invalid || this.salvando || this.carregando) {
      this.form.markAllAsTouched();
      return;
    }
    this.erro = '';
    const raw = this.form.getRawValue();
    const apenasNumeros = (v: string) => v.replace(/\D/g, '');
    const optional = (v: string) => v.trim() || null;
    const documento = apenasNumeros(raw.cpfCnpj);
    if (documento.length !== (raw.tipoPessoa === 'PJ' ? 14 : 11)) {
      this.erro = 'CPF/CNPJ inválido para o tipo de pessoa selecionado.';
      return;
    }
    const dto: FornecedorRequest = {
      ...raw,
      razaoSocial: raw.razaoSocial.trim(),
      cpfCnpj: documento,
      nomeFantasia: optional(raw.nomeFantasia),
      inscricaoEstadual: optional(raw.inscricaoEstadual),
      email: optional(raw.email),
      telefone: optional(raw.telefone),
      whatsapp: optional(raw.whatsapp),
      cep: optional(apenasNumeros(raw.cep)),
      endereco: optional(raw.endereco),
      numero: optional(raw.numero),
      complemento: optional(raw.complemento),
      bairro: optional(raw.bairro),
      cidade: optional(raw.cidade),
      estado: optional(raw.estado),
      observacao: optional(raw.observacao),
    };
    this.salvando = true;
    const requisicao =
      this.id === null ? this.service.criar(dto) : this.service.atualizar(this.id, dto);
    requisicao.pipe(finalize(() => (this.salvando = false))).subscribe({
      next: () => void this.router.navigate(['/fornecedores']),
      error: (err) =>
        (this.erro =
          err.status === 409
            ? 'CPF/CNPJ já cadastrado.'
            : 'Não foi possível salvar. Confira os dados e as permissões.'),
    });
  }
}
