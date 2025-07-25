import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit {
  currentUser = { username: 'Admin' };
  mobileMenuOpen = false;
  isVisible = true;

  private hiddenRoutes = ['/auth/login', '/auth/register'];

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Listen to route changes
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.isVisible = !this.hiddenRoutes.includes(event.url);
      });

    // Set initial state
    this.isVisible = !this.hiddenRoutes.includes(this.router.url);
  }

  getUserInitials(): string {
    return (this.currentUser?.username || 'U').substring(0, 2).toUpperCase();
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/auth/login']);
  }
}
