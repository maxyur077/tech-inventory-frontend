import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

// Define the response interfaces
interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: {
      id: number;
      username: string;
      email: string;
      role: string;
    };
  };
}

interface RegisterResponse {
  success: boolean;
  message: string;
  data: any;
}

interface UpdateProfileResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    username: string;
    email: string;
    role: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/v1/users';
  private currentUserSubject = new BehaviorSubject<any>(null);
  private tokenSubject = new BehaviorSubject<string | null>(null);

  currentUser$ = this.currentUserSubject.asObservable();
  token$ = this.tokenSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.loadStoredAuth();
  }

  private loadStoredAuth(): void {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (token && user) {
      this.tokenSubject.next(token);
      this.currentUserSubject.next(JSON.parse(user));
    }
  }

  login(credentials: {
    username: string;
    password: string;
  }): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap((response) => {
          console.log('Login response:', response);
          if (response.success && response.data) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));

            this.tokenSubject.next(response.data.token);
            this.currentUserSubject.next(response.data.user);

            console.log(
              'Token stored in localStorage:',
              localStorage.getItem('token')
            );
          }
        })
      );
  }

  register(userData: {
    username: string;
    email: string;
    password: string;
  }): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(
      `${this.apiUrl}/register`,
      userData
    );
  }

  // Add the missing updateProfile method
  updateProfile(profileData: {
    username?: string;
    email?: string;
    password?: string;
  }): Observable<UpdateProfileResponse> {
    return this.http
      .put<UpdateProfileResponse>(`${this.apiUrl}/profile`, profileData)
      .pipe(
        tap((response) => {
          if (response.success && response.data) {
            // Update stored user data
            localStorage.setItem('user', JSON.stringify(response.data));
            this.currentUserSubject.next(response.data);
            console.log('Profile updated and user data refreshed');
          }
        })
      );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    this.tokenSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token') || this.tokenSubject.value;
  }

  getCurrentUser(): any {
    const stored = localStorage.getItem('user');
    if (stored) {
      return JSON.parse(stored);
    }
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'admin';
  }
}
