import { Controller, Delete, Get, Patch, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { JwtAuthGuard } from 'src/Auth/strategy/jwt-auth.guard';
import { TaskService } from '../services/TaskModule.service';


@Controller('profile')
@UseGuards(JwtAuthGuard)
export class TaskController {
    constructor(private readonly TaskService: TaskService) { }

    @Get('/:id')
    getProfile(@Req() req: Request, @Res() res: Response) {
        return this.TaskService.getTask(req, res);
    }

    @Post('/:id')
    createProfile(@Req() req: Request, @Res() res: Response) {
        return this.TaskService.createTask(req, res);
    }

    @Patch('/:id')
    updateProfile(@Req() req: Request, @Res() res: Response) {
        return this.TaskService.updateTask(req, res);
    }

    @Delete('/:id')
    deleteProfile(@Req() req: Request, @Res() res: Response) {
        return this.TaskService.deleteTask(req, res);
    }
}
