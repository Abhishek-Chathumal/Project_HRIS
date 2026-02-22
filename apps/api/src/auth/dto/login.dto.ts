import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
    @ApiProperty({ example: 'john.doe@company.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'P@ssw0rd!2026' })
    @IsString()
    @MinLength(1)
    password: string;
}
