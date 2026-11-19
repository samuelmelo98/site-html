import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DocumentoTemplateAdminService, TemplateResumo } from './documento-template-admin.service';

@Component({
  selector: 'app-documento-template-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './documento-template-editor.component.html',
  styleUrls: ['./documento-template-editor.component.css'],
})
export class DocumentoTemplateEditorComponent implements OnInit, OnDestroy {
  private readonly api = inject(DocumentoTemplateAdminService);
  versoes: TemplateResumo[] = [];
  slug = 'venda-cupom';
  versao = 0;
  html = '';
  descricao = 'Comprovante de venda não fiscal';
  vendaId: number | null = null;
  previewHtml = '';
  carregando = false;
  erro = '';
  aviso = '';
  alterado = false;
  largura: '80mm' | '210mm' = '80mm';

  ngOnInit(): void {
    this.listar();
  }
  ngOnDestroy(): void {
    /* Sem recursos externos pendentes. */
  }

  listar(): void {
    this.api.listar().subscribe({
      next: (dados) => {
        this.versoes = dados;
        if (dados.length) this.carregar(dados[0].version);
        else this.erro = 'Nenhum template encontrado. Cadastre primeiro o cupom no banco.';
      },
      error: (e) => (this.erro = this.mensagem(e)),
    });
  }

  carregar(versao: number): void {
    if (this.alterado && !confirm('Descartar as alterações não publicadas?')) return;
    this.api.buscar(this.slug, versao).subscribe({
      next: (t) => {
        this.versao = t.version;
        this.html = t.template;
        this.descricao = t.description ?? '';
        this.alterado = false;
        this.previewHtml = '';
        this.erro = '';
        this.aviso = '';
      },
      error: (e) => (this.erro = this.mensagem(e)),
    });
  }

  visualizar(): void {
    if (!this.vendaId || !Number.isInteger(this.vendaId) || this.vendaId <= 0) {
      this.erro = 'Informe o ID de uma venda finalizada.';
      return;
    }
    this.carregando = true;
    this.erro = '';
    this.api.preview(this.slug, this.html, this.vendaId).subscribe({
      next: (resultado) => {
        this.previewHtml = resultado.html;
        this.carregando = false;
      },
      error: (e) => {
        this.erro = this.mensagem(e);
        this.carregando = false;
      },
    });
  }

  publicar(): void {
    if (!this.previewHtml) {
      this.erro = 'Gere o preview antes de publicar.';
      return;
    }
    if (!confirm(`Publicar uma nova versão do template ${this.slug}?`)) return;
    this.carregando = true;
    this.api.publicar(this.slug, this.html, this.descricao, this.versao).subscribe({
      next: (t) => {
        this.versao = t.version;
        this.alterado = false;
        this.carregando = false;
        this.aviso = `Versão ${t.version} publicada com sucesso.`;
        this.api.listar().subscribe({ next: (dados) => (this.versoes = dados) });
      },
      error: (e) => {
        this.erro = this.mensagem(e);
        this.carregando = false;
      },
    });
  }

  editar(): void {
    this.alterado = true;
    this.previewHtml = '';
    this.aviso = '';
  }
  private mensagem(e: any): string {
    return e?.error?.detail ?? e?.error?.message ?? 'Falha ao chamar a API de templates.';
  }
}
