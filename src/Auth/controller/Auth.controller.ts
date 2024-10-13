import { Controller, Post, Body, UseFilters, Req, Res } from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { Request, Response } from 'express';
import { UserExceptionFilter } from '../middleware/user.middleware';

@Controller('auth')
@UseFilters(UserExceptionFilter)
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('signup')
  async signUp(@Req() req: Request, @Res() res: Response) {
    return this.authService.signUp(req, res);
  }

  @Post('signin')
  async signIn(@Req() req: Request, @Res() res: Response) {
    return this.authService.signIn(req, res);
  }

  @Post('forgot-password')
  async forgotPassword(@Req() req: Request, @Res() res: Response){
    return this.authService.forgotPassword(req, res);
  }
}
