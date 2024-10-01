import { Controller, Delete, Get, Patch, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { JwtAuthGuard } from 'src/Auth/strategy/jwt-auth.guard';
import { ProfileService } from '../services/Profile.service';


@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
    constructor(private readonly ProfileService: ProfileService) { }

    @Get('/:id')
    getProfile(@Req() req: Request, @Res() res: Response) {
        // In a real application, this could be fetched from the database
        return this.ProfileService.getProfile(req, res);
    }

    @Post('/:id')
    createProfile(@Req() req: Request, @Res() res: Response) {
        return this.ProfileService.createProfile(req, res);
    }

    @Patch('/:id')
    updateProfile(@Req() req: Request, @Res() res: Response) {
        return this.ProfileService.updateProfile(req, res);
    }

    @Delete('/:id')
    deleteProfile(@Req() req: Request, @Res() res: Response) {
        return this.ProfileService.deleteProfile(req, res);
    }
}
