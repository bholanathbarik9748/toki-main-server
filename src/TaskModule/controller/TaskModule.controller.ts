import { Controller, Delete, Get, Patch, Post, Put, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { JwtAuthGuard } from 'src/Auth/strategy/jwt-auth.guard';
import { TaskService } from '../services/TaskModule.service';


@Controller('user/:id/task')
@UseGuards(JwtAuthGuard)
export class TaskController {
    constructor(private readonly TaskService: TaskService) { }

    @Get('')
    getTask(@Req() req: Request, @Res() res: Response) {
        return this.TaskService.getTask(req, res);
    }

    @Post('')
    createTask(@Req() req: Request, @Res() res: Response) {
        return this.TaskService.createTask(req, res);
    }

    @Get('/:taskId')
    getSingleTask(@Req() req: Request, @Res() res: Response) {
        return this.TaskService.getSingleTask(req, res);
    }

    @Patch('/:taskId')
    updateTask(@Req() req: Request, @Res() res: Response) {
        return this.TaskService.updateTask(req, res);
    }

    @Delete('/:taskId/delete')
    deleteTask(@Req() req: Request, @Res() res: Response) {
        return this.TaskService.moveToBinTask(req, res);
    }

    @Put(':taskId/revert')
    undoTask(@Req() req: Request, @Res() res: Response) {
        return this.TaskService.undoTask(req, res);
    }
}
