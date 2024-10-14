import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
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
  // Logger instance for logging messages related to TaskService
  private readonly logger = new Logger(TaskService.name);

  // Injecting the Task and User models using Mongoose
  constructor(
    @InjectModel('Task') private TaskModel: Model<TaskDocument>,
    @InjectModel('User') private UserModel: Model<AuthDocument>,
  ) { }

  /**
   * Retrieves a list of tasks for a given user ID, with validation and error handling.
   * Tasks can either be user-specific or public tasks, and the profile data is merged.
   */
  async getTask(req: Request, res: Response): Promise<Response> {
    const { id, taskId } = req.params;

    // Check if the provided ID is a valid MongoDB ObjectId
    if (!isValidObjectId(id) && !isValidObjectId(taskId)) {
      this.logger.warn(`Invalid User ID : ${id} or task ID format: ${taskId}`);
      return res.status(400).json({
        status: 'error',
        message: 'Invalid task ID or User ID format',
      });
    }

    try {
      // Aggregate task data with profile lookup for enhanced details
      const taskList = await this.TaskModel.aggregate([
        {
          $match: {
            $or: [
              { UserId: new Types.ObjectId(id), isActive: true },
              { ShareType: ShareEnum.Public, isActive: true },
            ],
          },
        },
        {
          $lookup: {
            from: 'profiles',
            localField: 'UserId',
            foreignField: 'userId',
            as: 'profilesData',
          },
        },
        {
          $unwind: {
            path: '$profiles',
            includeArrayIndex: 'string',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $addFields: {
            profile: { $arrayElemAt: ['$profilesData', 0] },
          },
        },
        {
          $project: {
            profilesData: 0,
            'profile._id': 0,
            'profile.userId': 0,
            __v: 0,
            string: 0,
          },
        },
      ]);

      return res.status(200).json({
        status: 'success',
        data: taskList,
      });
    } catch (error) {
      // Log the error and return a 500 Internal Server Error response
      this.logger.error(`Error fetching tasks for user ID: ${id}`, error.stack);
      return res.status(500).json({
        status: 'error',
        message:
          'An error occurred while fetching tasks. Please try again later.',
      });
    }
  }

  async getSearchTask(req: Request, res: Response): Promise<Response> {
    const { searchText } = req.query;
    const { id } = req.params;

    // Check if the search text is provided and valid
    if (!searchText) {
      return res.status(400).json({
        status: 'error',
        message: 'Search text cannot be empty',
      });
    }

    try {
      // Find tasks by search text with case-insensitive regex and populate profile data
      const taskList = await this.TaskModel.aggregate(
        [
          {
            $match: {
              taskName: { $regex: searchText, $options: 'i' }, // Case-insensitive search
              $or: [
                { isActive: true },
                { UserId: new Types.ObjectId(id) },
              ],
            },
          },
          {
            $lookup: {
              from: 'profiles',
              localField: 'UserId',
              foreignField: 'userId',
              as: 'userDetail',
            }
          },
          {
            $unwind: '$userDetail'
          },
          {
            $project: {
              taskName: 1,
              TaskDescription: 1,
              Priority: 1,
              ShareType: 1,
              'userDetail.firstName': 1,
              'userDetail.lastName': 1,
              'userDetail.occupation': 1,
            }
          }
        ]
      )

      // If no tasks are found, return a success message with no data
      if (!taskList || taskList.length === 0) {
        return res.status(200).json({
          status: 'success',
          message: `No tasks found for the search term: ${searchText}`,
        });
      }

      // Return the found tasks
      return res.status(200).json({
        status: 'success',
        data: taskList,
      });
    } catch (error) {
      // Log the error and return a 500 Internal Server Error response
      this.logger.error(`Error fetching tasks for search text: ${searchText}`, error);
      return res.status(500).json({
        status: 'error',
        message: 'An error occurred while fetching tasks. Please try again later.',
      });
    }
  }

  /**
   * Retrieves a single task by its ID with error handling.
   */
  async getSingleTask(req: Request, res: Response): Promise<Response> {
    const { id, taskId } = req.params;

    // Check if the provided ID is a valid MongoDB ObjectId
    if (!isValidObjectId(id) && !isValidObjectId(taskId)) {
      this.logger.warn(`Invalid User ID : ${id} or task ID format: ${taskId}`);
      return res.status(400).json({
        status: 'error',
        message: 'Invalid task ID or User ID format',
      });
    }

    try {
      const singleTask = await this.TaskModel.findOne({
        _id: new Types.ObjectId(taskId),
        UserId: new Types.ObjectId(id),
        isActive: true,
      });

      if (!singleTask) {
        return res.status(404).json({
          status: 'success',
          message: 'Task not found',
        });
      }

      return res.status(200).json({
        status: 'success',
        data: singleTask,
      });
    } catch (error) {
      // Catch unexpected errors and log them
      this.logger.error(`Error fetching task for ID: ${id}`, error.stack);
      return res.status(500).json({
        status: 'error',
        message:
          'An error occurred while fetching the task. Please try again later.',
      });
    }
  }

  /**
   * Creates a new task with validation and error handling.
   */
  async createTask(req: Request, res: Response): Promise<Response> {
    const body = req.body;
    const { id } = req.params;

    // Transform and validate the request body into TaskDto
    const createTaskDto = plainToInstance(TaskDto, body);
    const errors = await validate(createTaskDto);

    if (errors.length > 0) {
      // Return validation errors if any
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
      // Create a new task with the provided data
      const createTask = new this.TaskModel({
        taskName: body.taskName,
        TaskDescription: body.TaskDescription,
        UserId: new Types.ObjectId(id),
        ShareType: body.ShareType,
        Priority: body.Priority,
      });
      await createTask.save();

      return res.status(200).json({
        status: 'success',
        message: 'Task created successfully',
        data: {
          taskName: createTask.taskName,
          TaskDescription: createTask.TaskDescription,
          ShareType: createTask.ShareType || ShareEnum.Private,
          Priority: createTask.Priority,
        },
      });
    } catch (error) {
      // Log the error and return a 500 Internal Server Error response
      this.logger.error('Error creating task', { error });
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error, please try again later.',
      });
    }
  }

  /**
   * Updates a task with provided fields, including validation and error handling.
   */
  async updateTask(req: Request, res: Response): Promise<Response> {
    const body = req.body;
    const { id, taskId } = req.params;

    // Validate the request body
    const createTaskDto = plainToInstance(TaskDto, body);
    const errors = await validate(createTaskDto);

    if (errors.length > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.map((err) => ({
          property: err.property,
          constraints: err.constraints,
        })),
      });
    }

    // Check if the provided ID is a valid MongoDB ObjectId
    if (!isValidObjectId(id) && !isValidObjectId(taskId)) {
      this.logger.warn(`Invalid User ID : ${id} or task ID format: ${taskId}`);
      return res.status(400).json({
        status: 'error',
        message: 'Invalid task ID or User ID format',
      });
    }

    try {
      // Prepare update fields
      const updateFields: Partial<TaskDocument> = {};
      if (body.taskName) updateFields.taskName = body.taskName;
      if (body.TaskDescription)
        updateFields.TaskDescription = body.TaskDescription;
      if (body.ShareType) updateFields.ShareType = body.ShareType;
      if (body.Priority) updateFields.Priority = body.Priority;

      // Update task by ID
      const updateTask = await this.TaskModel.findOneAndUpdate(
        { _id: new Types.ObjectId(taskId), UserId: new Types.ObjectId(id) },
        { $set: updateFields },
        { new: true },
      );

      if (!updateTask) {
        return res.status(404).json({
          status: 'success',
          message: 'Task not found',
        });
      }

      return res.status(200).json({
        status: 'success',
        message: 'Task updated successfully',
        data: {
          taskName: updateTask?.taskName,
          TaskDescription: updateTask?.TaskDescription,
          ShareType: updateTask?.ShareType,
          Priority: updateTask?.Priority,
        },
      });
    } catch (error) {
      // Log the error and return a 500 Internal Server Error response
      this.logger.error('Error updating task', { error });
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error, please try again later.',
      });
    }
  }

  /**
   * Moves a task to the bin (soft delete) by marking it inactive.
   */
  async moveToBinTask(req: Request, res: Response): Promise<Response> {
    const { id, taskId } = req.params;

    // Validate if `id` is a valid MongoDB ObjectId
    if (!isValidObjectId(id)) {
      this.logger.warn(`Invalid task ID format: ${id}`);
      return res.status(400).json({
        status: 'error',
        message: 'Invalid task ID format',
      });
    }

    try {
      // Update the task to mark it as inactive (soft delete)
      const deleteTask = await this.TaskModel.findOneAndUpdate(
        {
          _id: new Types.ObjectId(taskId),
          UserId: new Types.ObjectId(id),
          isActive: true,
        },
        { isActive: false },
        { new: true },
      );

      if (!deleteTask) {
        return res.status(404).json({
          status: 'success',
          message: 'Task not found',
        });
      }

      return res.status(200).json({
        status: 'success',
        message: 'Task moved to bin successfully',
        data: {
          taskName: deleteTask?.taskName,
          TaskDescription: deleteTask?.TaskDescription,
          ShareType: deleteTask?.ShareType,
          Priority: deleteTask?.Priority,
          taskStatus: deleteTask?.isActive,
        },
      });
    } catch (error) {
      // Log any unexpected errors and return a 500 Internal Server Error response
      this.logger.error(`Error moving task to bin for ID: ${id}`, error.stack);
      return res.status(500).json({
        status: 'error',
        message:
          'An error occurred while moving the task to the bin. Please try again later.',
      });
    }
  }

  /**
   * Reverts a soft-deleted task by marking it active again.
   */
  async undoTask(req: Request, res: Response): Promise<Response> {
    const { id, taskId } = req.params;

    // Validate if `id` is a valid MongoDB ObjectId
    if (!isValidObjectId(id)) {
      this.logger.warn(`Invalid task ID format: ${id}`);
      return res.status(400).json({
        status: 'error',
        message: 'Invalid task ID format',
      });
    }

    try {
      const undoTask = await this.TaskModel.findOneAndUpdate(
        { _id: new Types.ObjectId(taskId), UserId: new Types.ObjectId(id) },
        { isActive: true },
        { new: true },
      );

      if (!undoTask) {
        return res.status(404).json({
          status: 'success',
          message: 'Task not found',
        });
      }

      return res.status(200).json({
        status: 'success',
        message: 'Record undo successfully',
      });
    } catch (error) {
      // Log unexpected errors and return a 500 Internal Server Error response
      this.logger.error(`Error undoing task for ID: ${id}`, error.stack);
      return res.status(500).json({
        status: 'error',
        message:
          'An error occurred while undoing the task. Please try again later.',
      });
    }
  }

  async getBinTask(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;

    // Validate if `id` is a valid MongoDB ObjectId
    if (!isValidObjectId(id)) {
      this.logger.warn(`Invalid task ID format: ${id}`);
      return res.status(400).json({
        status: 'error',
        message: 'Invalid task ID format',
      });
    }

    try {
      const getDeleteTaskList = await this.TaskModel.find;
    } catch (error) {
      // Log unexpected errors and return a 500 Internal Server Error response
      this.logger.error(`Error undoing task for ID: ${id}`, error.stack);
      return res.status(500).json({
        status: 'error',
        message:
          'An error occurred while undoing the task. Please try again later.',
      });
    }
  }
}
