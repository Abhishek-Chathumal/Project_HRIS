import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../common/prisma/prisma.service';
import { RedisService } from '../common/redis/redis.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

export interface TokenPayload {
  sub: string;
  email: string;
  roles: string[];
  iat?: number;
  exp?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly SALT_ROUNDS = 12;
  private readonly MAX_FAILED_ATTEMPTS = 5;
  private readonly LOCK_DURATION_MINUTES = 30;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {}

  /**
   * Register a new user
   */
  async register(dto: RegisterDto): Promise<{ user: { id: string; email: string } }> {
    // Check for existing user
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(dto.password, this.SALT_ROUNDS);

    // Create user with default role
    const user = await this.prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: dto.email.toLowerCase(),
          passwordHash,
        },
      });

      // Assign default employee role
      const employeeRole = await tx.role.findUnique({
        where: { name: 'employee' },
      });

      if (employeeRole) {
        await tx.userRole.create({
          data: {
            userId: newUser.id,
            roleId: employeeRole.id,
          },
        });
      }

      return newUser;
    });

    this.logger.log(`New user registered: ${user.email}`);

    return {
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }

  /**
   * Validate user credentials and return tokens
   */
  async login(dto: LoginDto, ipAddress?: string, userAgent?: string): Promise<AuthTokens> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      include: {
        userRoles: {
          include: { role: true },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check if account is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const remainingMinutes = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
      throw new ForbiddenException(
        `Account is locked. Please try again in ${remainingMinutes} minutes`,
      );
    }

    // Check if account is active
    if (!user.isActive) {
      throw new ForbiddenException('Account has been deactivated');
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!isPasswordValid) {
      // Increment failed attempts
      const failedAttempts = user.failedAttempts + 1;
      const updateData: Record<string, unknown> = { failedAttempts };

      if (failedAttempts >= this.MAX_FAILED_ATTEMPTS) {
        updateData.lockedUntil = new Date(Date.now() + this.LOCK_DURATION_MINUTES * 60 * 1000);
        this.logger.warn(`Account locked due to ${failedAttempts} failed attempts: ${user.email}`);
      }

      await this.prisma.user.update({
        where: { id: user.id },
        data: updateData,
      });

      throw new UnauthorizedException('Invalid email or password');
    }

    // Reset failed attempts on successful login
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        failedAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
        lastLoginIp: ipAddress || null,
      },
    });

    // Generate tokens
    const roles = user.userRoles.map((ur) => ur.role.name);
    const tokens = await this.generateTokens(user.id, user.email, roles);

    // Store session
    await this.prisma.session.create({
      data: {
        userId: user.id,
        refreshToken: tokens.refreshToken,
        userAgent: userAgent || null,
        ipAddress: ipAddress || null,
        expiresAt: new Date(
          Date.now() + this.parseExpiry(this.configService.get('JWT_REFRESH_EXPIRY', '7d')),
        ),
      },
    });

    this.logger.log(`User logged in: ${user.email}`);

    return tokens;
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    const session = await this.prisma.session.findFirst({
      where: {
        refreshToken,
        expiresAt: { gt: new Date() },
      },
      include: {
        user: {
          include: {
            userRoles: { include: { role: true } },
          },
        },
      },
    });

    if (!session) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Rotate refresh token
    const roles = session.user.userRoles.map((ur: any) => ur.role.name);
    const tokens = await this.generateTokens(session.user.id, session.user.email, roles);

    // Update session with new refresh token
    await this.prisma.session.update({
      where: { id: session.id },
      data: {
        refreshToken: tokens.refreshToken,
        expiresAt: new Date(
          Date.now() + this.parseExpiry(this.configService.get('JWT_REFRESH_EXPIRY', '7d')),
        ),
      },
    });

    return tokens;
  }

  /**
   * Logout — invalidate session
   */
  async logout(userId: string, refreshToken?: string): Promise<void> {
    if (refreshToken) {
      await this.prisma.session.deleteMany({
        where: { userId, refreshToken },
      });
    } else {
      // Logout from all sessions
      await this.prisma.session.deleteMany({
        where: { userId },
      });
    }

    // Blacklist current access token
    await this.redisService.set(
      `blacklist:${userId}:${Date.now()}`,
      'true',
      900, // 15 minutes (access token expiry)
    );

    this.logger.log(`User logged out: ${userId}`);
  }

  /**
   * Validate JWT payload
   */
  async validateUser(
    payload: TokenPayload,
  ): Promise<{ id: string; email: string; roles: string[] }> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: {
        userRoles: { include: { role: true } },
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or deactivated');
    }

    return {
      id: user.id,
      email: user.email,
      roles: user.userRoles.map((ur: any) => ur.role.name),
    };
  }

  // ── Private Helpers ───────────────────────

  private async generateTokens(
    userId: string,
    email: string,
    roles: string[],
  ): Promise<AuthTokens> {
    const payload: TokenPayload = { sub: userId, email, roles };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.generateRefreshToken(),
    ]);

    return {
      accessToken,
      refreshToken,
      expiresIn: this.parseExpiry(this.configService.get('JWT_ACCESS_EXPIRY', '15m')) / 1000,
    };
  }

  private async generateRefreshToken(): Promise<string> {
    return uuidv4() + '-' + uuidv4();
  }

  private parseExpiry(expiry: string): number {
    const unit = expiry.slice(-1);
    const value = parseInt(expiry.slice(0, -1), 10);

    switch (unit) {
      case 's':
        return value * 1000;
      case 'm':
        return value * 60 * 1000;
      case 'h':
        return value * 60 * 60 * 1000;
      case 'd':
        return value * 24 * 60 * 60 * 1000;
      default:
        return 15 * 60 * 1000; // Default 15 minutes
    }
  }
}
