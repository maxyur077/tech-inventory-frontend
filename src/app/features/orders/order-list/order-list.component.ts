import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { Order, OrderFilters } from '../../../core/models/interfaces';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.css'],
})
export class OrderListComponent implements OnInit {
  orders: Order[] = [];
  isLoading = false;
  isAdmin = false;

  filters: OrderFilters = {
    page: 1,
    limit: 10,
    status: '',
  };

  pagination = {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  };

  constructor(
    private orderService: OrderService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      this.isAdmin = user?.role === 'admin';
    });
    this.loadOrders();
  }

  onFilterChange(): void {
    this.filters.page = 1;
    this.loadOrders();
  }

  changePage(page: number): void {
    this.filters.page = page;
    this.loadOrders();
  }

  private loadOrders(): void {
    this.isLoading = true;

    this.orderService.getOrders(this.filters).subscribe({
      next: (response) => {
        if (response.success) {
          this.orders = response.data['orders'] || [];
          this.pagination = response.data.pagination;
        }
      },
      error: (error) => {
        console.error('Failed to load orders:', error);
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  viewOrder(id: number): void {
    this.router.navigate(['/orders', id]);
  }

  canUpdateOrder(order: Order): boolean {
    return this.isAdmin || order.status === 'pending';
  }

  updateOrderStatus(order: Order): void {
    this.router.navigate(['/orders', order.id]);
  }

  deleteOrder(order: Order): void {
    if (confirm(`Are you sure you want to delete order #${order.order_id}?`)) {
      this.orderService.deleteOrder(order.id).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadOrders();
          }
        },
        error: (error) => {
          console.error('Failed to delete order:', error);
        },
      });
    }
  }

  Math = Math;
}
