import { Controller, Get, Post, Delete, Param, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { GdprService } from './gdpr.service';
import { EncryptionService } from './encryption.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@ApiTags('Security & Compliance')
@Controller('security')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SecurityController {
    constructor(
        private readonly gdprService: GdprService,
        private readonly encryptionService: EncryptionService,
    ) { }

    // ── GDPR Endpoints ────────────────────────

    @Get('gdpr/export/:userId')
    @Roles('admin', 'hr_manager')
    @ApiOperation({ summary: 'Export user data (GDPR Article 15 — Right to Access)' })
    async exportUserData(@Param('userId') userId: string) {
        const data = await this.gdprService.exportUserData(userId);
        return { success: true, data };
    }

    @Delete('gdpr/erase/:userId')
    @Roles('admin')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Erase user data (GDPR Article 17 — Right to Erasure)' })
    async eraseUserData(@Param('userId') userId: string, @Req() req: any) {
        const result = await this.gdprService.eraseUserData(userId, req.user.id);
        return { success: true, data: result };
    }

    @Post('gdpr/retention/enforce')
    @Roles('admin')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Run data retention enforcement' })
    async enforceRetention() {
        const results = await this.gdprService.enforceRetention();
        return { success: true, data: results };
    }

    @Get('gdpr/retention-policies')
    @Roles('admin', 'hr_manager')
    @ApiOperation({ summary: 'Get data retention policies' })
    getRetentionPolicies() {
        return {
            success: true,
            data: this.gdprService.getRetentionPolicies(),
        };
    }

    // ── Encryption Test ───────────────────────

    @Get('encryption/status')
    @Roles('admin')
    @ApiOperation({ summary: 'Check encryption service health' })
    encryptionStatus() {
        try {
            const testPlain = 'encryption-health-check';
            const encrypted = this.encryptionService.encrypt(testPlain);
            const decrypted = this.encryptionService.decrypt(encrypted);
            return {
                success: true,
                data: {
                    status: decrypted === testPlain ? 'healthy' : 'degraded',
                    algorithm: 'AES-256-GCM',
                    keyDerivation: 'PBKDF2-SHA512',
                    features: ['field-level-encryption', 'deterministic-search', 'pii-masking'],
                },
            };
        } catch {
            return {
                success: false,
                data: { status: 'error', message: 'Encryption service is not functioning' },
            };
        }
    }
}
