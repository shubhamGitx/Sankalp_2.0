import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MasterLayout } from './master-layout';

describe('MasterLayout', () => {
  let component: MasterLayout;
  let fixture: ComponentFixture<MasterLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MasterLayout],
    }).compileComponents();

    fixture = TestBed.createComponent(MasterLayout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
