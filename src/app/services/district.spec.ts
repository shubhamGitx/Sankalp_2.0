import { TestBed } from '@angular/core/testing';

import { District } from './district';

describe('District', () => {
  let service: District;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(District);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
