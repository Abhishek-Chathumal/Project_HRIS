import {
    Controller,
    Get,
    Post,
    Param,
    Query,
    UseGuards,
    ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'notifications', version: '1' })
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @Get()
    @ApiOperation({ summary: 'Get notifications for current user' })
    async getNotifications(
        @CurrentUser() user: { id: string },
        @Query('unreadOnly') unreadOnly?: boolean,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
    ) {
        return this.notificationsService.getUserNotifications(user.id, { unreadOnly, page, limit });
    }

    @Post(':id/read')
    @ApiOperation({ summary: 'Mark notification as read' })
    async markAsRead(
        @CurrentUser() user: { id: string },
        @Param('id', ParseUUIDPipe) id: string,
    ) {
        return this.notificationsService.markAsRead(user.id, id);
    }

    @Post('read-all')
    @ApiOperation({ summary: 'Mark all notifications as read' })
    async markAllAsRead(@CurrentUser() user: { id: string }) {
        return this.notificationsService.markAllAsRead(user.id);
    }
}
