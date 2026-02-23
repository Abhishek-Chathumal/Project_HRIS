import { Controller, Get, Post, Param, Body, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PerformanceService } from './performance.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PrismaService } from '../common/prisma/prisma.service';

@ApiTags('performance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'performance', version: '1' })
export class PerformanceController {
    constructor(
        private readonly performanceService: PerformanceService,
        private readonly prisma: PrismaService,
    ) { }

    @Get('summary')
    @ApiOperation({ summary: 'Get performance review summary' })
    async getSummary() {
        return this.performanceService.getPerformanceSummary();
    }

    @Get('reviews')
    @ApiOperation({ summary: 'Get all performance reviews' })
    async getReviews(
        @Query('employeeId') employeeId?: string,
        @Query('status') status?: string,
        @Query('reviewType') reviewType?: string,
        @Query('page') page?: number,
    ) {
        return this.performanceService.getReviews({ employeeId, status, reviewType, page });
    }

    @Get('my-reviews')
    @ApiOperation({ summary: 'Get current user performance reviews' })
    async getMyReviews(@CurrentUser() user: { id: string }) {
        const employee = await this.prisma.employee.findUnique({ where: { userId: user.id } });
        if (!employee) return { data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } };
        return this.performanceService.getReviews({ employeeId: employee.id });
    }

    @Get('reviews/:id')
    @ApiOperation({ summary: 'Get a specific review' })
    async getReview(@Param('id', ParseUUIDPipe) id: string) {
        return this.performanceService.getReview(id);
    }

    @Post('reviews')
    @ApiOperation({ summary: 'Create a performance review' })
    async createReview(
        @CurrentUser() user: { id: string },
        @Body() data: { employeeId: string; reviewType: string; period: string; goals?: unknown; competencies?: unknown },
    ) {
        const reviewer = await this.prisma.employee.findUnique({ where: { userId: user.id } });
        return this.performanceService.createReview({ ...data, reviewerId: reviewer!.id });
    }

    @Post('reviews/:id/rate')
    @ApiOperation({ summary: 'Update review ratings' })
    async updateRatings(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() data: { selfRating?: number; reviewerRating?: number; finalRating?: number; strengths?: string; improvements?: string; comments?: string; status?: string },
    ) {
        return this.performanceService.updateReviewRatings(id, data);
    }
}
