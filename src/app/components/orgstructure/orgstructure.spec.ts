import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Orgstructure } from './orgstructure';

describe('Orgstructure', () => {
  let component: Orgstructure;
  let fixture: ComponentFixture<Orgstructure>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Orgstructure],
    }).compileComponents();

    fixture = TestBed.createComponent(Orgstructure);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
