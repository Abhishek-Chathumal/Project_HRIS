import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LdapService } from './ldap.service';
import { LdapController } from './ldap.controller';

@Module({
    imports: [ConfigModule],
    controllers: [LdapController],
    providers: [LdapService],
    exports: [LdapService],
})
export class LdapModule { }
