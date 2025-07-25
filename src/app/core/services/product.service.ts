import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface Product {
  id?: number;
  name: string;
  price: number;
  description?: string;
  category?: string;
  stock_quantity: number;
  is_active?: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: {
    products?: T[];
    orders?: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = 'http://localhost:3000/api/v1/products';

  constructor(private http: HttpClient) {}

  getProducts(
    filters: ProductFilters = {}
  ): Observable<PaginatedResponse<Product>> {
    let params = new HttpParams();

    Object.keys(filters).forEach((key) => {
      const value = (filters as any)[key];
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    console.log(
      'ProductService - Getting products with token:',
      localStorage.getItem('token')
    );
    return this.http.get<PaginatedResponse<Product>>(this.apiUrl, { params });
  }

  createProduct(product: Partial<Product>): Observable<ApiResponse<Product>> {
    console.log('ProductService - Creating product');
    console.log(
      'ProductService - Token before request:',
      localStorage.getItem('token')
    );
    console.log('ProductService - Product data:', product);

    return this.http.post<ApiResponse<Product>>(this.apiUrl, product).pipe(
      tap({
        next: (response) =>
          console.log('ProductService - Create success:', response),
        error: (error) => {
          console.error('ProductService - Create error:', error);
          console.error('ProductService - Error status:', error.status);
          console.error('ProductService - Error headers:', error.headers);
        },
      })
    );
  }

  updateProduct(
    id: number,
    product: Partial<Product>
  ): Observable<ApiResponse<Product>> {
    return this.http.put<ApiResponse<Product>>(`${this.apiUrl}/${id}`, product);
  }

  deleteProduct(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`);
  }

  getProductById(id: number): Observable<ApiResponse<Product>> {
    return this.http.get<ApiResponse<Product>>(`${this.apiUrl}/${id}`);
  }
}
