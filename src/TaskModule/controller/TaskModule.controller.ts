import { Controller, Delete, Get, Patch, Post, Put, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { JwtAuthGuard } from 'src/Auth/strategy/jwt-auth.guard';
import { TaskService } from '../services/TaskModule.service';


@Controller('task')
@UseGuards(JwtAuthGuard)
export class TaskController {
    constructor(private readonly TaskService: TaskService) { }

    @Get('/:id')
    getTask(@Req() req: Request, @Res() res: Response) {
        return this.TaskService.getTask(req, res);
    }

    @Get('/single/:id')
    getSingleTask(@Req() req: Request, @Res() res: Response) {
        return this.TaskService.getSingleTask(req, res);
    }

    @Post('/:id')
    createTask(@Req() req: Request, @Res() res: Response) {
        return this.TaskService.createTask(req, res);
    }

    @Patch('/:id')
    updateTask(@Req() req: Request, @Res() res: Response) {
        return this.TaskService.updateTask(req, res);
    }

    @Delete('/:id')
    deleteTask(@Req() req: Request, @Res() res: Response) {
        return this.TaskService.moveToBinTask(req, res);
    }

    @Put('/:id')
    undoTask(@Req() req: Request, @Res() res: Response) {
        return this.TaskService.undoTask(req, res);
    }
}
