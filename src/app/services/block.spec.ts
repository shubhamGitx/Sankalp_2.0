import { TestBed } from '@angular/core/testing';

import { Block } from './block';

describe('Block', () => {
  let service: Block;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Block);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
