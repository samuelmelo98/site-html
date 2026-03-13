import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-user-create',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './user-create.page.html',
  styleUrls: ['./user-create.page.css']


})
export class UserCreatePage {

  form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]]
  });


  constructor(
    private fb: FormBuilder,
    private service: UserService
  ) {}

  salvar(): void {
    if (this.form.invalid) return;

    this.service.create(this.form.getRawValue()).subscribe({
      next: () => {
        alert('Usuário cadastrado com sucesso!');
        this.form.reset();
      },
      error: err => {
        console.error(err);
        alert('Erro ao salvar usuário');
      }
    });
  }


}
