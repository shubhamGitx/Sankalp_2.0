import {Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';

import { DatePipe } from '@angular/common';

import {FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { GalleryService } from '../../services/gallery.service';

@Component({
  selector: 'app-gallery',
  imports: [ReactiveFormsModule, DatePipe ],
  templateUrl: './gallery.html',
  styleUrl: './gallery.css',
})
export class Gallery implements OnInit {

  private cdr = inject(ChangeDetectorRef);

  private galleryService = inject(GalleryService);

  // ============================================================
  // VARIABLES
  // ============================================================

  galleryList: any[] = [];

  selectedFile: File | null = null;

  previewUrl: string | null = null;

  loading = false;

  message = '';

  errorMessage = '';


  // ============================================================
  // LARGE IMAGE MODAL
  // ============================================================

  selectedImage: string | null = null;

  selectedImageTitle = '';

  // ============================================================
  // INIT
  // ============================================================

  ngOnInit(): void {

    this.loadGallery();

  }


  // ============================================================
  // LOAD GALLERY
  // ============================================================

  loadGallery(): void {

    this.loading = true;

    this.errorMessage = '';

    this.galleryService
      .getGallery()
      .subscribe({

        next: (response) => {

          this.loading = false;

          console.log(response);


          if (response?.status === true) {

            this.galleryList =response.data ?? [];

            this.cdr.detectChanges();

          }
          else {

            this.galleryList = [];

            this.errorMessage = response?.message || 'Unable to load gallery.';

          }

        },


        error: (error) => {

          this.loading = false;
          console.error('Gallery Load Error:', error);
          this.errorMessage =error?.error?.message || 'Unable to load gallery.';
        }

      });

  }


  // ============================================================
  // GET IMAGE URL
  // ============================================================

  getImageUrl(imagePath: string): string {

    if (!imagePath) {

      return '';

    }


    let path = imagePath;


    // Remove starting slash if present

    if (path.startsWith('/')) {

      path = path.substring(1);

    }


    return `https://localhost:7279/${path}`;

  }


  // ============================================================
  // OPEN LARGE IMAGE
  // ============================================================

  openImage(item: any): void {

    console.log('Opening image:', item);


    this.selectedImage =this.getImageUrl(item.imagePath);


    this.selectedImageTitle =item.title || 'Gallery Image';


    // Prevent background scrolling

    document.body.style.overflow = 'hidden';

  }


  // ============================================================
  // CLOSE LARGE IMAGE
  // ============================================================

  closeImage(): void {

    this.selectedImage = null;

    this.selectedImageTitle = '';

    document.body.style.overflow = '';

  }


  // ============================================================
  // CLOSE MODAL WHEN CLICKING BACKGROUND
  // ============================================================

  onModalClick(event: MouseEvent): void {

    if (
      event.target ===
      event.currentTarget
    ) {

      this.closeImage();

    }

  }


}
