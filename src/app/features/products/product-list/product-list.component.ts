import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import {
  ProductService,
  ProductFilters,
} from '../../../core/services/product.service';
import { UnsplashService } from '../../../core/services/unsplash.service';
import { Product } from '../../../core/models/interfaces';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  isLoading = false;
  isAdmin = false;
  productImages: { [key: string]: string } = {};

  filters: ProductFilters = {
    page: 1,
    limit: 12,
    search: '',
    category: '',
    minPrice: undefined,
    maxPrice: undefined,
  };

  pagination = {
    page: 1,
    limit: 12,
    total: 0,
    pages: 0,
  };

  private filterTimeout: any;

  constructor(
    private productService: ProductService,
    private unsplashService: UnsplashService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Check if user is authenticated
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
      return;
    }

    // Check admin status
    this.authService.currentUser$.subscribe((user) => {
      this.isAdmin = user?.role === 'admin';
    });

    this.loadProducts();
  }

  onFilterChange(): void {
    clearTimeout(this.filterTimeout);
    this.filterTimeout = setTimeout(() => {
      this.filters.page = 1;
      this.loadProducts();
    }, 300);
  }

  changePage(page: number): void {
    this.filters.page = page;
    this.loadProducts();
  }

  private loadProducts(): void {
    this.isLoading = true;

    this.productService.getProducts(this.filters).subscribe({
      next: (response) => {
        if (!response.success) {
          return;
        }

        // pull raw payload (may be (Product | undefined)[])
        const raw = response.data.products || [];

        // keep only those with a defined id
        const products: Product[] = raw.filter(
          (p): p is Product => p.id !== undefined
        );

        this.products = products;
        this.pagination = response.data.pagination;

        this.loadProductImages();
      },
      error: (err) => {
        console.error('Failed to load products:', err);
        if (err.status === 401) {
          this.router.navigate(['/auth/login']);
        }
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  private loadProductImages(): void {
    this.products.forEach((product) => {
      if (product.id && !this.productImages[product.id]) {
        this.unsplashService
          .getProductImage(product.name, product.category)
          .subscribe({
            next: (imageUrl) => {
              if (product.id) {
                this.productImages[product.id] = imageUrl;
              }
            },
            error: (error) => {
              console.error('Failed to load image for', product.name, error);
              // Set fallback image
              if (product.id) {
                this.productImages[product.id] = this.getFallbackImage(
                  product.category
                );
              }
            },
          });
      }
    });
  }

  getProductImage(product: Product): string {
    if (product.id && this.productImages[product.id]) {
      return this.productImages[product.id];
    }
    return this.getFallbackImage(product.category);
  }

  private getFallbackImage(category?: string): string {
    const fallbacks = {
      smartphones:
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop',
      laptops:
        'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop',
      tablets:
        'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=300&fit=crop',
      accessories:
        'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=300&fit=crop',
      wearables:
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop',
    };
    return (
      fallbacks[category as keyof typeof fallbacks] ||
      'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop'
    );
  }

  onImageError(event: any, product: Product): void {
    event.target.src = this.getFallbackImage(product.category);
  }

  getStockBadgeClass(product: Product): string {
    if (product.stock_quantity === 0) {
      return 'bg-red-100 text-red-800';
    } else if (product.stock_quantity <= 10) {
      return 'bg-yellow-100 text-yellow-800';
    }
    return 'bg-green-100 text-green-800';
  }

  getStockText(product: Product): string {
    if (product.stock_quantity === 0) {
      return 'Out of Stock';
    } else if (product.stock_quantity <= 10) {
      return 'Low Stock';
    }
    return 'In Stock';
  }

  viewProduct(id: number): void {
    if (id !== undefined) {
      this.router.navigate(['/products', id]);
    }
  }

  editProduct(id: number): void {
    if (id !== undefined) {
      this.router.navigate(['/products/edit', id]);
    }
  }

  deleteProduct(product: Product): void {
    if (!product.id) {
      console.error('Cannot delete product without ID');
      return;
    }

    if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
      this.productService.deleteProduct(product.id).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadProducts();
          }
        },
        error: (error) => {
          console.error('Failed to delete product:', error);
        },
      });
    }
  }

  Math = Math;
}
