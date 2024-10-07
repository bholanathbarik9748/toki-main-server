import { Injectable, Logger, UseFilters } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Request, Response } from 'express';
import { Model } from 'mongoose';
import { AuthDocument } from '../schema/user.schema';
import { AuthDto } from 'src/Auth/validation/auth.dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UserExceptionFilter } from 'src/Auth/middleware/user.middleware';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { OtpDocument } from 'src/Verification/schema/otp.schema';

@Injectable()
@UseFilters(UserExceptionFilter)
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  // Inject JwtService in the constructor
  constructor(
    @InjectModel('User') private UserModel: Model<AuthDocument>,
    @InjectModel('Otp') private OtpModel: Model<OtpDocument>,
    private jwtService: JwtService // Ensure JwtService is injected
  ) { }

  async signUp(req: Request, res: Response): Promise<Response> {
    const body = req.body;

    // Transform body into an instance of AuthDto and validate it
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
    const existingUser = await this.UserModel.findOne({ email: body.email, isActive: true });

    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'Email already exists. Please use another email.',
      });
    }

    const session = await this.UserModel.startSession(); // Start a session for the transaction
    session.startTransaction();
    try {
      // Hash the password before saving the user
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(body.password, salt);

      const newUser = new this.UserModel({
        email: body.email,
        password: hashedPassword,
      });
      await newUser.save();

      await this.OtpModel.findOneAndDelete({ email: body.email });

      session.endSession();

      // Create JWT token
      const payload = { email: newUser.email, sub: newUser._id };
      const access_token = this.jwtService.sign(payload);

      return res.status(200).json({
        status: 'success',
        message: 'User created successfully',
        data: {
          email: newUser.email,
          userId: newUser._id,
          access_token,
        },
      });
    } catch (error) {
      this.logger.error('Error creating user', { error });
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error, please try again later.',
      });
    }
  }

  async signIn(req: Request, res: Response): Promise<Response> {
    const body = req.body;

    // Transform body into an instance of AuthDto and validate it
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
      const user = await this.UserModel.findOne({ email: body.email, isActive: true });

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

      // Password is valid, proceed with login
      // Generate JWT token
      const payload = { email: user.email, sub: user._id };
      const access_token = this.jwtService.sign(payload);

      return res.status(200).json({
        status: 'success',
        message: 'Login successful',
        data: {
          email: user.email,
          userId: user._id,
          access_token, // Include the JWT token in the response
        },
      });
    } catch (error) {
      this.logger.error('Error logging in', { error });
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error, please try again later.',
      });
    }
  }
}
