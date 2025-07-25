import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductService } from '../../core/services/product.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  stats = {
    totalProducts: 0,
    activeProducts: 0,
    lowStock: 0,
  };

  isLoading = true;
  recentProducts: any[] = [];

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadStats();
    this.loadRecentProducts();
  }

  private loadStats(): void {
    this.isLoading = true;

    // Get products to calculate stats
    this.productService.getProducts({ limit: 1000 }).subscribe({
      next: (response) => {
        if (response.success && response.data.products) {
          const products = response.data.products;

          this.stats.totalProducts = products.length;
          this.stats.activeProducts = products.filter(
            (p) => p.is_active
          ).length;
          this.stats.lowStock = products.filter(
            (p) => p.stock_quantity <= 10
          ).length;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load stats:', error);
        this.isLoading = false;
      },
    });
  }

  private loadRecentProducts(): void {
    // Get recent products for activity feed
    this.productService.getProducts({ limit: 5 }).subscribe({
      next: (response) => {
        if (response.success && response.data.products) {
          this.recentProducts = response.data.products;
        }
      },
      error: (error) => {
        console.error('Failed to load recent products:', error);
      },
    });
  }
}
