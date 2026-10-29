import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { PortalService } from '../../services/portal';
import { MessageService } from '../../services/message.service';
import { CryptoService } from '../../services/crypto.service';
import { SelectDropdownComponent, DropdownOption } from '../select-dropdown/select-dropdown';
import { MapUserPortalData, SendToUserRequest, SendToUserResponse } from '../../models/map-user-portal';
import { BroadcastMessageData } from '../../models/broadcast-message';

@Component({
  selector: 'app-send-broadcast',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, SelectDropdownComponent],
  templateUrl: './send-broadcast.html',
  styleUrl: './send-broadcast.css'
})
export class SendBroadcastComponent implements OnInit {
  private portalService = inject(PortalService);
  private messageService = inject(MessageService);
  private cryptoService = inject(CryptoService);
  private cdr = inject(ChangeDetectorRef);

  private readonly ALL_CODE = 'all';
  private readonly ALL_OPTION: DropdownOption = { code: this.ALL_CODE, name: 'All' };

  portalOptions: DropdownOption[] = [];
  userTypeOptions: DropdownOption[] = [this.ALL_OPTION];

  selectedPortalId: string = this.ALL_CODE;
  selectedUserTypeId: string = this.ALL_CODE;

  records: MapUserPortalData[] = [];
  hasSearched: boolean = false;

  selectedRecordKeys: Set<string> = new Set<string>();

  sending: boolean = false;
  sendSuccessMessage: string = '';
  sendError: string = '';
  showBroadcastModal: boolean = false;
  approvedMessages: BroadcastMessageData[] = [];
  approvedMessageOptions: DropdownOption[] = [];
  selectedApprovedMessageId: string = '';
  selectedApprovedMessage: BroadcastMessageData | null = null;
  approvedMessagesLoading: boolean = false;
  approvedMessagesError: string = '';
  showApprovedMessagePreview: boolean = false;
  messageTypeOptions: DropdownOption[] = [];

  loading: boolean = false;
  portalLoading: boolean = false;
  portalError: string = '';
  userTypesLoading: boolean = false;
  userTypesError: string = '';
  errorMessage: string = '';

  ngOnInit(): void {
    this.loadPortals();
  }

  loadPortals(): void {
    this.portalLoading = true;
    this.portalError = '';
    this.portalService.getPortals().subscribe({
      next: (res: any) => {
        this.portalLoading = false;
        if (res && Array.isArray(res.data)) {
          this.portalOptions = [
            this.ALL_OPTION,
            ...res.data.map((item: any) => ({
              code: String(item.portal_id),
              name: this.decrypt(item.portal_name)
            }))
          ];
        } else {
          this.portalOptions = [this.ALL_OPTION];
          this.portalError = 'No portals available.';
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.portalLoading = false;
        this.portalOptions = [this.ALL_OPTION];
        this.portalError = 'Failed to load portals. Please try again.';
        console.error('Failed to load portals:', err);
        this.cdr.detectChanges();
      }
    });
  }

  onPortalChange(): void {
    this.selectedUserTypeId = this.ALL_CODE;
    this.userTypeOptions = [this.ALL_OPTION];
    this.userTypesError = '';
    this.userTypesLoading = false;

    if (!this.selectedPortalId || this.selectedPortalId === this.ALL_CODE) {
      this.cdr.detectChanges();
      return;
    }

    this.userTypesLoading = true;
    this.portalService.getUserType(this.selectedPortalId).subscribe({
      next: (res: any) => {
        this.userTypesLoading = false;
        if (res && Array.isArray(res.data)) {
          this.userTypeOptions = [
            this.ALL_OPTION,
            ...res.data.map((item: any) => ({
              code: String(item.User_Type_ID ?? item.user_type_id ?? ''),
              name: this.decrypt(item.User_Type_Name ?? item.user_type_name ?? '')
            }))
          ];
        } else {
          this.userTypeOptions = [this.ALL_OPTION];
          this.userTypesError = 'No user types are available for this portal.';
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.userTypesLoading = false;
        this.userTypeOptions = [this.ALL_OPTION];
        this.userTypesError = 'Failed to load user types. Please try again.';
        console.error('Failed to load portal user types:', err);
        this.cdr.detectChanges();
      }
    });
  }

  getDetails(): void {
    const portalId = this.selectedPortalId && this.selectedPortalId !== this.ALL_CODE
      ? this.selectedPortalId
      : 0;
    const userTypeId = this.selectedUserTypeId && this.selectedUserTypeId !== this.ALL_CODE
      ? this.selectedUserTypeId
      : 0;

    this.loading = true;
    this.errorMessage = '';
    this.hasSearched = true;
    this.sendSuccessMessage = '';
    this.sendError = '';

    this.portalService.getMapUserPortal(portalId, userTypeId).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.selectedRecordKeys = new Set<string>();
        if (res && res.status && Array.isArray(res.data)) {
          this.records = res.data;
        } else {
          this.records = [];
          this.errorMessage = res?.message || 'No records found.';
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.loading = false;
        this.records = [];
        this.selectedRecordKeys = new Set<string>();
        this.errorMessage = err?.error?.message || 'Failed to fetch records. Please try again.';
        console.error('Failed to fetch registered user-portal records:', err);
        this.cdr.detectChanges();
      }
    });
  }

  isSelected(record: MapUserPortalData): boolean {
    return this.selectedRecordKeys.has(this.getRecordKey(record));
  }

  toggleSelection(record: MapUserPortalData): void {
    const recordKey = this.getRecordKey(record);
    if (this.selectedRecordKeys.has(recordKey)) {
      this.selectedRecordKeys.delete(recordKey);
    } else {
      this.selectedRecordKeys.add(recordKey);
    }
    this.sendError = '';
  }

  get selectedCount(): number {
    return this.selectedRecordKeys.size;
  }

  get allSelected(): boolean {
    return this.records.length > 0 && this.records.every(record => this.isSelected(record));
  }

  toggleAll(): void {
    if (this.allSelected) {
      this.selectedRecordKeys = new Set<string>();
    } else {
      this.selectedRecordKeys = new Set<string>(this.records.map(record => this.getRecordKey(record)));
    }
    this.sendError = '';
  }

  openBroadcastModal(): void {
    if (this.selectedCount === 0) {
      return;
    }

    this.sendSuccessMessage = '';
    this.sendError = '';
    this.selectedApprovedMessageId = '';
    this.selectedApprovedMessage = null;
    this.showApprovedMessagePreview = false;
    this.showBroadcastModal = true;
    this.loadApprovedMessages();
    this.loadMessageTypes();
  }

  closeBroadcastModal(): void {
    if (!this.sending) {
      this.showApprovedMessagePreview = false;
      this.showBroadcastModal = false;
      this.selectedApprovedMessageId = '';
      this.selectedApprovedMessage = null;
      this.sendError = '';
    }
  }

  loadApprovedMessages(): void {
    this.approvedMessagesLoading = true;
    this.approvedMessagesError = '';

    this.messageService.getBroadcastMessages().subscribe({
      next: (res: any) => {
        this.approvedMessagesLoading = false;
        const messages = res?.status && Array.isArray(res.data)
          ? res.data as BroadcastMessageData[]
          : [];

        this.approvedMessages = messages.filter(message => this.isApproved(message.is_approved));
        this.approvedMessageOptions = this.approvedMessages.map(message => ({
          code: String(message.bmsg_id),
          name: `#${message.bmsg_id} — ${message.message_head?.trim() || 'Untitled broadcast message'}`
        }));

        if (!this.approvedMessages.length) {
          this.approvedMessagesError = 'No approved broadcast messages are available.';
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.approvedMessagesLoading = false;
        this.approvedMessages = [];
        this.approvedMessageOptions = [];
        this.approvedMessagesError = 'Failed to load approved broadcast messages. Please try again.';
        console.error('Failed to load approved broadcast messages:', err);
        this.cdr.detectChanges();
      }
    });
  }

  private loadMessageTypes(): void {
    this.messageService.getMessageTypes().subscribe({
      next: (res: any) => {
        this.messageTypeOptions = Array.isArray(res?.data)
          ? res.data.map((item: any) => {
              const code = String(item.mesg_type_id ?? item.MesgTypeID ?? '');
              const name = String(item.mesg_type_name ?? item.MesgTypeName ?? '').trim();
              const abbreviation = String(item.msg_abbr_code ?? item.MsgAbbrCode ?? '').trim();
              return {
                code,
                name: abbreviation ? `${name} - (${abbreviation})` : name
              };
            }).filter((item: DropdownOption) => item.code && item.name)
          : [];
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Failed to load message types:', err)
    });
  }

  onApprovedMessageChanged(value: string | string[]): void {
    const selectedValue = Array.isArray(value) ? value[0] : value;
    this.selectedApprovedMessageId = selectedValue ? String(selectedValue) : '';
    const selectedId = Number(this.selectedApprovedMessageId);
    this.selectedApprovedMessage = this.approvedMessages.find(message => message.bmsg_id === selectedId) ?? null;
    this.sendError = '';

    if (this.selectedApprovedMessage) {
      this.showApprovedMessagePreview = true;
    }
  }

  closeApprovedMessagePreview(resetSelection = false): void {
    if (this.sending) return;

    this.showApprovedMessagePreview = false;
    this.sendError = '';
    if (resetSelection) {
      this.selectedApprovedMessageId = '';
      this.selectedApprovedMessage = null;
    }
  }

  private isApproved(value: boolean | string | number | null | undefined): boolean {
    if (value === true || value === 1) return true;
    const normalized = String(value ?? '').trim().toUpperCase();
    return normalized === 'Y' || normalized === 'YES' || normalized === 'TRUE' || normalized === '1';
  }

  sendToUsers(): void {
    this.sendSuccessMessage = '';
    this.sendError = '';

    const approvedMessage = this.selectedApprovedMessage;
    if (!approvedMessage || !this.isApproved(approvedMessage.is_approved)) {
      this.sendError = 'Please select an approved broadcast message.';
      return;
    }

    const title = approvedMessage.message_head?.trim() || '';
    const bodyText = approvedMessage.message_body?.trim() || '';

    if (!title) {
      this.sendError = 'The selected approved message does not contain a title.';
      return;
    }
    if (title.length > 255) {
      this.sendError = 'Message title cannot exceed 255 characters.';
      return;
    }

    if (!bodyText) {
      this.sendError = 'The selected approved message does not contain a message body.';
      return;
    }
    if (bodyText.length > 4000) {
      this.sendError = 'Message body cannot exceed 4000 characters.';
      return;
    }

    const selectedRecords = this.records.filter(record => this.isSelected(record));
    if (selectedRecords.length === 0) {
      this.sendError = 'Please select at least one user from the grid below.';
      return;
    }

    const validRecords = selectedRecords.filter(r => (r.userid ?? '').trim().length > 0);
    const skippedCount = selectedRecords.length - validRecords.length;

    if (validRecords.length === 0) {
      this.sendError = 'None of the selected records contain a valid user ID for notification delivery.';
      return;
    }

    const requests = validRecords.map(r => {
      const payload: SendToUserRequest = {
        userId: r.userid!.trim(),
        title,
        body: bodyText,
        imageUrl: '',
        data: {}
      };
      return this.messageService.sendToUser(payload).pipe(
        catchError(err => {
          console.error('Error sending notification to user', r.user_portal_id, err);
          const body = err?.error ?? {};
          return of({
            success: body?.success ?? false,
            message: body?.message || err?.message || 'Server error occurred while sending the message.',
            userId: body?.userId ?? undefined,
            totalDevices: body?.totalDevices ?? 0,
            successCount: body?.successCount ?? 0,
            failureCount: body?.failureCount ?? 1,
            deactivatedTokenCount: body?.deactivatedTokenCount ?? 0
          } as SendToUserResponse);
        })
      );
    });

    this.sending = true;
    forkJoin(requests).subscribe({
      next: (responses: SendToUserResponse[]) => {
        this.sending = false;
        let totalDevices = 0;
        let successCount = 0;
        let failureCount = 0;
        let deactivatedTokenCount = 0;
        const errors: string[] = [];

        responses.forEach(res => {
          totalDevices += res?.totalDevices ?? 0;
          successCount += res?.successCount ?? 0;
          failureCount += res?.failureCount ?? 0;
          deactivatedTokenCount += res?.deactivatedTokenCount ?? 0;
          if (!res?.success) {
            errors.push(res?.message || 'Failed to send notification.');
          }
        });

        if (errors.length === 0) {
          this.sendSuccessMessage =
            `Notification sent successfully. Total devices: ${totalDevices}, ` +
            `Sent: ${successCount}, Failed: ${failureCount}, Deactivated tokens: ${deactivatedTokenCount}.` +
            (skippedCount > 0 ? ` (${skippedCount} user(s) skipped - no user ID.)` : '');
          this.selectedRecordKeys = new Set<string>();
          this.selectedApprovedMessageId = '';
          this.selectedApprovedMessage = null;
          this.showApprovedMessagePreview = false;
          this.showBroadcastModal = false;
        } else {
          const failedUsers = responses.filter(res => !res.success).length;
          this.sendError =
            `${errors[0]} (${failedUsers}/${validRecords.length} user(s) failed.)` +
            (skippedCount > 0 ? ` ${skippedCount} user(s) skipped - no user ID.` : '');
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.sending = false;
        this.sendError = err?.error?.message || 'Server error occurred while sending the message.';
        console.error('Error sending message to selected users:', err);
        this.cdr.detectChanges();
      }
    });
  }

  messageTypeLabel(messageTypeId: number | undefined): string {
    if (!messageTypeId) return '—';
    return this.messageTypeOptions.find(option => Number(option.code) === messageTypeId)?.name
      ?? `Type #${messageTypeId}`;
  }

  attachmentEntries(message: BroadcastMessageData): Array<{ label: string; path: string }> {
    return [
      { label: 'Photo 1', path: message.photo1path || '' },
      { label: 'Photo 2', path: message.photo2path || '' },
      { label: 'Video', path: message.videopath || '' },
      { label: 'Document', path: message.documentpath || '' },
      { label: 'Audio', path: message.audiopath || '' }
    ].filter(item => item.path.trim().length > 0);
  }

  private getRecordKey(record: MapUserPortalData): string {
    if (record.user_portal_id !== null) {
      return `mapping-${record.user_portal_id}`;
    }

    return `user-${record.userid ?? record.mobile ?? ''}`;
  }

  private decrypt(value: any): string {
    if (value === undefined || value === null || value === '') return '';
    const clientAES = localStorage.getItem('clientAES') || '';
    try {
      const decrypted = this.cryptoService.decryptAES(String(value), clientAES);
      return decrypted || String(value);
    } catch {
      return String(value);
    }
  }
}
