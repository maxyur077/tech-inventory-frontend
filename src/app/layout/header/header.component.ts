import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  currentUser: User | null = null;
  mobileMenuOpen = false;
  isVisible = false;

  private hiddenRoutes = ['/auth/login', '/auth/register'];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadCurrentUser();

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.isVisible = this.hiddenRoutes.includes(event.url);

        this.loadCurrentUser();
      });

    this.isVisible = !this.hiddenRoutes.includes(this.router.url);
  }

  private loadCurrentUser(): void {
    try {
      const userString = localStorage.getItem('user');
      if (userString) {
        this.currentUser = JSON.parse(userString);
        console.log('Current user loaded:', this.currentUser);
      } else {
        console.log('No user found in localStorage');
        this.currentUser = null;
      }
    } catch (error) {
      console.error('Error parsing user data from localStorage:', error);
      this.currentUser = null;

      localStorage.removeItem('user');
    }
  }

  getUserInitials(): string {
    if (this.currentUser?.username) {
      return this.currentUser.username.substring(0, 2).toUpperCase();
    }
    return 'U';
  }

  getUserDisplayName(): string {
    return this.currentUser?.username || 'Guest';
  }

  getUserRole(): string {
    return this.currentUser?.role || 'user';
  }

  isAdmin(): boolean {
    return this.currentUser?.role === 'admin';
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  logout(): void {
    console.log('Logging out user:', this.currentUser?.username);
    localStorage.clear();
    this.currentUser = null;
    this.router.navigate(['/auth/login']);
  }
}
