import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/interfaces';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  currentUser: User | null = null;
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.profileForm = this.fb.group(
      {
        username: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        password: [''],
        confirmPassword: [''],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
      if (user) {
        this.profileForm.patchValue({
          username: user.username,
          email: user.email,
          password: '',
          confirmPassword: '',
        });
      }
    });
  }

  private passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (
      password?.value &&
      confirmPassword?.value &&
      password.value !== confirmPassword.value
    ) {
      return { passwordMismatch: true };
    }
    return null;
  }

  getUserInitials(): string {
    if (!this.currentUser?.username) return 'U';
    return this.currentUser.username.substring(0, 2).toUpperCase();
  }

  onSubmit(): void {
    if (this.profileForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const formData = { ...this.profileForm.value };

      // Remove confirmPassword and empty password
      delete formData.confirmPassword;
      if (!formData.password) {
        delete formData.password;
      }

      this.authService.updateProfile(formData).subscribe({
        next: (response) => {
          if (response.success && response.data) {
            // Update local user data
            localStorage.setItem('user', JSON.stringify(response.data));
            this.successMessage = 'Profile updated successfully!';
            this.profileForm.patchValue({ password: '', confirmPassword: '' });

            setTimeout(() => {
              this.successMessage = '';
            }, 5000);
          }
        },
        error: (error) => {
          this.errorMessage =
            error.error?.message || 'Failed to update profile';
        },
        complete: () => {
          this.isLoading = false;
        },
      });
    }
  }

  resetForm(): void {
    if (this.currentUser) {
      this.profileForm.patchValue({
        username: this.currentUser.username,
        email: this.currentUser.email,
        password: '',
        confirmPassword: '',
      });
    }
    this.errorMessage = '';
    this.successMessage = '';
  }
}
