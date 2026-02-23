import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

/**
 * Encryption Service — AES-256-GCM for data at rest
 *
 * Handles:
 * - Field-level encryption for PII (SSN, bank details, national ID)
 * - Deterministic encryption for searchable fields (email)
 * - Key derivation with PBKDF2
 * - Automatic IV/nonce generation
 */
@Injectable()
export class EncryptionService {
    private readonly logger = new Logger(EncryptionService.name);
    private readonly algorithm = 'aes-256-gcm';
    private readonly keyLength = 32; // 256 bits
    private readonly ivLength = 16;
    private readonly tagLength = 16;
    private readonly saltLength = 32;
    private readonly pbkdf2Iterations = 100_000;
    private masterKey: Buffer;

    constructor(private configService: ConfigService) {
        const key = this.configService.get<string>('ENCRYPTION_MASTER_KEY');
        if (!key || key.length < 32) {
            this.logger.warn(
                'ENCRYPTION_MASTER_KEY not set or too short. Using derived key from JWT secret (NOT recommended for production).',
            );
            const fallback = this.configService.get<string>('JWT_ACCESS_SECRET', 'default-dev-key-change-me-now!!!!');
            this.masterKey = crypto
                .createHash('sha256')
                .update(fallback)
                .digest();
        } else {
            this.masterKey = Buffer.from(key, 'hex');
        }
    }

    // ── Encrypt (AES-256-GCM) ─────────────────

    encrypt(plaintext: string): string {
        const iv = crypto.randomBytes(this.ivLength);
        const cipher = crypto.createCipheriv(this.algorithm, this.masterKey, iv, {
            authTagLength: this.tagLength,
        });

        let encrypted = cipher.update(plaintext, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        const authTag = cipher.getAuthTag();

        // Format: iv:authTag:ciphertext (all hex)
        return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
    }

    // ── Decrypt (AES-256-GCM) ─────────────────

    decrypt(ciphertext: string): string {
        try {
            const parts = ciphertext.split(':');
            if (parts.length !== 3) {
                throw new Error('Invalid ciphertext format');
            }

            const [ivHex, tagHex, encrypted] = parts;
            const iv = Buffer.from(ivHex, 'hex');
            const authTag = Buffer.from(tagHex, 'hex');

            const decipher = crypto.createDecipheriv(this.algorithm, this.masterKey, iv, {
                authTagLength: this.tagLength,
            });
            decipher.setAuthTag(authTag);

            let decrypted = decipher.update(encrypted, 'hex', 'utf8');
            decrypted += decipher.final('utf8');

            return decrypted;
        } catch (err) {
            this.logger.error(`Decryption failed: ${(err as Error).message}`);
            throw new Error('Decryption failed — data may be corrupted or key mismatch');
        }
    }

    // ── Deterministic encryption (for searchable fields) ──

    encryptDeterministic(plaintext: string): string {
        // Uses HMAC-based IV so same input → same output (searchable)
        const hmac = crypto.createHmac('sha256', this.masterKey);
        hmac.update(plaintext);
        const iv = hmac.digest().subarray(0, this.ivLength);

        const cipher = crypto.createCipheriv(this.algorithm, this.masterKey, iv, {
            authTagLength: this.tagLength,
        });

        let encrypted = cipher.update(plaintext, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        const authTag = cipher.getAuthTag();

        return `det:${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
    }

    // ── Hash (one-way, for passwords) ─────────

    async hash(plaintext: string): Promise<string> {
        const salt = crypto.randomBytes(this.saltLength);
        return new Promise((resolve, reject) => {
            crypto.pbkdf2(plaintext, salt, this.pbkdf2Iterations, 64, 'sha512', (err, derivedKey) => {
                if (err) return reject(err);
                resolve(`${salt.toString('hex')}:${derivedKey.toString('hex')}`);
            });
        });
    }

    async verifyHash(plaintext: string, storedHash: string): Promise<boolean> {
        const [saltHex, keyHex] = storedHash.split(':');
        const salt = Buffer.from(saltHex, 'hex');
        return new Promise((resolve, reject) => {
            crypto.pbkdf2(plaintext, salt, this.pbkdf2Iterations, 64, 'sha512', (err, derivedKey) => {
                if (err) return reject(err);
                resolve(crypto.timingSafeEqual(derivedKey, Buffer.from(keyHex, 'hex')));
            });
        });
    }

    // ── Token generation ──────────────────────

    generateSecureToken(bytes = 32): string {
        return crypto.randomBytes(bytes).toString('hex');
    }

    // ── PII field helpers ─────────────────────

    encryptPII(data: Record<string, unknown>, fields: string[]): Record<string, unknown> {
        const result = { ...data };
        for (const field of fields) {
            if (result[field] && typeof result[field] === 'string') {
                result[field] = this.encrypt(result[field] as string);
            }
        }
        return result;
    }

    decryptPII(data: Record<string, unknown>, fields: string[]): Record<string, unknown> {
        const result = { ...data };
        for (const field of fields) {
            if (result[field] && typeof result[field] === 'string') {
                try {
                    result[field] = this.decrypt(result[field] as string);
                } catch {
                    // Leave as-is if decryption fails (may not be encrypted)
                }
            }
        }
        return result;
    }

    // ── Mask PII for display ──────────────────

    maskEmail(email: string): string {
        const [local, domain] = email.split('@');
        if (!domain) return '***@***.***';
        return `${local[0]}${'*'.repeat(Math.max(local.length - 2, 1))}${local.slice(-1)}@${domain}`;
    }

    maskPhone(phone: string): string {
        return phone.replace(/\d(?=\d{4})/g, '*');
    }

    maskNationalId(id: string): string {
        return '*'.repeat(Math.max(id.length - 4, 0)) + id.slice(-4);
    }
}
