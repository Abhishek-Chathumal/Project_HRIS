import {
    Controller, Get, Post, Param, Body, Query,
    UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RecruitmentService } from './recruitment.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('recruitment')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'recruitment', version: '1' })
export class RecruitmentController {
    constructor(private readonly recruitmentService: RecruitmentService) { }

    @Get('summary')
    @ApiOperation({ summary: 'Get recruitment summary stats' })
    async getSummary() {
        return this.recruitmentService.getRecruitmentSummary();
    }

    @Get('jobs')
    @ApiOperation({ summary: 'Get all job postings' })
    async getJobs(@Query('status') status?: string, @Query('page') page?: number) {
        return this.recruitmentService.getJobPostings({ status, page });
    }

    @Get('jobs/:id')
    @ApiOperation({ summary: 'Get a single job posting with applications' })
    async getJob(@Param('id', ParseUUIDPipe) id: string) {
        return this.recruitmentService.getJobPosting(id);
    }

    @Post('jobs')
    @ApiOperation({ summary: 'Create a job posting' })
    async createJob(
        @CurrentUser() user: { id: string },
        @Body() data: {
            title: string; description: string; requirements?: string; benefits?: string;
            employmentType: string; experienceLevel?: string; salaryMin?: number; salaryMax?: number;
            location?: string; isRemote?: boolean; openings?: number; positionId?: string;
        },
    ) {
        return this.recruitmentService.createJobPosting({ ...data, createdBy: user.id });
    }

    @Post('jobs/:id/status')
    @ApiOperation({ summary: 'Update job posting status' })
    async updateJobStatus(
        @Param('id', ParseUUIDPipe) id: string,
        @Body('status') status: string,
    ) {
        return this.recruitmentService.updateJobPostingStatus(id, status);
    }

    @Get('jobs/:id/applications')
    @ApiOperation({ summary: 'Get applications for a job' })
    async getApplications(
        @Param('id', ParseUUIDPipe) id: string,
        @Query('status') status?: string,
    ) {
        return this.recruitmentService.getApplications(id, { status });
    }

    @Post('applications/:id/status')
    @ApiOperation({ summary: 'Update application status' })
    async updateApplicationStatus(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() data: { status: string; notes?: string },
    ) {
        return this.recruitmentService.updateApplicationStatus(id, data.status, data.notes);
    }
}
