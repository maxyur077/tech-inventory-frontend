import { TestBed } from '@angular/core/testing';

import { Product } from './product.service';

describe('Product', () => {
  let service: Product;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Product);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
