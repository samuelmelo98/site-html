import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  inject
} from '@angular/core';

import { TreeNode } from 'primeng/api';

import { SplitterModule } from 'primeng/splitter';
import { TreeModule } from 'primeng/tree';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';

import { monaco } from '../../../monaco-worker';

import { HttpClient } from '@angular/common/http';

import {
  DomSanitizer,
  SafeResourceUrl
} from '@angular/platform-browser';

@Component({
  selector: 'app-editor-teste',
  standalone: true,
  imports: [
    SplitterModule,
    TreeModule,
    ToolbarModule,
    ButtonModule
  ],
  templateUrl: './editor-teste.component.html'
})
export class EditorTesteComponent
  implements AfterViewInit, OnDestroy {

    private http = inject(HttpClient);

  @ViewChild('editor')
  editor?: ElementRef<HTMLDivElement>;

  private editorInstance?: monaco.editor.IStandaloneCodeEditor;

  htmlPreview = '';
  modoPreview: 'html' | 'pdf' = 'html';

 private sanitizer =
  inject(DomSanitizer);

pdfUrl?: SafeResourceUrl;

  variaveis: TreeNode[] = [
    {
      label: 'Cliente',
      expanded: true,
      children: [
        { label: 'Nome', data: '${cliente.nome}' },
        { label: 'CPF', data: '${cliente.cpf}' },
        { label: 'Telefone', data: '${cliente.telefone}' },
        { label: 'E-mail', data: '${cliente.email}' }
      ]
    },
    {
      label: 'Aparelho',
      expanded: true,
      children: [
        { label: 'Marca', data: '${aparelho.marca}' },
        { label: 'Modelo', data: '${aparelho.modelo}' },
        { label: 'Número Série', data: '${aparelho.numeroSerie}' }
      ]
    },
    {
      label: 'OS',
      expanded: true,
      children: [
        { label: 'Número', data: '${os.numero}' },
        { label: 'Data Entrada', data: '${os.dataEntrada}' }
      ]
    }
  ];

  ngAfterViewInit(): void {

    if (!this.editor) {
      console.error('Container do Monaco não encontrado.');
      return;
    }

    this.editorInstance =
      monaco.editor.create(
        this.editor.nativeElement,
        {
          value: this.templateInicial(),
          language: 'html',
          theme: 'vs',
          automaticLayout: true,
          fontSize: 14,
          minimap: {
            enabled: false
          }
        }
      );
  }

  ngOnDestroy(): void {
    this.editorInstance?.dispose();
  }

  inserirVariavel(event: { node: TreeNode }): void {

    if (!event.node?.data || !this.editorInstance) {
      return;
    }

    const selection =
      this.editorInstance.getSelection();

    if (!selection) {
      return;
    }

    this.editorInstance.executeEdits(
      'inserir-variavel',
      [
        {
          range: selection,
          text: String(event.node.data)
        }
      ]
    );

    this.editorInstance.focus();
  }

  visualizar(): void {
    this.modoPreview = 'html';

    if (!this.editorInstance) {
      return;
    }

    this.htmlPreview =
      this.editorInstance.getValue();

    console.log(this.htmlPreview);
  }


visualizarBack(): void {
 

  if (!this.editorInstance) {
    return;
  }

  this.http.post(
    '/api/documentos/v1/preview',
    {
      template: this.editorInstance.getValue()
    },
    {
      responseType: 'text'
    }
  )
  .subscribe(html => {

    this.htmlPreview = html;

  });
   this.modoPreview = 'html';

}

visualizarPdf(): void {

  if (!this.editorInstance) {
    return;
  }

  this.http.post(
    '/api/documentos/v1/preview-pdf',
    {
      template: this.editorInstance.getValue()
    },
    {
      responseType: 'blob'
    }
  )
  .subscribe(pdf => {

  const blobUrl =
    URL.createObjectURL(pdf);

  this.pdfUrl =
    this.sanitizer
      .bypassSecurityTrustResourceUrl(blobUrl);

       this.modoPreview = 'pdf';

});

}


  salvar(): void {

    if (!this.editorInstance) {
      return;
    }

    const html =
      this.editorInstance.getValue();

    console.log('HTML para salvar:');
    console.log(html);

    // TODO:
    // this.documentoTemplateService.salvar(...)
  }

  private templateInicial(): string {

    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">

<style>

body{
    font-family: Arial, sans-serif;
    margin:40px;
}

h1{
    color:#0f4c81;
}

.card{
    border:1px solid #dcdcdc;
    padding:20px;
    border-radius:8px;
}

</style>

</head>

<body>

<div class="card">

    <h1>\${cliente.nome}</h1>

    <p>
        CPF:
        \${cliente.cpf}
    </p>

    <p>
        Equipamento:
        \${aparelho.marca}
        -
        \${aparelho.modelo}
    </p>

</div>

</body>
</html>`;
  }
}