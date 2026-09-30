import { TestBed } from '@angular/core/testing';

import { Captcha } from './captcha';

describe('Captcha', () => {
  let service: Captcha;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Captcha);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
