import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { LdapService } from '../ldap/ldap.service';
import { AuthService } from '../auth.service';
import { PrismaService } from '../../common/prisma/prisma.service';

/**
 * LDAP Passport Strategy
 *
 * Auth flow:
 * 1. User submits username + password
 * 2. Authenticate against LDAP server (bind)
 * 3. If LDAP auth succeeds, find/create local user record
 * 4. Map LDAP groups → HRIS roles
 * 5. Return local user with JWT tokens
 */
@Injectable()
export class LdapStrategy extends PassportStrategy(Strategy, 'ldap') {
  constructor(
    private ldapService: LdapService,
    private prisma: PrismaService,
  ) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  async validate(username: string, password: string): Promise<any> {
    if (!this.ldapService.isEnabled()) {
      throw new UnauthorizedException('LDAP authentication is not enabled');
    }

    // Step 1: Authenticate against LDAP
    const ldapUser = await this.ldapService.authenticate(username, password);

    if (!ldapUser) {
      throw new UnauthorizedException('Invalid LDAP credentials');
    }

    // Step 2: Find or create local user
    let user = await this.prisma.user.findUnique({
      where: { email: ldapUser.email },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: { permission: true },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      // Auto-provision user from LDAP
      const roles = this.ldapService.mapGroupsToRoles(ldapUser.groups);

      // Find matching HRIS roles
      const hrisRoles = await this.prisma.role.findMany({
        where: { name: { in: roles } },
      });

      user = await this.prisma.user.create({
        data: {
          email: ldapUser.email,
          passwordHash: '', // No local password — LDAP auth only
          isActive: true,
          authProvider: 'ldap',
          ldapDN: ldapUser.dn,
          userRoles: {
            create: hrisRoles.map((role) => ({
              roleId: role.id,
            })),
          },
        },
        include: {
          userRoles: {
            include: {
              role: {
                include: {
                  permissions: {
                    include: { permission: true },
                  },
                },
              },
            },
          },
        },
      });

      // Also create employee record
      await this.prisma.employee.create({
        data: {
          userId: user.id,
          firstName: ldapUser.firstName,
          lastName: ldapUser.lastName,
          personalEmail: ldapUser.email,
          employeeNumber: `LDAP-${Date.now()}`,
          employmentStatus: 'active',
          employmentType: 'full-time',
          joiningDate: new Date(),
        },
      });
    } else {
      // Update existing user's LDAP DN if changed
      if (user.ldapDN !== ldapUser.dn) {
        await this.prisma.user.update({
          where: { id: user.id },
          data: { ldapDN: ldapUser.dn, authProvider: 'ldap' },
        });
      }
    }

    return user;
  }
}
