import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  forwardRef,
  inject,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface DropdownOption {
  code: string;
  name: string;
}

@Component({
  selector: 'app-select-dropdown',
  standalone: true,
  imports: [],
  templateUrl: './select-dropdown.html',
  styleUrl: './select-dropdown.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectDropdownComponent),
      multi: true,
    },
  ],
})
export class SelectDropdownComponent implements ControlValueAccessor {

  private host = inject(ElementRef<HTMLElement>);

  @Input() options: DropdownOption[] = [];
  @Input() placeholder = 'Select';
  @Input() id = '';
  @Input() multiple = false;
  @Output() changed = new EventEmitter<string | string[]>();

  value: string | string[] = '';
  disabled = false;
  isOpen = false;
  dropUp = false;

  private onChange: (value: string | string[]) => void = () => {};
  private onTouched: () => void = () => {};

  get selectedLabel(): string {
    if (this.multiple) {
      const arr = Array.isArray(this.value) ? this.value : [];
      if (!arr.length) return '';
      return this.options
        .filter((o) => this.isActive(o.code))
        .map((o) => o.name)
        .join(', ');
    }
    const match = this.options.find((o) => this.isActive(o.code));
    return match ? match.name : '';
  }

  isActive(code: string): boolean {
    if (this.multiple) {
      const arr = Array.isArray(this.value) ? this.value : [];
      return arr.some((v) => v != null && String(v) === String(code));
    }
    return this.value != null && code != null && String(code) === String(this.value);
  }

  toggle(): void {
    if (this.disabled) return;
    if (!this.isOpen) {
      this.updateDropDirection();
    }
    this.isOpen = !this.isOpen;
    if (!this.isOpen) {
      this.onTouched();
    }
  }

  select(option: DropdownOption): void {
    const code = String(option.code);
    if (this.multiple) {
      const arr = Array.isArray(this.value) ? this.value.map((v) => String(v)) : [];
      const idx = arr.indexOf(code);
      if (idx >= 0) {
        arr.splice(idx, 1);
      } else {
        arr.push(code);
      }
      this.value = arr;
      this.onChange(arr);
      this.onTouched();
      this.changed.emit(arr);
      return;
    }
    this.value = code;
    this.isOpen = false;
    this.onChange(code);
    this.onTouched();
    this.changed.emit(code);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.isOpen && !this.host.nativeElement.contains(event.target as Node)) {
      this.isOpen = false;
      this.onTouched();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isOpen) {
      this.isOpen = false;
      this.onTouched();
    }
  }

  private updateDropDirection(): void {
    const rect = this.host.nativeElement.getBoundingClientRect();
    const container = this.getScrollParent();
    const containerRect = container?.getBoundingClientRect();
    const top = containerRect ? containerRect.top : 0;
    const bottom = containerRect ? containerRect.bottom : window.innerHeight;

    const spaceBelow = bottom - rect.bottom;
    const spaceAbove = rect.top - top;
    // Panel is ~204px tall; flip upward when there is more room above.
    this.dropUp = spaceBelow < 220 && spaceAbove > spaceBelow;
  }

  private getScrollParent(): HTMLElement | null {
    let el: HTMLElement | null = this.host.nativeElement.parentElement;
    while (el) {
      const overflowY = getComputedStyle(el).overflowY;
      if ((overflowY === 'auto' || overflowY === 'scroll') && el.scrollHeight > el.clientHeight) {
        return el;
      }
      el = el.parentElement;
    }
    return null;
  }

  // ---- ControlValueAccessor ----
  writeValue(value: string | string[]): void {
    if (this.multiple) {
      this.value = value == null ? [] : (Array.isArray(value) ? value.map((v) => String(v)) : []);
    } else {
      this.value = value == null ? '' : String(value);
    }
  }

  registerOnChange(fn: (value: string | string[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (isDisabled) {
      this.isOpen = false;
    }
  }
}
