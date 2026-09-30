import { Injectable } from '@angular/core';
import JSEncrypt from 'jsencrypt';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class CryptoService {
  private readonly publicKey = `-----BEGIN PUBLIC KEY-----
MIGeMA0GCSqGSIb3DQEBAQUAA4GMADCBiAKBgHku9FgsugVBCpcxNTry5iqn9bco
o4Y6xl6M+MgGQVGkF03d5mag1U3g3BvJL0g5aCefirsUzdXnTmSIciuxvC6OmIvd
nOGhDTRKgq5COm7aKBhX5C8pPXjWqOUfO6YPL+X7fyvbY+GJ+Jb0j2WNj0ozkZN1
RfBzj8xQCETxJNUxAgMBAAE=
-----END PUBLIC KEY-----`;

  /**
   * Generates a random 16-digit numeric string to be used as the AES-128 key.
   */
  generateAESKey(): string {
    const digits = '0123456789';
    let key = '';
    for (let i = 0; i < 16; i++) {
      key += digits.charAt(Math.floor(Math.random() * digits.length));
    }
    return key;
  }

  /**
   * Encrypts the client AES key using the server's RSA public key.
   * Uses PKCS#1 v1.5 padding (default behavior of JSEncrypt).
   */
  encryptRSA(plaintextKey: string): string {
    const jsEncrypt = new JSEncrypt();
    jsEncrypt.setPublicKey(this.publicKey);
    const encrypted = jsEncrypt.encrypt(plaintextKey);
    if (!encrypted) {
      throw new Error('RSA encryption failed.');
    }
    return encrypted;
  }

  /**
   * Encrypts a string using AES-128-CBC and returns a Base64-encoded JSON payload
   * containing: iv (Base64), value (Base64URL ciphertext), mac (HMAC-SHA256 of iv+value), and ts (timestamp).
   */
  encryptAES(plaintext: string, key: string): string {
    const keyHex = CryptoJS.enc.Utf8.parse(key);
    const iv = CryptoJS.lib.WordArray.random(16);

    const encrypted = CryptoJS.AES.encrypt(plaintext, keyHex, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });

    const ciphertextBase64 = encrypted.ciphertext.toString(CryptoJS.enc.Base64);
    
    // Convert ciphertextBase64 to base64url format
    const valueBase64Url = ciphertextBase64
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    const ivBase64 = iv.toString(CryptoJS.enc.Base64);

    // Compute MAC: HMAC-SHA256 of (ivBase64 + valueBase64Url)
    const macHex = CryptoJS.HmacSHA256(ivBase64 + valueBase64Url, keyHex).toString(CryptoJS.enc.Hex);

    // Format timestamp: "dd-MM-yyyy HH:mm:ss"
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const ts = `${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    const payloadObj = {
      iv: ivBase64,
      value: valueBase64Url,
      mac: macHex,
      ts: ts
    };

    const payloadJsonString = JSON.stringify(payloadObj);
    return CryptoJS.enc.Utf8.parse(payloadJsonString).toString(CryptoJS.enc.Base64);
  }

  /**
   * Decrypts a Base64-encoded JSON payload using AES-128-CBC and the provided key.
   */
  decryptAES(encryptedPayload: string, key: string): string {
    if (!encryptedPayload) {
      return '';
    }
    const keyHex = CryptoJS.enc.Utf8.parse(key);

    // Decode the base64-encoded payload JSON (handle url-safe base64 and missing padding)
    let normalizedPayload = encryptedPayload.replace(/-/g, '+').replace(/_/g, '/');
    while (normalizedPayload.length % 4) {
      normalizedPayload += '=';
    }
    const payloadJsonString = CryptoJS.enc.Base64.parse(normalizedPayload).toString(CryptoJS.enc.Utf8);
    const payload = JSON.parse(payloadJsonString);

    const ivBase64 = payload.iv;
    const valueBase64Url = payload.value;

    // Convert base64url back to standard base64
    let valueBase64 = valueBase64Url.replace(/-/g, '+').replace(/_/g, '/');
    while (valueBase64.length % 4) {
      valueBase64 += '=';
    }

    const decrypted = CryptoJS.AES.decrypt(valueBase64, keyHex, {
      iv: CryptoJS.enc.Base64.parse(ivBase64),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });

    return decrypted.toString(CryptoJS.enc.Utf8);
  }
}
