import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { AuthService } from '../../../core/services/auth.service';
import { Product } from '../../../core/models/interfaces';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.css'],
})
export class ProductFormComponent implements OnInit {
  productForm: FormGroup;
  isEditMode = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  productId: number | null = null;
  isAdmin = false;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      price: ['', [Validators.required, Validators.min(0.01)]],
      description: [''],
      category: [''],
      stock_quantity: ['', [Validators.required, Validators.min(0)]],
    });
  }

  ngOnInit(): void {
    console.log('ProductForm - ngOnInit called');

    // 🔧 Check authentication first
    if (!this.authService.isAuthenticated()) {
      console.log('ProductForm - User not authenticated, redirecting to login');
      this.router.navigate(['/auth/login']);
      return;
    }

    // 🔧 Check if user is admin (for creating/editing products)
    const currentUser = this.authService.getCurrentUser();
    this.isAdmin = currentUser?.role === 'admin';

    console.log('ProductForm - Current user:', currentUser);
    console.log('ProductForm - Is admin:', this.isAdmin);

    // For now, allow all authenticated users to create/edit products
    // If you want only admins to create/edit products, uncomment below:
    /*
    if (!this.isAdmin) {
      console.log('ProductForm - User is not admin, redirecting to products');
      this.router.navigate(['/products']);
      return;
    }
    */

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.productId = +id;
      this.loadProduct(this.productId);
    }
  }

  private loadProduct(id: number): void {
    this.isLoading = true;
    this.errorMessage = '';

    console.log('ProductForm - Loading product with ID:', id);

    this.productService.getProductById(id).subscribe({
      next: (response) => {
        console.log('ProductForm - Product loaded:', response);
        if (response.success && response.data) {
          this.productForm.patchValue(response.data);
        } else {
          this.errorMessage = 'Product not found';
        }
      },
      error: (error) => {
        console.error('ProductForm - Failed to load product:', error);

        if (error.status === 401) {
          console.log('ProductForm - Unauthorized, redirecting to login');
          this.authService.logout();
          this.router.navigate(['/auth/login']);
        } else {
          this.errorMessage = 'Failed to load product data';
        }
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  onSubmit(): void {
    if (this.productForm.valid) {
      // 🔧 Double-check authentication before submitting
      if (!this.authService.isAuthenticated()) {
        console.log('ProductForm - User not authenticated during submit');
        this.router.navigate(['/auth/login']);
        return;
      }

      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const productData = this.productForm.value;
      console.log('ProductForm - Sending product data:', productData);

      const request =
        this.isEditMode && this.productId
          ? this.productService.updateProduct(this.productId, productData)
          : this.productService.createProduct(productData);

      request.subscribe({
        next: (response) => {
          console.log('ProductForm - Product operation response:', response);
          if (response.success) {
            this.successMessage = `Product ${
              this.isEditMode ? 'updated' : 'created'
            } successfully!`;
            setTimeout(() => {
              this.router.navigate(['/products']);
            }, 1500);
          }
        },
        error: (error) => {
          console.error('ProductForm - Product operation error:', error);

          if (error.status === 401) {
            console.log(
              'ProductForm - Unauthorized during submit, redirecting to login'
            );
            this.authService.logout();
            this.router.navigate(['/auth/login']);
          } else {
            this.errorMessage =
              error.error?.message || 'Failed to save product';
          }
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        },
      });
    } else {
      console.log('ProductForm - Form is invalid:', this.productForm.errors);
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.productForm.controls).forEach((key) => {
      const control = this.productForm.get(key);
      control?.markAsTouched();
    });
  }

  goBack(): void {
    this.router.navigate(['/products']); // Changed from /dashboard to /products
  }
}
