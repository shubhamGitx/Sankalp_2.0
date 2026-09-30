import { TestBed } from '@angular/core/testing';
import { CryptoService } from './crypto.service';

describe('CryptoService', () => {
  let service: CryptoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CryptoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should generate a 16-digit random key', () => {
    const key = service.generateAESKey();
    expect(key).toMatch(/^\d{16}$/);
  });

  it('should encrypt and decrypt AES symmetric key payloads correctly', () => {
    const plaintext = 'SecretMessage123';
    const key = service.generateAESKey();

    const encrypted = service.encryptAES(plaintext, key);
    expect(encrypted).toBeTruthy();
    expect(encrypted).not.toEqual(plaintext);

    const decrypted = service.decryptAES(encrypted, key);
    expect(decrypted).toEqual(plaintext);
  });

  it('should encrypt RSA successfully', () => {
    const key = service.generateAESKey();
    const encrypted = service.encryptRSA(key);
    expect(encrypted).toBeTruthy();
    expect(encrypted.length).toBeGreaterThan(0);
  });
});
