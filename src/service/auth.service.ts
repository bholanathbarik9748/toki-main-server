import { Injectable, Logger, UseFilters } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Request, Response } from 'express';
import { Model } from 'mongoose';
import { AuthDocument } from '../schema/user.schema'
import { AuthDto } from 'src/validation/auth.dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UserExceptionFilter } from 'src/middleware/user.middleware';
import * as bcrypt from 'bcrypt';

@Injectable()
@UseFilters(UserExceptionFilter)
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(@InjectModel('User') private UserModel: Model<AuthDocument>) { }

  async signUp(req: Request, res: Response): Promise<Response> {
    const body = req.body;

    // Transform body into an instance of  and validate it
    const createAuthDto = plainToInstance(AuthDto, body);
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

    // Check if the user already exists using `findOne`
    const existingUser = await this.UserModel.findOne({ email: body.email });

    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'Email already exists. Please use another email.',
      });
    }

    try {
      // Hash the password before saving the user
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(body.password, salt);

      const newUser = new this.UserModel({
        email: body.email,
        password: hashedPassword,
      });
      await newUser.save();

      return res.status(200).json({
        status: 'success',
        message: "User Create Successfully",
        data: {
          email: newUser.email,
        },
      })
    } catch (error) {
      this.logger.error('Error fetching records', { error });
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error, please try again later.'
      });
    }
  }

  async signIn(req: Request, res: Response): Promise<Response> {
    const body = req.body;

    // Transform body into an instance of  and validate it
    const createAuthDto = plainToInstance(AuthDto, body);
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
      // Check if the user exists by email
      const user = await this.UserModel.findOne({ email: body.email });

      if (!user) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid email or password',
        });
      }

      // Compare the provided password with the hashed password in the database
      const isPasswordValid = await bcrypt.compare(body.password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid email or password',
        });
      }

      // Password is valid, proceed with login (you can generate a JWT token here)
      return res.status(200).json({
        status: 'success',
        message: 'Login successful',
        data: {
          email: user.email,
          // You can also include token or other user details here
        },
      });
    } catch (error) {
      this.logger.error('Error fetching records', { error });
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error, please try again later.'
      });
    }
  }
}
