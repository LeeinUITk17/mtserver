import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import dayjs = require('dayjs');

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async signup(data: { username: string; email: string; password: string }) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new UnauthorizedException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await this.prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        password: hashedPassword,
      },
    });

    return this.generateTokens(user.id);
  }

  async login(data: { email: string; password: string }) {
    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user || !(await bcrypt.compare(data.password, user.password))) {
      throw new UnauthorizedException('Invalid login credentials');
    }

    return this.generateTokens(user.id);
  }

  async generateTokens(userId: string) {
    const accessToken = this.jwtService.sign(
      { sub: userId },
      { expiresIn: '15m' },
    );

    const refreshToken = this.jwtService.sign(
      { sub: userId },
      { expiresIn: '7d' },
    );

    await this.prisma.token.create({
      data: {
        refreshToken,
        userId,
        expiresAt: dayjs().add(7, 'day').toDate(),
      },
    });
    return { accessToken, refreshToken };
  }

  async refreshToken(refreshToken: string) {
    const token = await this.prisma.token.findUnique({
      where: { refreshToken },
    });

    if (!token || dayjs(token.expiresAt).isBefore(dayjs())) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    return this.generateTokens(token.userId);
  }

  async logout(refreshToken: string) {
    const token = await this.prisma.token.findUnique({
      where: { refreshToken: refreshToken },
    });

    console.log('Logging out with refreshToken:', refreshToken);
    console.log('Token found in DB:', token);

    if (!token) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    await this.prisma.token.delete({
      where: { refreshToken: refreshToken },
    });

    return { message: 'Logout successful' };
  }
}
