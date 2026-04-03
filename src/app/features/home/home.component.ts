import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PdfService } from '../../services/pdf';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    RouterModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {


  // ✅ Angular moderno
  private pdfService = inject(PdfService);

  gerarPdf() {
    this.pdfService.downloadPdf().subscribe((blob) => {

      const fileURL = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = fileURL;
      a.download = 'relatorio.pdf';
      a.click();

      window.URL.revokeObjectURL(fileURL);
    });
  }
  

}
