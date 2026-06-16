import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { ClassicEditor } from 'ckeditor5';  

export class DocumentoEditorComponent {

  public Editor = ClassicEditor;

  conteudo = `
    <h1>ORDEM DE SERVIÇO</h1>

    <p>
      Cliente:
      <span data-var="cliente.nome">
        Nome Cliente
      </span>
    </p>
  `;
}