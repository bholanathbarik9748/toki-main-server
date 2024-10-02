import { Controller, Delete, Get, Patch, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { JwtAuthGuard } from 'src/Auth/strategy/jwt-auth.guard';
import { MailValidationService } from '../services/MailValidation.service';


@Controller('validation')
export class ValidationController {
    constructor(private readonly MailValidationService: MailValidationService) { }

    @Post('/:id')
    createValidationCode(@Req() req: Request, @Res() res: Response) {
        return this.MailValidationService.sendValidationCode(req, res)
    }

}
