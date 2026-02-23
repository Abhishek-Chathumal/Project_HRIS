import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EncryptionService } from '../../src/common/security/encryption.service';

describe('EncryptionService', () => {
    let service: EncryptionService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                EncryptionService,
                {
                    provide: ConfigService,
                    useValue: {
                        get: (key: string, defaultValue?: string) => {
                            if (key === 'ENCRYPTION_MASTER_KEY') return null;
                            if (key === 'JWT_ACCESS_SECRET') return 'test-secret-key-that-is-at-least-32-characters-long';
                            return defaultValue;
                        },
                    },
                },
            ],
        }).compile();

        service = module.get<EncryptionService>(EncryptionService);
    });

    describe('encrypt / decrypt', () => {
        it('should encrypt and decrypt a string correctly', () => {
            const plaintext = 'Sensitive employee data: SSN 123-45-6789';
            const encrypted = service.encrypt(plaintext);
            const decrypted = service.decrypt(encrypted);

            expect(encrypted).not.toBe(plaintext);
            expect(decrypted).toBe(plaintext);
        });

        it('should produce different ciphertexts for the same input (random IV)', () => {
            const plaintext = 'Same input each time';
            const enc1 = service.encrypt(plaintext);
            const enc2 = service.encrypt(plaintext);

            expect(enc1).not.toBe(enc2);
            // Both should still decrypt correctly
            expect(service.decrypt(enc1)).toBe(plaintext);
            expect(service.decrypt(enc2)).toBe(plaintext);
        });

        it('should contain three colon-separated hex parts', () => {
            const encrypted = service.encrypt('test');
            const parts = encrypted.split(':');

            expect(parts).toHaveLength(3);
            parts.forEach((part) => expect(part).toMatch(/^[0-9a-f]+$/i));
        });

        it('should throw on corrupted ciphertext', () => {
            expect(() => service.decrypt('invalid:data:here')).toThrow();
        });

        it('should throw on malformed ciphertext format', () => {
            expect(() => service.decrypt('only-one-part')).toThrow('Invalid ciphertext format');
        });

        it('should handle empty string', () => {
            const encrypted = service.encrypt('');
            expect(service.decrypt(encrypted)).toBe('');
        });

        it('should handle unicode characters', () => {
            const plaintext = '日本語テスト 🔒 Ñoño';
            const encrypted = service.encrypt(plaintext);
            expect(service.decrypt(encrypted)).toBe(plaintext);
        });

        it('should handle very long strings', () => {
            const plaintext = 'x'.repeat(10000);
            const encrypted = service.encrypt(plaintext);
            expect(service.decrypt(encrypted)).toBe(plaintext);
        });
    });

    describe('encryptDeterministic', () => {
        it('should produce the same ciphertext for the same input', () => {
            const plaintext = 'user@example.com';
            const enc1 = service.encryptDeterministic(plaintext);
            const enc2 = service.encryptDeterministic(plaintext);

            expect(enc1).toBe(enc2);
        });

        it('should produce different ciphertext for different input', () => {
            const enc1 = service.encryptDeterministic('user1@example.com');
            const enc2 = service.encryptDeterministic('user2@example.com');

            expect(enc1).not.toBe(enc2);
        });

        it('should be prefixed with det:', () => {
            const encrypted = service.encryptDeterministic('test');
            expect(encrypted.startsWith('det:')).toBe(true);
        });
    });

    describe('hash / verifyHash', () => {
        it('should hash and verify a password', async () => {
            const password = 'SecureP@ssw0rd!';
            const hashed = await service.hash(password);

            expect(hashed).not.toBe(password);
            expect(hashed).toContain(':');

            const isValid = await service.verifyHash(password, hashed);
            expect(isValid).toBe(true);
        });

        it('should reject incorrect password', async () => {
            const hashed = await service.hash('correct-password');
            const isValid = await service.verifyHash('wrong-password', hashed);

            expect(isValid).toBe(false);
        });

        it('should produce unique hashes for the same input (random salt)', async () => {
            const hash1 = await service.hash('same-password');
            const hash2 = await service.hash('same-password');

            expect(hash1).not.toBe(hash2);
        });
    });

    describe('PII helpers', () => {
        it('should encrypt specified PII fields', () => {
            const data = {
                name: 'John Doe',
                ssn: '123-45-6789',
                email: 'john@example.com',
                age: 30,
            };

            const encrypted = service.encryptPII(data, ['ssn', 'email']);

            expect(encrypted.name).toBe('John Doe'); // Not encrypted
            expect(encrypted.age).toBe(30); // Not encrypted
            expect(encrypted.ssn).not.toBe('123-45-6789'); // Encrypted
            expect(encrypted.email).not.toBe('john@example.com'); // Encrypted
        });

        it('should decrypt specified PII fields', () => {
            const data = {
                ssn: service.encrypt('123-45-6789'),
                email: service.encrypt('john@example.com'),
            };

            const decrypted = service.decryptPII(data, ['ssn', 'email']);

            expect(decrypted.ssn).toBe('123-45-6789');
            expect(decrypted.email).toBe('john@example.com');
        });

        it('should skip non-string or null fields', () => {
            const data = { name: null, age: 25 };
            const result = service.encryptPII(data, ['name', 'age']);

            expect(result.name).toBeNull();
            expect(result.age).toBe(25);
        });
    });

    describe('masking', () => {
        it('should mask email', () => {
            expect(service.maskEmail('john.doe@example.com')).toBe('j******e@example.com');
        });

        it('should mask phone', () => {
            expect(service.maskPhone('+1234567890')).toBe('*******890');
        });

        it('should mask national ID', () => {
            expect(service.maskNationalId('123-45-6789')).toBe('*******6789');
        });
    });

    describe('generateSecureToken', () => {
        it('should generate a hex token', () => {
            const token = service.generateSecureToken();
            expect(token).toMatch(/^[0-9a-f]+$/i);
            expect(token.length).toBe(64); // 32 bytes = 64 hex chars
        });

        it('should generate unique tokens', () => {
            const t1 = service.generateSecureToken();
            const t2 = service.generateSecureToken();
            expect(t1).not.toBe(t2);
        });

        it('should respect custom byte length', () => {
            const token = service.generateSecureToken(16);
            expect(token.length).toBe(32); // 16 bytes = 32 hex chars
        });
    });
});
