import {
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}
  async signup(dto: AuthDto) {
    try {
      // hashing password
      const hash = await argon.hash(dto.password);
      // saved new user into db
      const newUser =
        await this.prismaService.user.create({
          data: {
            email: dto.email,
            hash,
          },
        });

      return this.signToken(
        newUser.id,
        newUser.email,
      );
    } catch (error) {
      if (
        error instanceof
        PrismaClientKnownRequestError
      ) {
        if (error.code === 'P2002')
          throw new ForbiddenException(
            'Credential Taken',
          );
      }
    }
  }
  async signin(dto: AuthDto) {
    // find user by email
    const user =
      await this.prismaService.user.findUnique({
        where: {
          email: dto.email,
        },
      });
    // if user does not exist throw exception
    if (!user) {
      throw new ForbiddenException(
        'User Not Found',
      );
    }

    // compare password
    const pwMatches = await argon.verify(
      user.hash,
      dto.password,
    );
    // if password incorrect throw exception
    if (!pwMatches) {
      throw new ForbiddenException(
        'Password not match',
      );
    }
    return this.signToken(user.id, user.email);
  }
  async signToken(
    userId: number,
    email: string,
  ): Promise<{ accessToken: string }> {
    const payload = {
      sub: userId,
      email,
    };
    const secret = await this.configService.get('JWT_SECRET');
    const token = await this.jwtService.signAsync(
      payload,
      {
        expiresIn: '15m',
        secret: secret,
      },
    );
    return {
      accessToken: token,
    };
  }
}
