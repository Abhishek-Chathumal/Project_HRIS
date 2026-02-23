import { Test, TestingModule } from '@nestjs/testing';
import { LdapService } from '../../src/auth/ldap/ldap.service';
import { ConfigService } from '@nestjs/config';

describe('LdapService', () => {
    let service: LdapService;

    const mockConfig = {
        get: (key: string, defaultValue?: unknown) => {
            const config: Record<string, unknown> = {
                LDAP_ENABLED: 'true',
                LDAP_URL: 'ldap://test-server:389',
                LDAP_BIND_DN: 'cn=admin,dc=test,dc=com',
                LDAP_BIND_PASSWORD: 'admin-pass',
                LDAP_SEARCH_BASE: 'ou=users,dc=test,dc=com',
                LDAP_SEARCH_FILTER: '(sAMAccountName={{username}})',
                LDAP_USERNAME_ATTR: 'sAMAccountName',
                LDAP_EMAIL_ATTR: 'mail',
                LDAP_FIRSTNAME_ATTR: 'givenName',
                LDAP_LASTNAME_ATTR: 'sn',
                LDAP_GROUP_SEARCH_BASE: 'ou=groups,dc=test,dc=com',
                LDAP_GROUP_SEARCH_FILTER: '(member={{dn}})',
                LDAP_GROUP_MEMBER_ATTR: 'cn',
                LDAP_TLS_ENABLED: 'false',
                LDAP_TLS_REJECT_UNAUTHORIZED: 'true',
                LDAP_CONNECTION_TIMEOUT: '5000',
                LDAP_IDLE_TIMEOUT: '10000',
                LDAP_ROLE_MAPPING: '{"Domain Admins":"admin","HR":"hr_manager","Employees":"employee"}',
            };
            return config[key] ?? defaultValue;
        },
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                LdapService,
                { provide: ConfigService, useValue: mockConfig },
            ],
        }).compile();

        service = module.get<LdapService>(LdapService);
    });

    describe('isEnabled', () => {
        it('should return true when LDAP_ENABLED is true', () => {
            expect(service.isEnabled()).toBe(true);
        });
    });

    describe('mapGroupsToRoles', () => {
        it('should map LDAP groups to HRIS roles', () => {
            const groups = ['Domain Admins', 'Employees'];
            const roles = service.mapGroupsToRoles(groups);

            expect(roles).toContain('admin');
            expect(roles).toContain('employee');
        });

        it('should return empty array for unrecognized groups', () => {
            const groups = ['Unknown Group', 'Another Group'];
            const roles = service.mapGroupsToRoles(groups);

            expect(roles).toHaveLength(0);
        });

        it('should handle empty group list', () => {
            const roles = service.mapGroupsToRoles([]);
            expect(roles).toHaveLength(0);
        });

        it('should deduplicate roles', () => {
            const groups = ['Domain Admins', 'Domain Admins'];
            const roles = service.mapGroupsToRoles(groups);

            expect(roles).toHaveLength(1);
            expect(roles[0]).toBe('admin');
        });
    });

    describe('getConfig', () => {
        it('should return sanitized config (no password)', () => {
            const config = service.getConfig();

            expect(config.url).toBe('ldap://test-server:389');
            expect(config.bindDN).toBe('cn=admin,dc=test,dc=com');
            expect(config).not.toHaveProperty('bindPassword');
        });
    });
});
