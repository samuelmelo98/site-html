import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PdfService } from '../../services/pdf';
import { DashboardComponent } from '../dash-board/dash-board.component';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    RouterModule,
    DashboardComponent
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

  gerarPdfTeste() {
    this.pdfService.downloadPdfTeste().subscribe((blob) => {

      const fileURL = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = fileURL;
      a.download = 'relatorio.pdf';
      a.click();

      window.URL.revokeObjectURL(fileURL);
    });
  }
  
  

}
