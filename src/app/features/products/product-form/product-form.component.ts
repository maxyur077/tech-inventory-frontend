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

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
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
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.productId = +id;
      this.loadProduct(this.productId);
    }
  }

  private loadProduct(id: number): void {
    this.isLoading = true;
    this.productService.getProductById(id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.productForm.patchValue(response.data);
        }
      },
      error: (error) => {
        this.errorMessage = 'Failed to load product data';
        console.error('Failed to load product:', error);
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  onSubmit(): void {
    if (this.productForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const productData = this.productForm.value;

      const request =
        this.isEditMode && this.productId
          ? this.productService.updateProduct(this.productId, productData)
          : this.productService.createProduct(productData);

      request.subscribe({
        next: (response) => {
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
          this.errorMessage = error.error?.message || 'Failed to save product';
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        },
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
