import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';

import {
  FormBuilder,
  ReactiveFormsModule
} from '@angular/forms';

import {
  debounceTime,
  distinctUntilChanged
} from 'rxjs';

import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';

import { SearchEvent } from './models/search-event.model';

@Component({
  selector: 'app-search-generic',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule
  ],
  templateUrl: './search-generic.component.html',
  styleUrl: './search-generic.component.css'
})
export class SearchGenericComponent implements OnInit {

  @Input()
  placeholder = 'Buscar';

  @Output()
  search = new EventEmitter<SearchEvent>();

  form = this.fb.nonNullable.group({
    valor: ''
  });

  constructor(
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.form.controls.valor.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged()
      )
      .subscribe(valor => {
        this.emitirBusca(valor);
      });
  }

  buscar(): void {
    this.emitirBusca(
      this.form.controls.valor.value
    );
  }

  limpar(): void {
    this.form.reset();

    this.search.emit({
      termo: ''
    });
  }

  private emitirBusca(valor: string): void {

    this.search.emit({
      termo: valor.trim()
    });

  }
}
