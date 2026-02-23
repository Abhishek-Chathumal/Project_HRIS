import { Controller, Get, Post, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LdapService } from './ldap.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';

@ApiTags('LDAP')
@Controller('ldap')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class LdapController {
    constructor(private readonly ldapService: LdapService) { }

    @Get('config')
    @Roles('admin')
    @ApiOperation({ summary: 'Get LDAP configuration (admin only)' })
    getConfig() {
        return {
            success: true,
            data: this.ldapService.getConfig(),
        };
    }

    @Get('status')
    @Roles('admin')
    @ApiOperation({ summary: 'Get LDAP integration status' })
    getStatus() {
        return {
            success: true,
            data: {
                enabled: this.ldapService.isEnabled(),
            },
        };
    }

    @Post('test-connection')
    @Roles('admin')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Test LDAP connection (admin only)' })
    async testConnection() {
        const result = await this.ldapService.testConnection();
        return {
            success: result.success,
            data: result,
        };
    }

    @Post('sync')
    @Roles('admin')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Sync users from LDAP directory (admin only)' })
    async syncDirectory() {
        const users = await this.ldapService.syncDirectoryUsers();
        return {
            success: true,
            data: {
                syncedCount: users.length,
                users: users.map((u) => ({
                    username: u.username,
                    email: u.email,
                    firstName: u.firstName,
                    lastName: u.lastName,
                    groups: u.groups,
                })),
            },
        };
    }
}
