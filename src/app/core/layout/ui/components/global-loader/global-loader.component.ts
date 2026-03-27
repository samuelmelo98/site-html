import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoaderService } from '../../services/loader.service';

@Component({
  selector: 'app-global-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
  @if (loader.loading()) {
    <div
      class="fixed inset-0 z-[9999]
             flex flex-col items-center justify-center
             bg-black/40 backdrop-blur-sm
             transition-opacity duration-300"
      aria-live="assertive"
      aria-busy="true"
    >

      <!-- Spinner -->
      <div
        class="w-14 h-14
               border-4 border-white/20
               border-t-white
               rounded-full
               animate-spin"
      ></div>

      <!-- Texto opcional -->
      <span class="mt-4 text-sm text-white/90 tracking-wide">
        Processando...
      </span>

    </div>
  }
`

})
export class GlobalLoaderComponent {
  constructor(public loader: LoaderService) {}
}
