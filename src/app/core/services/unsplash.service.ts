import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class UnsplashService {
  private readonly ACCESS_KEY = 'YOUR_UNSPLASH_ACCESS_KEY'; // Get from https://unsplash.com/developers
  private readonly BASE_URL = 'https://api.unsplash.com';

  // Cache for images to avoid repeated API calls
  private imageCache = new Map<string, string>();

  constructor(private http: HttpClient) {}

  getProductImage(productName: string, category?: string): Observable<string> {
    const cacheKey = `${productName}-${category}`;

    // Check cache first
    if (this.imageCache.has(cacheKey)) {
      return of(this.imageCache.get(cacheKey)!);
    }

    // Determine search query based on product name and category
    const query = this.buildSearchQuery(productName, category);

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
        // Return fallback image on error
        const fallbackUrl = this.getFallbackImageUrl(category);
        this.imageCache.set(cacheKey, fallbackUrl);
        return of(fallbackUrl);
      })
    );
  }

  private buildSearchQuery(productName: string, category?: string): string {
    const name = productName.toLowerCase();

    // Enhanced search queries for better image matching
    if (name.includes('iphone')) {
      return 'iphone smartphone mobile phone apple';
    } else if (name.includes('samsung') && name.includes('galaxy')) {
      return 'samsung galaxy smartphone android';
    } else if (name.includes('macbook')) {
      return 'macbook laptop apple computer';
    } else if (name.includes('ipad')) {
      return 'ipad tablet apple device';
    } else if (name.includes('airpods')) {
      return 'airpods wireless earbuds apple';
    } else if (name.includes('apple watch')) {
      return 'apple watch smartwatch wearable';
    } else if (category) {
      return `${category} ${name}`;
    }

    return name;
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
    };

    return (
      fallbacks[category as keyof typeof fallbacks] ||
      'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=400&fit=crop'
    );
  }
}
