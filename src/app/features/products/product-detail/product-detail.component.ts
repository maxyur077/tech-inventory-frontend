import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { AuthService } from '../../../core/services/auth.service';
import { Product } from '../../../core/models/interfaces';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css'],
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  isLoading = true;
  isAdmin = false;
  isAddingToCart = false;
  errorMessage = '';
  successMessage = '';
  quantity = 1;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      console.log('User not authenticated, redirecting to login');
      this.router.navigate(['/auth/login']);
      return;
    }

    const currentUser = this.authService.getCurrentUser();
    this.isAdmin = currentUser?.role === 'admin';

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadProduct(+id);
    } else {
      this.router.navigate(['/products']);
    }
  }

  private loadProduct(id: number): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.productService.getProductById(id).subscribe({
      next: (response) => {
        console.log('Product API response:', response);
        if (response.success && response.data) {
          this.product = {
            ...response.data,
            id: response.data.id || 0,
            is_active: response.data.is_active ?? true,
          };
        } else {
          this.errorMessage = 'Product not found';
        }
      },
      error: (error) => {
        console.error('Failed to load product:', error);
        if (error.status === 401) {
          console.log('Unauthorized access, redirecting to login');
          this.authService.logout();
          this.router.navigate(['/auth/login']);
        } else {
          this.errorMessage = 'Failed to load product details';
        }
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  addToCart(): void {
    if (!this.product || this.product.stock_quantity === 0) {
      this.errorMessage = 'Product is out of stock';
      return;
    }

    this.isAddingToCart = true;
    this.errorMessage = '';
    this.successMessage = '';

    setTimeout(() => {
      this.isAddingToCart = false;
      this.successMessage = `${
        this.product!.name
      } has been added to your cart!`;

      setTimeout(() => {
        this.successMessage = '';
      }, 3000);
    }, 1000);
  }

  editProduct(): void {
    if (this.product?.id) {
      this.router.navigate(['/products/edit', this.product.id]);
    }
  }

  deleteProduct(): void {
    if (!this.product?.id) {
      this.errorMessage = 'Invalid product ID';
      return;
    }

    if (confirm(`Are you sure you want to delete "${this.product.name}"?`)) {
      this.productService.deleteProduct(this.product.id).subscribe({
        next: (response) => {
          if (response.success) {
            this.router.navigate(['/products']);
          }
        },
        error: (error) => {
          console.error('Failed to delete product:', error);
          this.errorMessage = 'Failed to delete product';
        },
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/products']);
  }

  increaseQuantity(): void {
    if (this.product && this.quantity < this.product.stock_quantity) {
      this.quantity++;
    }
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }
}
