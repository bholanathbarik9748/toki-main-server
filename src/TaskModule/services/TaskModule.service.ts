import { Injectable, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { ShareEnum, TaskDocument } from '../schema/TaskModule.schema';
import { isValidObjectId, Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { TaskDto } from '../validation/TaskModule.dto';
import { AuthDocument } from 'src/Auth/schema/user.schema';

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);

  constructor(
    @InjectModel('Task') private TaskModel: Model<TaskDocument>,
    @InjectModel('User') private UserModel: Model<AuthDocument>,
  ) { }

  // Get profile by ID with improved error handling and validation
  async getTask(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;

    // Validate if `id` is a valid MongoDB ObjectId
    if (!isValidObjectId(id)) {
      this.logger.warn(`Invalid profile ID format: ${id}`);
      return res.status(400).json({
        status: 'error',
        message: 'Invalid profile ID format',
      });
    }

    try {
      const taskList = await this.TaskModel.aggregate(
        [
          {
            $match: {
              $or: [
                { UserId: new Types.ObjectId(id), isActive: true },
                { ShareType: ShareEnum.Public, isActive: true },
              ]
            }
          },
          {
            $lookup: {
              from: 'profiles',
              localField: 'UserId',
              foreignField: 'userId',
              as: 'profilesData',
            }
          },
          {
            $unwind: {
              path: '$profiles',
              includeArrayIndex: 'string',
              preserveNullAndEmptyArrays: true
            }
          },
          {
            $addFields: {
              profile: { $arrayElemAt: ['$profilesData', 0] }
            }
          },
          {
            $project: {
              profilesData: 0,
              'profile._id': 0,
              'profile.userId': 0,
              __v: 0,
              string: 0,
            }
          }
        ]
      );

      return res.status(200).json({
        status: 'success',
        data: taskList,
      })
    } catch (error) {
      // Catch any unexpected errors and log them
      this.logger.error(`Error fetching profile for ID: ${id}`, error.stack);
      return res.status(500).json({
        status: 'error',
        message: 'An error occurred while fetching the profile. Please try again later.',
      });
    }
  }

  async getSingleTask(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;

    // Validate if `id` is a valid MongoDB ObjectId
    if (!isValidObjectId(id)) {
      this.logger.warn(`Invalid profile ID format: ${id}`);
      return res.status(400).json({
        status: 'error',
        message: 'Invalid profile ID format',
      });
    }

    try {
      const singleTask = await this.TaskModel.findOne({ _id: new Types.ObjectId(id), isActive: true });
      return res.status(200).json({
        status: 'success',
        data: singleTask,
      });
    } catch (error) {
      // Catch any unexpected errors and log them
      this.logger.error(`Error fetching Task for ID: ${id}`, error.stack);
      return res.status(500).json({
        status: 'error',
        message: 'An error occurred while fetching the profile. Please try again later.',
      });
    }
  }

  async createTask(req: Request, res: Response): Promise<Response> {
    const body = req.body;
    const { id } = req.params

    // Transform body into an instance of AuthDto and validate it
    const createAuthDto = plainToInstance(TaskDto, body);
    const errors = await validate(createAuthDto);

    if (errors.length > 0) {
      // If validation errors exist, return them
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.map((err) => ({
          property: err.property,
          constraints: err.constraints,
        })),
      });
    }

    try {
      const createTask = new this.TaskModel({
        taskName: body.taskName,
        TaskDescription: body.TaskDescription,
        UserId: new Types.ObjectId(id),
        ShareType: body.ShareType,
        Priority: body.Priority,
      })
      createTask.save();

      return res.status(200).json({
        status: 'success',
        message: "Record create successfully",
        data: {
          taskName: createTask.taskName,
          TaskDescription: createTask.TaskDescription,
          ShareType: createTask.ShareType || ShareEnum.Private,
          Priority: createTask.Priority,
        }
      })
    } catch (error) {
      this.logger.error('Error creating user', { error });
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error, please try again later.',
      });
    }
  }

  async updateTask(req: Request, res: Response): Promise<Response> {
    const body = req.body;
    const { id } = req.params

    // Transform body into an instance of AuthDto and validate it
    const createTaskDto = plainToInstance(TaskDto, body);
    const errors = await validate(createTaskDto);

    if (errors.length > 0) {
      // If validation errors exist, return them
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.map((err) => ({
          property: err.property,
          constraints: err.constraints,
        })),
      });
    }

    try {
      const updateFields: Partial<TaskDocument> = {};
      if (body.taskName) updateFields.taskName = body.taskName;
      if (body.TaskDescription) updateFields.TaskDescription = body.TaskDescription;
      if (body.ShareType) updateFields.ShareType = body.ShareType;
      if (body.Priority) updateFields.Priority = body.Priority;

      const updateTask = await this.TaskModel.findByIdAndUpdate(
        id,
        { $set: updateFields },
        { new: true }
      );

      if (!updateTask) {
        return res.status(404).json({
          status: 'success',
          message: 'Task not found',
        });
      }

      return res.status(200).json({
        status: "success",
        message: "Record Update successfully",
        data: {
          taskName: updateTask?.taskName,
          TaskDescription: updateTask?.TaskDescription,
          ShareType: updateTask?.ShareType,
          Priority: updateTask?.Priority,
        }
      })
    } catch (error) {
      this.logger.error('Error creating user', { error });
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error, please try again later.',
      });
    }
  }

  async moveToBinTask(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;

    // Validate if `id` is a valid MongoDB ObjectId
    if (!isValidObjectId(id)) {
      this.logger.warn(`Invalid profile ID format: ${id}`);
      return res.status(400).json({
        status: 'error',
        message: 'Invalid profile ID format',
      });
    }

    try {
      const deleteTask = await this.TaskModel.findOneAndUpdate(
        { _id: new Types.ObjectId(id), isActive: true },
        { isActive: false },
        { new: true }
      )

      if (!deleteTask) {
        return res.status(404).json({
          status: 'success',
          message: 'Task not found',
        });
      }

      return res.status(400).json({
        status: 'success',
        message: 'Record Delete Successfully',
        data: {
          taskName: deleteTask?.taskName,
          TaskDescription: deleteTask?.TaskDescription,
          ShareType: deleteTask?.ShareType,
          Priority: deleteTask?.Priority,
          taskStatus: deleteTask?.isActive,
        }
      });
    } catch (error) {
      // Catch any unexpected errors and log them
      this.logger.error(`Error fetching profile for ID: ${id}`, error.stack);
      return res.status(500).json({
        status: 'error',
        message: 'An error occurred while fetching the profile. Please try again later.',
      });
    }
  }

  async undoTask(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;

    // Validate if `id` is a valid MongoDB ObjectId
    if (!isValidObjectId(id)) {
      this.logger.warn(`Invalid profile ID format: ${id}`);
      return res.status(400).json({
        status: 'error',
        message: 'Invalid profile ID format',
      });
    }

    try {

    } catch (error) {
      // Catch any unexpected errors and log them
      this.logger.error(`Error fetching profile for ID: ${id}`, error.stack);
      return res.status(500).json({
        status: 'error',
        message: 'An error occurred while fetching the profile. Please try again later.',
      });
    }
  }
}
