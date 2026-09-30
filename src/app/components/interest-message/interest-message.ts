import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { MessageService } from '../../services/message.service';
import {
  InsertInterestWiseMessageRequest,
  InterestWiseMessageData,
  InterestItem
} from '../../models/interest-message';

@Component({
  selector: 'app-interest-message',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, DatePipe],
  templateUrl: './interest-message.html',
  styleUrl: './interest-message.css'
})
export class InterestMessageComponent implements OnInit {
  private messageService = inject(MessageService);
  private cdr = inject(ChangeDetectorRef);

  loading: boolean = false;
  listLoading: boolean = false;
  interestsLoading: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';
  createdId: number | null = null;
  showMediaSection: boolean = false;

  // POPUP MODAL STATE
  showSuccessModal: boolean = false;
  modalTitle: string = 'Saved Successfully!';
  modalMessage: string = '';
  modalNoticeId: number | null = null;
  modalCategory: string = '';

  interests: InterestItem[] = [];
  messages: InterestWiseMessageData[] = [];
  selectedFilterInterest: number | '' = '';

  messageForm = new FormGroup({
    interest_id: new FormControl<number | ''>('', [Validators.required]),
    message_head: new FormControl('', [Validators.required, Validators.maxLength(255)]),
    message_body: new FormControl('', [Validators.required]),
    validity_in_minutes: new FormControl<number>(1440, [Validators.required, Validators.min(1)]),
    is_active: new FormControl<'Y' | 'N'>('Y', [Validators.required]),
    photo1path: new FormControl(''),
    photo2path: new FormControl(''),
    videopath: new FormControl(''),
    documentpath: new FormControl(''),
    youtubeurl: new FormControl(''),
    facebookurl: new FormControl(''),
    instagramurl: new FormControl(''),
    Xurl: new FormControl('')
  });

  ngOnInit(): void {
    this.loadInterests();
    this.loadMessages();
  }

  loadInterests(): void {
    this.interestsLoading = true;
    this.messageService.getInterestList().subscribe({
      next: (res) => {
        this.interestsLoading = false;
        if (res && res.status && Array.isArray(res.data)) {
          this.interests = res.data;
        } else {
          this.interests = [];
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.interestsLoading = false;
        console.error('Failed to load interest categories:', err);
        this.cdr.detectChanges();
      }
    });
  }

  loadMessages(interestId?: number): void {
    this.listLoading = true;
    this.messageService.getInterestWiseMessages(interestId).subscribe({
      next: (res) => {
        this.listLoading = false;
        if (res && res.status && Array.isArray(res.data)) {
          this.messages = res.data;
        } else {
          this.messages = [];
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.listLoading = false;
        console.error('Failed to load interest-wise messages:', err);
        this.cdr.detectChanges();
      }
    });
  }

  onFilterChange(): void {
    const filterId = this.selectedFilterInterest !== '' ? Number(this.selectedFilterInterest) : undefined;
    this.loadMessages(filterId);
  }

  submitMessage(): void {
    if (this.messageForm.invalid) {
      this.messageForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';
    this.createdId = null;

    const val = this.messageForm.value;

    const payload: InsertInterestWiseMessageRequest = {
      interest_id: Number(val.interest_id),
      message_head: val.message_head?.trim(),
      message_body: val.message_body?.trim() ?? '',
      validity_in_minutes: Number(val.validity_in_minutes) || 1440,
      is_active: val.is_active || 'Y',
      photo1path: val.photo1path?.trim() || undefined,
      photo2path: val.photo2path?.trim() || undefined,
      videopath: val.videopath?.trim() || undefined,
      documentpath: val.documentpath?.trim() || undefined,
      youtubeurl: val.youtubeurl?.trim() || undefined,
      facebookurl: val.facebookurl?.trim() || undefined,
      instagramurl: val.instagramurl?.trim() || undefined,
      Xurl: val.Xurl?.trim() || undefined,
      entryby: localStorage.getItem('UserName') || 'Admin'
    };

    this.messageService.insertInterestWiseMessage(payload).subscribe({
      next: (res) => {
        this.loading = false;
        if (res && res.status) {
          this.createdId = res.msg_id ?? null;
          const selectedInterest = this.interests.find(i => String(i.interest_id) === String(payload.interest_id));
          const deptName = selectedInterest ? selectedInterest.interest_name : `Category #${payload.interest_id}`;
          
          this.modalTitle = 'Saved Successfully!';
          this.modalMessage = `Your targeted advisory for "${deptName}" has been successfully saved.`;
          this.modalNoticeId = this.createdId;
          this.modalCategory = deptName;
          this.showSuccessModal = true;

          this.successMessage = `Advisory published successfully for "${deptName}"! Notice ID: #${this.createdId}`;
          this.resetForm();
          this.loadMessages(this.selectedFilterInterest !== '' ? Number(this.selectedFilterInterest) : undefined);
        } else {
          this.errorMessage = res?.message || 'Failed to save interest-wise message.';
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        console.error('Error inserting interest message:', err);
        this.errorMessage = err?.error?.message || 'Server error occurred while inserting interest message.';
        this.cdr.detectChanges();
      }
    });
  }

  resetForm(): void {
    this.messageForm.reset({
      interest_id: '',
      message_head: '',
      message_body: '',
      validity_in_minutes: 1440,
      is_active: 'Y',
      photo1path: '',
      photo2path: '',
      videopath: '',
      documentpath: '',
      youtubeurl: '',
      facebookurl: '',
      instagramurl: '',
      Xurl: ''
    });
  }

  setValidityQuick(minutes: number): void {
    this.messageForm.patchValue({ validity_in_minutes: minutes });
  }

  toggleMediaSection(): void {
    this.showMediaSection = !this.showMediaSection;
  }

  getInterestName(interestId: number | null): string {
    if (!interestId) return 'General';
    const found = this.interests.find(i => String(i.interest_id) === String(interestId));
    return found ? found.interest_name : `Interest #${interestId}`;
  }

  closeSuccessModal(): void {
    this.showSuccessModal = false;
  }
}
