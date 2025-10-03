import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable({})
export class AuthService {
  constructor(private prismaService: PrismaService) {}
  login() {
    return {
      message: 'hello sign up',
    };
  }
  signup() {
    return {
      message: 'hellp sign in',
    };
  }
}
