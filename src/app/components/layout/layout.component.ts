import { Component, computed, HostListener, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ChatbotComponent } from '../chatbot/chatbot.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule, ChatbotComponent],
  templateUrl: './layout.component.html'
})
export class LayoutComponent {
  isScrolled = signal(false);
  mobileMenuOpen = signal(false);

  user = this.auth.user;
  isSignedIn = this.auth.isSignedIn;
  isAdmin = this.auth.isAdmin;
  isSubAdmin = this.auth.isSubAdmin;

  userInitials = computed(() => {
    const u = this.auth.user();
    if (!u) return '?';
    return `${u.firstName?.charAt(0) || ''}${u.lastName?.charAt(0) || ''}`.toUpperCase() || u.email.charAt(0).toUpperCase();
  });

  constructor(private auth: AuthService, private router: Router) {}

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    if (typeof window !== 'undefined') {
      this.isScrolled.set(window.scrollY > 10);
    }
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update(v => !v);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  openSignIn(): void {
    this.router.navigate(['/login']);
  }

  signOut(): void {
    this.auth.signOut();
  }
}
