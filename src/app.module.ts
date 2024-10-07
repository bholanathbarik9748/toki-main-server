// Import necessary global packages for the module
import { Module } from '@nestjs/common';  // Core NestJS module for creating a module
import { ConfigModule } from '@nestjs/config';  // Module to handle environment variables
import { AppController } from './app.controller';  // Root application controller

// Import MongoDB connection configurations and schemas
import { MongooseModule } from '@nestjs/mongoose';  // MongoDB integration with NestJS

// Import authentication-related modules and strategies
import { PassportModule } from '@nestjs/passport';  // Passport module for implementing authentication strategies
import { JwtModule } from '@nestjs/jwt';  // JWT module to handle token creation and validation
import { JwtStrategy } from './Auth/strategy/jwt.strategy';  // Custom JWT strategy for validating tokens

// Import controller and service for handling user authentication
import { AuthController } from './Auth/controller/Auth.controller';  // Controller for managing authentication requests (login, signup, etc.)
import { AuthService } from './Auth/service/auth.service';  // Service responsible for user authentication logic and token management
import { AuthDocument, User } from 'src/Auth/schema/user.schema';  // MongoDB schema and document for User entity

// Import controller and service for handling user profile routes
import { ProfileController } from './Profile/controller/Profile.controller';  // Controller for managing user profile-related requests
import { ProfileService } from './Profile/services/Profile.service';  // Service responsible for managing user profile data
import { Profile, ProfileDocument } from './Profile/schema/Profile.schema';  // MongoDB schema and document for Profile entity

// Import validation, task, and upload controllers and services
import { ValidationController } from './Verification/controller/MailValidation.controller';  // Controller for handling email validation logic
import { MailValidationService } from './Verification/services/MailValidation.service';  // Service for handling email validation functionality

import { TaskController } from './TaskModule/controller/TaskModule.controller';  // Controller for handling task-related requests
import { TaskService } from './TaskModule/services/TaskModule.service';  // Service for managing task-related logic
import { Task, TaskDocument } from './TaskModule/schema/TaskModule.schema';  // MongoDB schema and document for Task entity
import { Otp, OtpSchema } from './Verification/schema/otp.schema';

// Import upload service and provider for handling file uploads
import { UploadService } from './Upload/services/Upload.service';  // Service responsible for file upload logic (e.g., images)
import { UploadController } from './Upload/controller/Upload.controller';  // Controller for managing upload-related routes

import { CloudinaryProvider } from './Upload/provider/cloudinary.provider';  // Cloudinary provider to handle media uploads to Cloudinary

// Import S3 upload service and provider for AWS S3 uploads
import { S3UploadService } from './Upload/services/s3_upload.service';  // Service responsible for file uploads to AWS S3
import { S3UploadController } from './Upload/controller/s2_upload.controller';  // Controller for managing S3 upload routes
import { S3Provider } from './Upload/provider/s3.provider';  // S3 provider for handling AWS S3 integration

@Module({
  imports: [
    // Load environment configuration globally, making it available across the entire application
    ConfigModule.forRoot({
      isGlobal: true,  // This ensures ConfigModule is accessible without needing to import it in every module
    }),

    // Import Passport for authentication strategies, such as JWT-based authentication
    PassportModule,

    // Import JwtModule for creating and validating JWT tokens
    JwtModule.register({
      secret: process.env.JWT_SECRETE_TOKEN,  // JWT secret key fetched from environment variables for token signing
      signOptions: { expiresIn: '1y' },  // Set token expiration to 1 year (adjust based on security requirements)
    }),

    // Establish a connection to MongoDB using Mongoose with URI from environment variables
    MongooseModule.forRoot(process.env.MONGO_URI),  // Mongoose is used for object modeling in MongoDB

    // Register the schemas for the User, Profile, and Task collections in MongoDB
    MongooseModule.forFeature([
      { name: User.name, schema: AuthDocument },  // Register User schema for authentication-related data
      { name: Profile.name, schema: ProfileDocument },  // Register Profile schema for storing user profile information
      { name: Task.name, schema: TaskDocument },  // Register Task schema for handling task-related data
      { name: Otp.name, schema: OtpSchema },  // Otp schema for handling task-related data
    ]),
  ],

  // Define the controllers responsible for handling HTTP requests and routing them to appropriate service methods
  controllers: [
    AppController,  // Main application controller
    AuthController,  // Handles authentication-related routes (login, signup, etc.)
    ProfileController,  // Handles profile-related routes (view/update profile, etc.)
    ValidationController,  // Handles email validation-related routes
    TaskController,  // Handles task-related routes
    UploadController,  // Handles file upload-related routes
    S3UploadController,  // Handles AWS S3 upload-related routes
  ],

  // Define the providers that contain the core business logic for this module
  providers: [
    AuthService,  // Contains authentication logic such as user validation and token generation
    ProfileService,  // Handles profile-related business logic such as fetching and updating user profiles
    TaskService,  // Handles task-related business logic
    JwtStrategy,  // Custom JWT strategy for handling token validation and securing routes
    MailValidationService,  // Handles email validation logic
    UploadService,  // Handles file upload logic (Cloudinary)
    CloudinaryProvider,  // Provides the logic for uploading files to Cloudinary
    S3Provider,  // Provides AWS S3 integration logic for file uploads
    S3UploadService,  // Handles file upload logic for AWS S3
  ],
})

export class AppModule { }  // The root application module that integrates the core logic of the app