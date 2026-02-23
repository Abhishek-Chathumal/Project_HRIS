import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EncryptionService } from './encryption.service';
import { GdprService } from './gdpr.service';
import { SecurityController } from './security.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [ConfigModule, PrismaModule],
    controllers: [SecurityController],
    providers: [EncryptionService, GdprService],
    exports: [EncryptionService, GdprService],
})
export class SecurityModule { }
