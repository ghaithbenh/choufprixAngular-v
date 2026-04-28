import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../api/user.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-users.component.html'
})
export class AdminUsersComponent implements OnInit {
  users = signal<any[]>([]);
  isLoading = signal(true);
  isCreateModalOpen = signal(false);
  newUser = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'user'
  };

  constructor(
    private userService: UserService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.auth.isAdmin()) {
      this.router.navigate(['/']);
      return;
    }
    this.loadUsers();
  }

  private async loadUsers(): Promise<void> {
    const token = await this.auth.getToken();
    if (!token) return;
    this.userService.getAllUsers(token).subscribe({
      next: (users) => {
        this.users.set(users);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  async updateRole(userId: string, event: Event): Promise<void> {
    const role = (event.target as HTMLSelectElement).value;
    const token = await this.auth.getToken();
    if (!token) return;
    this.userService.updateUserRole(userId, role, token).subscribe({
      next: () => {
        this.users.update(users =>
          users.map(u => u.id === userId
            ? { ...u, role: role || 'user' }
            : u
          )
        );
      }
    });
  }

  openCreateModal() { this.isCreateModalOpen.set(true); }
  closeCreateModal() { this.isCreateModalOpen.set(false); }

  async createUser(): Promise<void> {
    const token = await this.auth.getToken();
    if (!token) return;
    this.userService.createUser(this.newUser, token).subscribe({
      next: (user) => {
        this.users.update(users => [...users, user]);
        this.closeCreateModal();
        this.newUser = { firstName: '', lastName: '', email: '', password: '', role: 'user' };
      },
      error: (err) => alert(err?.error?.message || 'Erreur lors de la création')
    });
  }

  async deleteUser(userId: string): Promise<void> {
    if (!confirm('Voulez-vous vraiment supprimer cet utilisateur ?')) return;
    const token = await this.auth.getToken();
    if (!token) return;
    this.userService.deleteUser(userId, token).subscribe({
      next: () => {
        this.users.update(users => users.filter(u => u.id !== userId));
      },
      error: (err) => alert(err?.error?.message || 'Erreur lors de la suppression')
    });
  }

  getUserInitials(user: any): string {
    const first = user.firstName?.charAt(0) || '';
    const last = user.lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || user.email?.charAt(0).toUpperCase() || '?';
  }
}
