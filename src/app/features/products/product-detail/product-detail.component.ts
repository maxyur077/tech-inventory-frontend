import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { OrderService } from '../../../core/services/order.service';
import { AuthService } from '../../../core/services/auth.service';
import { Product } from '../../../core/models/interfaces';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css'],
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  isLoading = false;
  isAddingToCart = false;
  isAdmin = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private productService: ProductService,
    private orderService: OrderService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      this.isAdmin = user?.role === 'admin';
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadProduct(+id);
    }
  }

  private loadProduct(id: number): void {
    this.isLoading = true;
    this.productService.getProductById(id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.product = response.data;
        }
      },
      error: (error) => {
        this.errorMessage = 'Failed to load product';
        console.error('Failed to load product:', error);
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  addToCart(): void {
    if (!this.product) return;

    this.isAddingToCart = true;
    this.errorMessage = '';
    this.successMessage = '';

    const orderData = {
      product_ids: [this.product.id],
      total_amount: this.product.price,
    };

    this.orderService.createOrder(orderData).subscribe({
      next: (response) => {
        if (response.success) {
          this.successMessage = 'Product added to cart successfully!';
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        }
      },
      error: (error) => {
        this.errorMessage =
          error.error?.message || 'Failed to add product to cart';
      },
      complete: () => {
        this.isAddingToCart = false;
      },
    });
  }

  editProduct(): void {
    if (this.product) {
      this.router.navigate(['/products/edit', this.product.id]);
    }
  }

  deleteProduct(): void {
    if (!this.product) return;

    if (confirm(`Are you sure you want to delete "${this.product.name}"?`)) {
      this.productService.deleteProduct(this.product.id).subscribe({
        next: (response) => {
          if (response.success) {
            this.router.navigate(['/products']);
          }
        },
        error: (error) => {
          this.errorMessage = 'Failed to delete product';
          console.error('Failed to delete product:', error);
        },
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/products']);
  }
}
