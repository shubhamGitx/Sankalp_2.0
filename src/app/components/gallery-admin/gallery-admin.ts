import {Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';

import { DatePipe } from '@angular/common';

import {FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { GalleryService } from '../../services/gallery.service';


@Component({
  selector: 'app-gallery-admin',

  standalone: true,

  imports: [ReactiveFormsModule, DatePipe ],

  templateUrl: './gallery-admin.html',

  styleUrl: './gallery-admin.css'
})
export class GalleryAdmin implements OnInit {

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
  // FORM
  // ============================================================

  galleryForm = new FormGroup({

    title: new FormControl<string>(
      '',
      {
        nonNullable: true,
        validators: [
          Validators.required
        ]
      }
    ),

    description: new FormControl<string>(
      '',
      {
        nonNullable: true
      }
    ),

    displayOrder: new FormControl<number>(
      0,
      {
        nonNullable: true,
        validators: [
          Validators.required
        ]
      }
    )

  });


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

          console.log(
            'Gallery Response:',
            response
          );


          if (response?.status === true) {

            this.galleryList =
              response.data ?? [];

            this.cdr.detectChanges();

          }
          else {

            this.galleryList = [];

            this.errorMessage =
              response?.message ||
              'Unable to load gallery.';

          }

        },


        error: (error) => {

          this.loading = false;

          console.error(
            'Gallery Load Error:',
            error
          );

          this.errorMessage =
            error?.error?.message ||
            'Unable to load gallery.';

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

    console.log(
      'Opening image:',
      item
    );


    this.selectedImage =
      this.getImageUrl(
        item.imagePath
      );


    this.selectedImageTitle =
      item.title ||
      'Gallery Image';


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


  // ============================================================
  // FILE SELECT
  // ============================================================

  onFileSelected(event: Event): void {

    const input =
      event.target as HTMLInputElement;


    if (
      !input.files ||
      input.files.length === 0
    ) {

      return;

    }


    const file =
      input.files[0];


    const allowedTypes = [

      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp'

    ];


    if (
      !allowedTypes.includes(
        file.type
      )
    ) {

      this.errorMessage =
        'Only JPG, PNG and WEBP images are allowed.';

      this.selectedFile = null;

      this.previewUrl = null;

      return;

    }


    if (
      file.size >
      5 * 1024 * 1024
    ) {

      this.errorMessage =
        'Maximum image size is 5 MB.';

      this.selectedFile = null;

      this.previewUrl = null;

      return;

    }


    this.errorMessage = '';

    this.selectedFile = file;


    // Release previous preview URL

    if (this.previewUrl) {

      URL.revokeObjectURL(
        this.previewUrl
      );

    }


    this.previewUrl =
      URL.createObjectURL(file);

  }


  // ============================================================
  // UPLOAD
  // ============================================================

  upload(): void {

    if (
      this.galleryForm.invalid
    ) {

      this.galleryForm.markAllAsTouched();

      return;

    }


    if (!this.selectedFile) {

      this.errorMessage =
        'Please select an image.';

      return;

    }


    this.loading = true;

    this.message = '';

    this.errorMessage = '';


    const title =
      this.galleryForm.controls
        .title.value.trim();


    const description =
      this.galleryForm.controls
        .description.value.trim();


    const displayOrder =
      Number(
        this.galleryForm.controls
          .displayOrder.value
      );


    this.fileToBase64(
      this.selectedFile
    )

    .then(
      (imageBase64: string) => {


        const request = {

          title: title,

          description: description,

          displayOrder: displayOrder,

          fileName:
            this.selectedFile!.name,

          imageBase64:
            imageBase64

        };


        console.log(
          'Gallery Upload Request:',
          request
        );


        this.galleryService
          .uploadGallery(request)
          .subscribe({

            next: (response) => {

              this.loading = false;


              console.log(
                'Upload Response:',
                response
              );


              if (
                response?.status === true
              ) {

                this.message =
                  'Image uploaded successfully.';


                this.galleryForm.reset({

                  title: '',

                  description: '',

                  displayOrder: 0

                });


                this.selectedFile = null;


                if (this.previewUrl) {

                  URL.revokeObjectURL(
                    this.previewUrl
                  );

                }


                this.previewUrl = null;


                this.loadGallery();

              }
              else {

                this.errorMessage =
                  response?.message ||
                  'Upload failed.';

              }

            },


            error: (error) => {

              this.loading = false;


              console.error(
                'Upload Error:',
                error
              );


              this.errorMessage =
                error?.error?.message ||
                'Unable to upload image.';

            }

          });

      }
    )

    .catch(
      (error) => {

        this.loading = false;

        console.error(
          'Base64 conversion error:',
          error
        );

        this.errorMessage =
          'Unable to process selected image.';

      }
    );

  }


  // ============================================================
  // FILE TO BASE64
  // ============================================================

  fileToBase64(
    file: File
  ): Promise<string> {

    return new Promise(
      (
        resolve,
        reject
      ) => {

        const reader =
          new FileReader();


        reader.onload = () => {

          const result =
            reader.result as string;

          resolve(result);

        };


        reader.onerror = () => {

          reject(
            reader.error
          );

        };


        reader.readAsDataURL(file);

      }
    );

  }

}