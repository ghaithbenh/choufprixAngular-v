import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  assignedStore: string | null;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  // Signals for reactive auth state
  private _user = signal<AuthUser | null>(null);
  private _isLoaded = signal<boolean>(false);
  private _isSignedIn = signal<boolean>(false);
  private _token = signal<string | null>(null);

  // Public computed signals
  readonly user = computed(() => this._user());
  readonly isLoaded = computed(() => this._isLoaded());
  readonly isSignedIn = computed(() => this._isSignedIn());

  // Role helpers
  readonly isAdmin = computed(() => this._user()?.role === 'admin');
  readonly isSubAdmin = computed(() =>
    this._user()?.role === 'sub-admin' ||
    this._user()?.role === 'admin'
  );
  readonly assignedStore = computed(() => this._user()?.assignedStore);

  constructor(private router: Router) {
    this.initAuth();
  }

  private initAuth(): void {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const savedUser = localStorage.getItem('choufprix_user');
      if (savedUser) {
        try {
          const user = JSON.parse(savedUser);
          this._user.set(user);
          this._isSignedIn.set(true);
          this._token.set(localStorage.getItem('choufprix_token'));
        } catch {}
      }
    }
    this._isLoaded.set(true);
  }

  async getToken(): Promise<string | null> {
    return this._token();
  }

  signOut(): void {
    this._user.set(null);
    this._isSignedIn.set(false);
    this._token.set(null);
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.removeItem('choufprix_user');
      localStorage.removeItem('choufprix_token');
    }
    this.router.navigate(['/']);
  }

  // Set the user after login/register
  setAuthData(user: AuthUser, token: string): void {
    this._user.set(user);
    this._isSignedIn.set(true);
    this._token.set(token);
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.setItem('choufprix_user', JSON.stringify(user));
      localStorage.setItem('choufprix_token', token);
    }
  }
}
