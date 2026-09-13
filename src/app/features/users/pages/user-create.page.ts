import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../services/user.service';
import { EmailTestService } from '../services/email-test.service';
@Component({
  selector: 'app-user-create',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './user-create.page.html',
  styleUrls: ['./user-create.page.css']


})
export class UserCreatePage {

    testandoEmail = false;

  form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]]
  });


  constructor(
    private fb: FormBuilder,
    private service: UserService,
    private emailTestService: EmailTestService
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

  testarEmail(): void {
    this.testandoEmail = true;

    this.emailTestService.testar().subscribe({
      next: response => {
        this.testandoEmail = false;

        console.log('Resposta string-emails:', response);

        alert(
          `E-mail enviado!\n\n` +
          `Status: ${response.status}\n` +
          `Request ID: ${response.requestId}`
        );
      },
      error: err => {
        this.testandoEmail = false;

        console.error('Erro no teste de e-mail:', err);

        alert(
          `Erro ao testar envio de e-mail.\n` +
          `HTTP: ${err.status}`
        );
      }
    });
  }


}
