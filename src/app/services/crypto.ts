import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CryptoService {

  // ---------- Helpers ----------
  private bufferToBase64(buffer: ArrayBufferLike): string {
    const arr = new Uint8Array(buffer as ArrayBuffer);
    return btoa(String.fromCharCode(...arr));
  }

  private base64ToBuffer(base64: string): ArrayBuffer {
    return Uint8Array.from(atob(base64), c => c.charCodeAt(0)).buffer;
  }

  private concatBuffers(...buffers: Uint8Array[]): Uint8Array {
    const totalLength = buffers.reduce((sum, b) => sum + b.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;

    for (const buffer of buffers) {
      result.set(buffer, offset);
      offset += buffer.length;
    }

    return result;
  }

  // ---------- Constants ----------
  private readonly ITERATIONS = 250000;
  private readonly SALT_LENGTH = 16;
  private readonly IV_LENGTH = 12;
  private readonly KEY_LENGTH = 256;

  // ---------- Key derivation ----------
  private async deriveKey(password: string, salt: ArrayBuffer): Promise<CryptoKey> {
    const encoder = new TextEncoder();

    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: this.ITERATIONS,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: this.KEY_LENGTH },
      false,
      ['encrypt', 'decrypt']
    );
  }

  // ---------- Encrypt ----------
  async encryptJson(data: unknown, password: string): Promise<string> {
    const salt = crypto.getRandomValues(new Uint8Array(this.SALT_LENGTH));
    const iv = crypto.getRandomValues(new Uint8Array(this.IV_LENGTH));
    const key = await this.deriveKey(password, salt.buffer);

    const json = JSON.stringify(data);
    const encoded = new TextEncoder().encode(json);

    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoded
    );

    const result = this.concatBuffers(
      salt,
      iv,
      new Uint8Array(encrypted)
    );

    return this.bufferToBase64(result.buffer);
  }

  // ---------- Decrypt ----------
  async decryptJson(encryptedBase64: string, password: string): Promise<unknown> {
    const data = new Uint8Array(this.base64ToBuffer(encryptedBase64));

    const salt = data.slice(0, this.SALT_LENGTH);
    const iv = data.slice(this.SALT_LENGTH, this.SALT_LENGTH + this.IV_LENGTH);
    const ciphertext = data.slice(this.SALT_LENGTH + this.IV_LENGTH);

    const key = await this.deriveKey(password, salt.buffer);

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext
    );

    const json = new TextDecoder().decode(decrypted);
    return JSON.parse(json);
  }
}
