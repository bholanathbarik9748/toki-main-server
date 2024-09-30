import { Injectable, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { ProfileDocument } from '../schema/Profile.schema';
import { isValidObjectId, Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ProfileDto } from '../validation/Profile.dto';
import { AuthDocument } from 'src/Auth/schema/user.schema';

@Injectable()
export class ProfileService {
  private readonly logger = new Logger(ProfileService.name);

  constructor(
    @InjectModel('Profile') private ProfileModel: Model<ProfileDocument>,
    @InjectModel('User') private UserModel: Model<AuthDocument>,
  ) { }

  // Get profile by ID with improved error handling and validation
  async getProfile(req: Request, res: Response): Promise<Response> {
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
      // Query the database for the profile
      const profileDetails = await this.UserModel.findById({ id });

      // If profile not found, return 404
      if (!profileDetails) {
        this.logger.warn(`Profile not found for ID: ${id}`);
        return res.status(404).json({
          status: 'error',
          message: 'Profile not found',
        });
      }

      // If profile is found, return success response
      return res.status(200).json({
        status: 'success',
        data: profileDetails,
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
}
