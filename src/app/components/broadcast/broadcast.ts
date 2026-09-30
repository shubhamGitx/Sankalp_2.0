import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { MessageService } from '../../services/message.service';
import {
  InsertBroadcastMessageRequest,
  BroadcastMessageData
} from '../../models/broadcast-message';

@Component({
  selector: 'app-broadcast',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatePipe],
  templateUrl: './broadcast.html',
  styleUrl: './broadcast.css'
})
export class BroadcastComponent implements OnInit {
  private messageService = inject(MessageService);
  private cdr = inject(ChangeDetectorRef);

  loading: boolean = false;
  listLoading: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';
  createdId: number | null = null;

  // POPUP MODAL STATE
  showSuccessModal: boolean = false;
  modalTitle: string = 'Saved Successfully!';
  modalMessage: string = '';
  modalNoticeId: number | null = null;

  broadcastList: BroadcastMessageData[] = [];

  broadcastForm = new FormGroup({
    message_head: new FormControl('', [Validators.required, Validators.maxLength(255)]),
    message_body: new FormControl('', [Validators.required]),
    validity_in_minutes: new FormControl(1440, [Validators.required, Validators.min(1)]),
    is_active: new FormControl<'Y' | 'N'>('Y', [Validators.required]),
    photo1path: new FormControl(''),
    videopath: new FormControl(''),
    documentpath: new FormControl('')
  });

  ngOnInit(): void {
    this.loadBroadcastMessages();
  }

  loadBroadcastMessages(): void {
    this.listLoading = true;
    this.messageService.getBroadcastMessages().subscribe({
      next: (res) => {
        this.listLoading = false;
        if (res && res.status && Array.isArray(res.data)) {
          this.broadcastList = res.data;
        } else {
          this.broadcastList = [];
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.listLoading = false;
        console.error('Failed to load broadcast messages:', err);
        this.cdr.detectChanges();
      }
    });
  }

  submitBroadcast(): void {
    if (this.broadcastForm.invalid) {
      this.broadcastForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';
    this.createdId = null;

    const val = this.broadcastForm.value;

    const payload: InsertBroadcastMessageRequest = {
      message_head: val.message_head?.trim(),
      message_body: val.message_body?.trim() ?? '',
      validity_in_minutes: Number(val.validity_in_minutes) || 1440,
      is_active: val.is_active || 'Y',
      photo1path: val.photo1path?.trim() || undefined,
      videopath: val.videopath?.trim() || undefined,
      documentpath: val.documentpath?.trim() || undefined,
      entryby: localStorage.getItem('UserName') || 'Admin'
    };

    this.messageService.insertBroadcastMessage(payload).subscribe({
      next: (res) => {
        this.loading = false;
        if (res && res.status) {
          this.createdId = res.bmsg_id ?? null;
          
          this.modalTitle = 'Saved Successfully!';
          this.modalMessage = 'Your broadcast advisory has been published successfully to all citizens.';
          this.modalNoticeId = this.createdId;
          this.showSuccessModal = true;

          this.successMessage = `Broadcast message successfully published! Notice ID: #${this.createdId}`;
          this.broadcastForm.reset({
            message_head: '',
            message_body: '',
            validity_in_minutes: 1440,
            is_active: 'Y',
            photo1path: '',
            videopath: '',
            documentpath: ''
          });
          this.loadBroadcastMessages();
        } else {
          this.errorMessage = res?.message || 'Failed to save broadcast message.';
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        console.error('Error inserting broadcast:', err);
        this.errorMessage = err?.error?.message || 'Server error occurred while inserting broadcast record.';
        this.cdr.detectChanges();
      }
    });
  }

  setValidityQuick(minutes: number): void {
    this.broadcastForm.patchValue({ validity_in_minutes: minutes });
  }

  closeSuccessModal(): void {
    this.showSuccessModal = false;
  }
}
