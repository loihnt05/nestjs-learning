import {
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from 'generated/prisma/runtime/library';
@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
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

      const { hash: _, ...safeUser } = newUser;
      // return the saved user
      return safeUser;
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

      // send back the user
      const { hash: _, ...safeUser } = user;
      return safeUser;
  }
}
