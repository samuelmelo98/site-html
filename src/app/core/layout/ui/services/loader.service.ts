import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoaderService {

  private readonly _loading = signal(false);
  readonly loading = this._loading.asReadonly();

  private count = 0;

show() {
  this.count++;
  this._loading.set(true);
}

hide() {
  this.count = Math.max(0, this.count - 1);
  if (this.count === 0) {
    this._loading.set(false);
  }
}

}
