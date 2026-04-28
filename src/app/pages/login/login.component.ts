import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../api/user.service';
import { AuthService } from '../../services/auth.service';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  isLogin = signal(true);
  isLoading = signal(false);
  error = signal('');

  formData = {
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  };

  constructor(
    private userService: UserService,
    private auth: AuthService,
    private router: Router
  ) { }

  toggleMode(): void {
    this.isLogin.update(v => !v);
    this.error.set('');
  }

  onSubmit(): void {
    if (!this.formData.email || !this.formData.password) {
      this.error.set('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    if (!this.isLogin() && (!this.formData.firstName || !this.formData.lastName)) {
      this.error.set("Le prénom et le nom sont obligatoires pour s'inscrire.");
      return;
    }

    this.isLoading.set(true);
    this.error.set('');

    const request = this.isLogin()
      ? this.userService.login({ email: this.formData.email, password: this.formData.password })
      : this.userService.register(this.formData);

    request.subscribe({
      next: (res) => {
        if (res.access_token && res.user) {
          this.auth.setAuthData(res.user, res.access_token);
          this.router.navigate(['/']);
        } else {
          this.error.set('Format de réponse invalide.');
          this.isLoading.set(false);
        }
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Une erreur est survenue.');
        this.isLoading.set(false);
      }
    });
  }
}
