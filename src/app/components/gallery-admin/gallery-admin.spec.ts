import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GalleryAdmin } from './gallery-admin';

describe('GalleryAdmin', () => {
  let component: GalleryAdmin;
  let fixture: ComponentFixture<GalleryAdmin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GalleryAdmin],
    }).compileComponents();

    fixture = TestBed.createComponent(GalleryAdmin);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
