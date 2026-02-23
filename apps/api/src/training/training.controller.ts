import { Controller, Get, Post, Param, Body, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TrainingService } from './training.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PrismaService } from '../common/prisma/prisma.service';

@ApiTags('training')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'training', version: '1' })
export class TrainingController {
    constructor(
        private readonly trainingService: TrainingService,
        private readonly prisma: PrismaService,
    ) { }

    @Get('summary')
    @ApiOperation({ summary: 'Get training summary' })
    async getSummary() {
        return this.trainingService.getTrainingSummary();
    }

    @Get('courses')
    @ApiOperation({ summary: 'Get all courses' })
    async getCourses(@Query('category') category?: string, @Query('page') page?: number) {
        return this.trainingService.getCourses({ category, page });
    }

    @Get('courses/:id')
    @ApiOperation({ summary: 'Get course with enrollments' })
    async getCourse(@Param('id', ParseUUIDPipe) id: string) {
        return this.trainingService.getCourse(id);
    }

    @Post('courses')
    @ApiOperation({ summary: 'Create a training course' })
    async createCourse(@Body() data: {
        title: string; description?: string; category: string; provider?: string;
        format: string; duration?: number; maxParticipants?: number; cost?: number;
        currency?: string; isMandatory?: boolean; skills?: string[];
    }) {
        return this.trainingService.createCourse(data);
    }

    @Post('courses/:id/enroll')
    @ApiOperation({ summary: 'Enroll an employee in a course' })
    async enroll(
        @Param('id', ParseUUIDPipe) courseId: string,
        @Body('employeeId') employeeId: string,
    ) {
        return this.trainingService.enrollEmployee(courseId, employeeId);
    }

    @Get('my-enrollments')
    @ApiOperation({ summary: 'Get current user enrollments' })
    async getMyEnrollments(@CurrentUser() user: { id: string }) {
        const employee = await this.prisma.employee.findUnique({ where: { userId: user.id } });
        if (!employee) return [];
        return this.trainingService.getMyEnrollments(employee.id);
    }

    @Post('enrollments/:id/update')
    @ApiOperation({ summary: 'Update enrollment progress' })
    async updateEnrollment(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() data: { progress?: number; status?: string; score?: number; feedback?: string; rating?: number },
    ) {
        return this.trainingService.updateEnrollment(id, data);
    }
}
