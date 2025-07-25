import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class UnsplashService {
  private readonly ACCESS_KEY = 'YOUR_UNSPLASH_ACCESS_KEY';
  private readonly BASE_URL = 'https://api.unsplash.com';

  // Cache for images to avoid repeated API calls
  private imageCache = new Map<string, string>();

  constructor(private http: HttpClient) {}

  getProductImage(productName: string, category?: string): Observable<string> {
    const cacheKey = `${productName}-${category || 'default'}`;

    // Check cache first
    if (this.imageCache.has(cacheKey)) {
      return of(this.imageCache.get(cacheKey)!);
    }

    // Build dynamic search query
    const query = this.buildDynamicSearchQuery(productName, category);

    const url = `${this.BASE_URL}/search/photos`;
    const params = {
      query: query,
      per_page: '1',
      orientation: 'landscape',
      client_id: this.ACCESS_KEY,
    };

    return this.http.get<any>(url, { params }).pipe(
      map((response) => {
        if (response.results && response.results.length > 0) {
          const imageUrl = response.results[0].urls.regular;
          this.imageCache.set(cacheKey, imageUrl);
          return imageUrl;
        }
        throw new Error('No images found');
      }),
      catchError(() => {
        // Try fallback search with category only
        return this.tryFallbackSearch(category, cacheKey);
      })
    );
  }

  private buildDynamicSearchQuery(
    productName: string,
    category?: string
  ): string {
    // Clean and normalize product name
    const cleanName = this.cleanProductName(productName);

    // Extract key terms from product name
    const keyTerms = this.extractKeyTerms(cleanName);

    // Build search query with extracted terms
    let searchTerms = keyTerms.join(' ');

    // Add category context if available
    if (category) {
      searchTerms += ` ${category}`;
    }

    // Add technology context
    searchTerms += ' technology product device';

    return searchTerms.trim();
  }

  private cleanProductName(productName: string): string {
    return productName
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ') // Remove special characters
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim();
  }

  private extractKeyTerms(productName: string): string[] {
    const words = productName.split(' ');
    const keyTerms: string[] = [];

    // Brand keywords
    const brands = [
      'apple',
      'samsung',
      'google',
      'microsoft',
      'sony',
      'dell',
      'hp',
      'lenovo',
      'asus',
      'acer',
    ];

    // Product type keywords
    const productTypes = [
      'phone',
      'smartphone',
      'mobile',
      'laptop',
      'computer',
      'notebook',
      'tablet',
      'ipad',
      'watch',
      'smartwatch',
      'earbuds',
      'headphones',
      'airpods',
      'camera',
      'monitor',
      'keyboard',
      'mouse',
      'speaker',
      'gaming',
      'console',
    ];

    // Extract brand names
    words.forEach((word) => {
      if (brands.includes(word)) {
        keyTerms.push(word);
      }
    });

    // Extract product types
    words.forEach((word) => {
      if (productTypes.includes(word)) {
        keyTerms.push(word);
      }
    });

    // Extract model numbers and important terms (longer than 2 characters)
    words.forEach((word) => {
      if (word.length > 2 && !keyTerms.includes(word)) {
        // Check if it's a model number or important term
        if (/\d/.test(word) || word.length >= 4) {
          keyTerms.push(word);
        }
      }
    });

    // If no key terms found, use the original product name words
    if (keyTerms.length === 0) {
      keyTerms.push(...words.filter((word) => word.length > 2));
    }

    return keyTerms;
  }

  private tryFallbackSearch(
    category?: string,
    cacheKey?: string
  ): Observable<string> {
    if (!category) {
      const fallbackUrl = this.getFallbackImageUrl();
      if (cacheKey) {
        this.imageCache.set(cacheKey, fallbackUrl);
      }
      return of(fallbackUrl);
    }

    // Try searching with category only
    const url = `${this.BASE_URL}/search/photos`;
    const params = {
      query: `${category} technology product`,
      per_page: '1',
      orientation: 'landscape',
      client_id: this.ACCESS_KEY,
    };

    return this.http.get<any>(url, { params }).pipe(
      map((response) => {
        if (response.results && response.results.length > 0) {
          const imageUrl = response.results[0].urls.regular;
          if (cacheKey) {
            this.imageCache.set(cacheKey, imageUrl);
          }
          return imageUrl;
        }
        throw new Error('No images found');
      }),
      catchError(() => {
        const fallbackUrl = this.getFallbackImageUrl(category);
        if (cacheKey) {
          this.imageCache.set(cacheKey, fallbackUrl);
        }
        return of(fallbackUrl);
      })
    );
  }

  private getFallbackImageUrl(category?: string): string {
    const fallbacks = {
      smartphones:
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&h=400&fit=crop',
      laptops:
        'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=400&fit=crop',
      tablets:
        'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&h=400&fit=crop',
      accessories:
        'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&h=400&fit=crop',
      wearables:
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=400&fit=crop',
      gaming:
        'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=600&h=400&fit=crop',
      cameras:
        'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=600&h=400&fit=crop',
      audio:
        'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&h=400&fit=crop',
    };

    return (
      fallbacks[category as keyof typeof fallbacks] ||
      'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=400&fit=crop'
    );
  }

  // Method to get multiple images for a product
  getProductImages(
    productName: string,
    category?: string,
    count: number = 5
  ): Observable<string[]> {
    const query = this.buildDynamicSearchQuery(productName, category);

    const url = `${this.BASE_URL}/search/photos`;
    const params = {
      query: query,
      per_page: count.toString(),
      orientation: 'landscape',
      client_id: this.ACCESS_KEY,
    };

    return this.http.get<any>(url, { params }).pipe(
      map((response) => {
        if (response.results && response.results.length > 0) {
          return response.results.map((result: any) => result.urls.regular);
        }
        return [this.getFallbackImageUrl(category)];
      }),
      catchError(() => of([this.getFallbackImageUrl(category)]))
    );
  }

  // Clear cache method
  clearCache(): void {
    this.imageCache.clear();
  }

  // Method to preload images for better performance
  preloadProductImages(
    products: Array<{ name: string; category?: string }>
  ): void {
    products.forEach((product) => {
      this.getProductImage(product.name, product.category).subscribe({
        next: (imageUrl) => {
          console.log(`Preloaded image for ${product.name}:`, imageUrl);
        },
        error: (error) => {
          console.warn(`Failed to preload image for ${product.name}:`, error);
        },
      });
    });
  }
}
