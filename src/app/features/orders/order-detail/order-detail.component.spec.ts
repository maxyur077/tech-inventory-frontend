import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderDetail } from './order-detail';

describe('OrderDetail', () => {
  let component: OrderDetail;
  let fixture: ComponentFixture<OrderDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
