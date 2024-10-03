import { Injectable, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { ProfileDocument } from '../schema/Profile.schema';
import { isValidObjectId, Model, Types } from 'mongoose';
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
      const profileDetails = await this.ProfileModel.findOne({ userId: new Types.ObjectId(id) });

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
        data: {
          firstName: profileDetails?.firstName,
          lastName: profileDetails?.lastName,
          occupation: profileDetails?.occupation,
          address: profileDetails?.address,
          phoneNumber: profileDetails?.phoneNumber,
        },
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

  async createProfile(req: Request, res: Response): Promise<Response> {
    const body = req.body;
    const { id } = req.params

    // Transform body into an instance of AuthDto and validate it
    const createAuthDto = plainToInstance(ProfileDto, body);
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

    // Check if a profile for this user already exists
    const isProfileAlreadySet = await this.ProfileModel.findOne({ userId: new Types.ObjectId(id) });
    if (isProfileAlreadySet) { // If profile already exists
      return res.status(400).json({
        status: "error",
        message: "Profile already created, please update existing record",
      });
    }

    try {
      const newProfile = new this.ProfileModel({
        firstName: body?.firstName,
        lastName: body?.lastName,
        userId: new Types.ObjectId(id),
        occupation: body?.occupation,
        phoneNumber: body?.phoneNumber,
        address: body?.address || "",
      })
      await newProfile.save();

      res.status(200).json({
        status: "success",
        message: "Profile Save successfully",
      })
    } catch (error) {
      this.logger.error('Error creating user', { error });
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error, please try again later.',
      });
    }
  }

  async updateProfile(req: Request, res: Response): Promise<Response> {
    const body = req.body;
    const { id } = req.params

    // Transform body into an instance of AuthDto and validate it
    const createAuthDto = plainToInstance(ProfileDto, body);
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
      const updateFields: Partial<ProfileDocument> = {};
      if (body.firstName) updateFields.firstName = body.firstName;
      if (body.lastName) updateFields.lastName = body.lastName;
      if (body.occupation) updateFields.occupation = body.occupation;
      if (body.address) updateFields.address = body.address;
      if (body.phoneNumber) updateFields.phoneNumber = body.phoneNumber;

      const updateRecord = await this.ProfileModel.findOneAndUpdate(
        { userId: new Types.ObjectId(id) },
        {
          $set: updateFields
        },
        { new: true }
      )

      return res.status(200).json({
        status: 'success',
        data: {
          firstName: updateRecord?.firstName,
          lastName: updateRecord?.lastName,
          occupation: updateRecord?.occupation,
          address: updateRecord?.address,
          phoneNumber: updateRecord?.phoneNumber,
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

  async deleteProfile(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;

    // Validate if `id` is a valid MongoDB ObjectId
    if (!isValidObjectId(id)) {
      this.logger.warn(`Invalid profile ID format: ${id}`);
      return res.status(400).json({
        status: 'error',
        message: 'Invalid profile ID format',
      });
    }

    const isUserActive = await this.UserModel.findOne({ _id: new Types.ObjectId(id), isActive: true });
    if (!isUserActive) {
      this.logger.warn(`Profile not found for ID: ${id}`);
      return res.status(404).json({
        status: 'error',
        message: 'Profile not found',
      });
    }

    try {
      await this.UserModel.findOneAndUpdate(
        { _id: new Types.ObjectId(id) },
        { isActive: false }
      )

      return res.status(200).json({
        status: 'success',
        message: 'User Delete Successfully',
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
}
