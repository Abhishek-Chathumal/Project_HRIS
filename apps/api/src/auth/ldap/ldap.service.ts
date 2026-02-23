import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as ldap from 'ldapjs';

export interface LdapConfig {
  enabled: boolean;
  url: string;
  bindDN: string;
  bindPassword: string;
  searchBase: string;
  searchFilter: string;
  usernameAttribute: string;
  emailAttribute: string;
  firstNameAttribute: string;
  lastNameAttribute: string;
  groupSearchBase: string;
  groupSearchFilter: string;
  groupMemberAttribute: string;
  tlsEnabled: boolean;
  tlsRejectUnauthorized: boolean;
  connectionTimeout: number;
  idleTimeout: number;
  // Role mapping: LDAP group → HRIS role
  roleMapping: Record<string, string>;
}

export interface LdapUser {
  dn: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  groups: string[];
  rawAttributes: Record<string, string | string[]>;
}

@Injectable()
export class LdapService implements OnModuleDestroy {
  private readonly logger = new Logger(LdapService.name);
  private client: ldap.Client | null = null;
  private config: LdapConfig;

  constructor(private configService: ConfigService) {
    this.config = this.loadConfig();
  }

  private loadConfig(): LdapConfig {
    return {
      enabled: this.configService.get<boolean>('LDAP_ENABLED', false),
      url: this.configService.get<string>('LDAP_URL', 'ldap://localhost:389'),
      bindDN: this.configService.get<string>('LDAP_BIND_DN', ''),
      bindPassword: this.configService.get<string>('LDAP_BIND_PASSWORD', ''),
      searchBase: this.configService.get<string>('LDAP_SEARCH_BASE', 'dc=example,dc=com'),
      searchFilter: this.configService.get<string>(
        'LDAP_SEARCH_FILTER',
        '(sAMAccountName={{username}})',
      ),
      usernameAttribute: this.configService.get<string>('LDAP_USERNAME_ATTR', 'sAMAccountName'),
      emailAttribute: this.configService.get<string>('LDAP_EMAIL_ATTR', 'mail'),
      firstNameAttribute: this.configService.get<string>('LDAP_FIRSTNAME_ATTR', 'givenName'),
      lastNameAttribute: this.configService.get<string>('LDAP_LASTNAME_ATTR', 'sn'),
      groupSearchBase: this.configService.get<string>('LDAP_GROUP_SEARCH_BASE', ''),
      groupSearchFilter: this.configService.get<string>(
        'LDAP_GROUP_SEARCH_FILTER',
        '(member={{dn}})',
      ),
      groupMemberAttribute: this.configService.get<string>('LDAP_GROUP_MEMBER_ATTR', 'cn'),
      tlsEnabled: this.configService.get<boolean>('LDAP_TLS_ENABLED', false),
      tlsRejectUnauthorized: this.configService.get<boolean>('LDAP_TLS_REJECT_UNAUTHORIZED', true),
      connectionTimeout: this.configService.get<number>('LDAP_CONNECTION_TIMEOUT', 5000),
      idleTimeout: this.configService.get<number>('LDAP_IDLE_TIMEOUT', 10000),
      roleMapping: this.parseRoleMapping(this.configService.get<string>('LDAP_ROLE_MAPPING', '{}')),
    };
  }

  private parseRoleMapping(raw: string): Record<string, string> {
    try {
      return JSON.parse(raw);
    } catch {
      this.logger.warn('Failed to parse LDAP_ROLE_MAPPING, using empty mapping');
      return {};
    }
  }

  isEnabled(): boolean {
    return this.config.enabled;
  }

  getConfig(): Omit<LdapConfig, 'bindPassword'> {
    const { bindPassword, ...safe } = this.config;
    return safe;
  }

  // ── Connect to LDAP server ────────────────

  private createClient(): ldap.Client {
    const options: ldap.ClientOptions = {
      url: this.config.url,
      connectTimeout: this.config.connectionTimeout,
      idleTimeout: this.config.idleTimeout,
      tlsOptions: this.config.tlsEnabled
        ? { rejectUnauthorized: this.config.tlsRejectUnauthorized }
        : undefined,
    };

    const client = ldap.createClient(options);

    client.on('error', (err: Error) => {
      this.logger.error(`LDAP connection error: ${err.message}`);
    });

    client.on('connectTimeout', () => {
      this.logger.error('LDAP connection timeout');
    });

    return client;
  }

  private async bind(client: ldap.Client, dn: string, password: string): Promise<void> {
    return new Promise((resolve, reject) => {
      client.bind(dn, password, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  private async unbind(client: ldap.Client): Promise<void> {
    return new Promise((resolve) => {
      client.unbind((err) => {
        if (err) {
          this.logger.warn(`LDAP unbind error: ${err.message}`);
        }
        resolve();
      });
    });
  }

  // ── Authenticate user via LDAP ────────────

  async authenticate(username: string, password: string): Promise<LdapUser | null> {
    if (!this.config.enabled) {
      this.logger.debug('LDAP authentication disabled');
      return null;
    }

    const client = this.createClient();

    try {
      // Step 1: Bind with service account to search for the user
      await this.bind(client, this.config.bindDN, this.config.bindPassword);
      this.logger.debug(`Service account bound successfully`);

      // Step 2: Search for user DN
      const filter = this.config.searchFilter.replace(
        '{{username}}',
        ldap.parseDN(username).toString() || username,
      );
      const searchFilter = this.config.searchFilter.replace('{{username}}', username);

      const userEntry = await this.searchOne(client, this.config.searchBase, {
        filter: searchFilter,
        scope: 'sub',
        attributes: [
          this.config.usernameAttribute,
          this.config.emailAttribute,
          this.config.firstNameAttribute,
          this.config.lastNameAttribute,
          'dn',
          'memberOf',
        ],
      });

      if (!userEntry) {
        this.logger.warn(`LDAP user not found: ${username}`);
        return null;
      }

      // Step 3: Bind as the user to verify password
      const userDN = userEntry.dn;
      const userClient = this.createClient();

      try {
        await this.bind(userClient, userDN, password);
        this.logger.debug(`User authenticated successfully: ${username}`);
      } catch (err) {
        this.logger.warn(`LDAP authentication failed for: ${username}`);
        return null;
      } finally {
        await this.unbind(userClient);
      }

      // Step 4: Extract user attributes
      const ldapUser = this.mapEntryToUser(userEntry);

      // Step 5: Resolve groups
      if (this.config.groupSearchBase) {
        ldapUser.groups = await this.getUserGroups(client, userDN);
      }

      return ldapUser;
    } catch (err) {
      this.logger.error(`LDAP authentication error: ${(err as Error).message}`);
      return null;
    } finally {
      await this.unbind(client);
    }
  }

  // ── Search LDAP directory ─────────────────

  private async searchOne(
    client: ldap.Client,
    base: string,
    options: ldap.SearchOptions,
  ): Promise<ldap.SearchEntry | null> {
    return new Promise((resolve, reject) => {
      client.search(base, options, (err, res) => {
        if (err) return reject(err);

        let entry: ldap.SearchEntry | null = null;

        res.on('searchEntry', (e: ldap.SearchEntry) => {
          entry = e;
        });

        res.on('error', (e: Error) => reject(e));
        res.on('end', () => resolve(entry));
      });
    });
  }

  private async searchAll(
    client: ldap.Client,
    base: string,
    options: ldap.SearchOptions,
  ): Promise<ldap.SearchEntry[]> {
    return new Promise((resolve, reject) => {
      client.search(base, options, (err, res) => {
        if (err) return reject(err);

        const entries: ldap.SearchEntry[] = [];

        res.on('searchEntry', (e: ldap.SearchEntry) => {
          entries.push(e);
        });

        res.on('error', (e: Error) => reject(e));
        res.on('end', () => resolve(entries));
      });
    });
  }

  // ── Group membership ──────────────────────

  private async getUserGroups(client: ldap.Client, userDN: string): Promise<string[]> {
    try {
      const filter = this.config.groupSearchFilter.replace('{{dn}}', userDN);

      const entries = await this.searchAll(client, this.config.groupSearchBase, {
        filter,
        scope: 'sub',
        attributes: [this.config.groupMemberAttribute],
      });

      return entries.map((entry) => {
        const attr = (entry.attributes as any)?.[this.config.groupMemberAttribute];
        return String(attr || entry.dn);
      });
    } catch (err) {
      this.logger.warn(`Failed to fetch groups for ${userDN}: ${(err as Error).message}`);
      return [];
    }
  }

  // ── Map LDAP entry to user ────────────────

  private mapEntryToUser(entry: ldap.SearchEntry): LdapUser {
    const attrs: Record<string, string | string[]> = {};

    // Safely extract attributes from SearchEntry
    if (entry.attributes) {
      for (const [key, value] of Object.entries(entry.attributes)) {
        attrs[key] = Array.isArray(value) ? value.map(String) : String(value);
      }
    }

    const getAttr = (name: string): string => {
      const val = attrs[name];
      return Array.isArray(val) ? val[0] || '' : val || '';
    };

    return {
      dn: entry.dn,
      username: getAttr(this.config.usernameAttribute),
      email: getAttr(this.config.emailAttribute),
      firstName: getAttr(this.config.firstNameAttribute),
      lastName: getAttr(this.config.lastNameAttribute),
      groups: [],
      rawAttributes: attrs,
    };
  }

  // ── Map LDAP groups to HRIS roles ─────────

  mapGroupsToRoles(groups: string[]): string[] {
    const roles: string[] = [];

    for (const group of groups) {
      const groupName = group.split(',')[0]?.replace(/^CN=/i, '') || group;
      const mappedRole = this.config.roleMapping[groupName];
      if (mappedRole) {
        roles.push(mappedRole);
      }
    }

    // Default role if no mapping found
    if (roles.length === 0) {
      roles.push('employee');
    }

    return [...new Set(roles)];
  }

  // ── Sync: fetch all users from directory ──

  async syncDirectoryUsers(): Promise<LdapUser[]> {
    if (!this.config.enabled) return [];

    const client = this.createClient();

    try {
      await this.bind(client, this.config.bindDN, this.config.bindPassword);

      const entries = await this.searchAll(client, this.config.searchBase, {
        filter:
          '(&(objectClass=person)(objectClass=user)(!(userAccountControl:1.2.840.113556.1.4.803:=2)))',
        scope: 'sub',
        attributes: [
          this.config.usernameAttribute,
          this.config.emailAttribute,
          this.config.firstNameAttribute,
          this.config.lastNameAttribute,
          'dn',
          'memberOf',
          'department',
          'title',
          'telephoneNumber',
        ],
      });

      const users = entries.map((entry) => this.mapEntryToUser(entry));
      this.logger.log(`LDAP directory sync: found ${users.length} active users`);

      return users;
    } catch (err) {
      this.logger.error(`LDAP directory sync failed: ${(err as Error).message}`);
      return [];
    } finally {
      await this.unbind(client);
    }
  }

  // ── Test connection ───────────────────────

  async testConnection(): Promise<{
    success: boolean;
    message: string;
    details?: Record<string, unknown>;
  }> {
    if (!this.config.enabled) {
      return { success: false, message: 'LDAP integration is disabled' };
    }

    const client = this.createClient();

    try {
      await this.bind(client, this.config.bindDN, this.config.bindPassword);
      this.logger.log('LDAP connection test: SUCCESS');

      return {
        success: true,
        message: 'Successfully connected and authenticated to LDAP server',
        details: {
          url: this.config.url,
          searchBase: this.config.searchBase,
          tlsEnabled: this.config.tlsEnabled,
        },
      };
    } catch (err) {
      this.logger.error(`LDAP connection test failed: ${(err as Error).message}`);
      return {
        success: false,
        message: `Connection failed: ${(err as Error).message}`,
      };
    } finally {
      await this.unbind(client);
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.unbind(this.client);
    }
  }
}
