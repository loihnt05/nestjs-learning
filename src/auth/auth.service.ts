import { Injectable } from '@nestjs/common';

@Injectable({})
export class AuthService {
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
