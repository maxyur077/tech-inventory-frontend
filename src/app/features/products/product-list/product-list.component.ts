import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import {
  ProductService,
  ProductFilters,
} from '../../../core/services/product.service';
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
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
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
        if (response.success) {
          this.products = response.data['products'] || [];
          this.pagination = response.data.pagination;
        }
      },
      error: (error) => {
        console.error('Failed to load products:', error);
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  viewProduct(id: number): void {
    this.router.navigate(['/products', id]);
  }

  editProduct(id: number): void {
    this.router.navigate(['/products/edit', id]);
  }

  deleteProduct(product: Product): void {
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

  Math = Math; // Make Math available in template
}
