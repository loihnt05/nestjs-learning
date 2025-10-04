import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
  ) {}
  async signup(dto: AuthDto) {
    // hashing password
    const hash = await argon.hash(dto.password);
    // saved new user into db
    const newUser =
      await this.prismaService.user.create({
        data: {
          email: dto.email,
          hash,
        },
        select: {
          id: true,
          email: true,
          createdAt: true,
        },
      });
    // return the saved user
    return newUser;
  }
  signin() {
    return {
      message: 'hello sign in',
    };
  }
}
