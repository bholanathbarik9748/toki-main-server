import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { JwtAuthGuard } from 'src/Auth/strategy/jwt-auth.guard';
import { ProfileService } from '../services/Profile.service';


@Controller('profile')
export class ProfileController {
    constructor(private readonly ProfileService: ProfileService) { }

    // Protect this route using JWT Auth Guard (you can remove this if not using JWT)
    @UseGuards(JwtAuthGuard)
    @Get('/:id')
    getProfile(@Req() req: Request, @Res() res: Response) {
        // In a real application, this could be fetched from the database
        return this.ProfileService.getProfile(req, res);
    }
}
