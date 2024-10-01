import { Controller, Get, Patch, Post, Req, Res, UseGuards } from '@nestjs/common';
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

    @UseGuards(JwtAuthGuard)
    @Post('/:id')
    createProfile(@Req() req: Request, @Res() res: Response) {
        return this.ProfileService.createProfile(req, res);
    }

    @UseGuards(JwtAuthGuard)
    @Patch('/:id')
    updateProfile(@Req() req: Request, @Res() res: Response) {
        return this.ProfileService.updateProfile(req, res);
    }
}
