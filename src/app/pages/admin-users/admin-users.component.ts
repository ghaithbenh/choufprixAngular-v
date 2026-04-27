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
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      <!-- Header -->
      <div class="mb-10">
        <h1 class="font-outfit text-4xl font-black text-slate-900">👥 Gestion des utilisateurs</h1>
        <p class="text-slate-500 mt-1">Gérez les rôles et permissions des utilisateurs</p>
      </div>

      @if (isLoading()) {
        <div class="space-y-3">
          @for (i of [1,2,3,4,5]; track i) {
            <div class="h-16 bg-slate-200 rounded-xl animate-pulse"></div>
          }
        </div>
      } @else {
        <div class="card overflow-hidden">
          <table class="w-full">
            <thead class="bg-slate-50 border-b border-gray-100">
              <tr>
                <th class="text-left px-6 py-4 text-sm font-semibold text-slate-600">Utilisateur</th>
                <th class="text-left px-6 py-4 text-sm font-semibold text-slate-600">Email</th>
                <th class="text-left px-6 py-4 text-sm font-semibold text-slate-600">Rôle</th>
                <th class="text-left px-6 py-4 text-sm font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              @for (user of users(); track user.id) {
                <tr class="hover:bg-slate-50 transition-colors">
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                      <div class="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white text-sm font-semibold">
                        {{ getUserInitials(user) }}
                      </div>
                      <span class="font-medium text-slate-800 text-sm">
                        {{ user.firstName || '' }} {{ user.lastName || '' }}
                      </span>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-slate-600 text-sm">
                    {{ user.emailAddresses?.[0]?.emailAddress || '—' }}
                  </td>
                  <td class="px-6 py-4">
                    <span class="badge text-xs"
                          [class.bg-red-100]="user.publicMetadata?.role === 'admin'"
                          [class.text-red-700]="user.publicMetadata?.role === 'admin'"
                          [class.bg-purple-100]="user.publicMetadata?.role === 'sub-admin'"
                          [class.text-purple-700]="user.publicMetadata?.role === 'sub-admin'"
                          [class.bg-slate-100]="!user.publicMetadata?.role"
                          [class.text-slate-600]="!user.publicMetadata?.role">
                      {{ user.publicMetadata?.role || 'Utilisateur' }}
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <select class="input-field !py-1.5 text-sm !w-40"
                            [value]="user.publicMetadata?.role || ''"
                            (change)="updateRole(user.id, $event)">
                      <option value="">Utilisateur</option>
                      <option value="sub-admin">Sub-Admin</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `
})
export class AdminUsersComponent implements OnInit {
  users = signal<any[]>([]);
  isLoading = signal(true);

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
            ? { ...u, publicMetadata: { ...u.publicMetadata, role: role || undefined } }
            : u
          )
        );
      }
    });
  }

  getUserInitials(user: any): string {
    const first = user.firstName?.charAt(0) || '';
    const last = user.lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || user.emailAddresses?.[0]?.emailAddress?.charAt(0).toUpperCase() || '?';
  }
}
