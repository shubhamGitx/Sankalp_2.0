import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Panchayat } from './panchayat';

describe('Panchayat', () => {
  let component: Panchayat;
  let fixture: ComponentFixture<Panchayat>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Panchayat],
    }).compileComponents();

    fixture = TestBed.createComponent(Panchayat);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
