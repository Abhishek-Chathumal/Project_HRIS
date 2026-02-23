import { Module } from '@nestjs/common';
import { RecruitmentController } from './recruitment.controller';
import { RecruitmentService } from './recruitment.service';
import { PrismaService } from '../common/prisma/prisma.service';

@Module({
    controllers: [RecruitmentController],
    providers: [RecruitmentService, PrismaService],
    exports: [RecruitmentService],
})
export class RecruitmentModule { }
