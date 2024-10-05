// Import necessary global packages for the module
import { Module } from '@nestjs/common';  // Core NestJS module for creating a module
import { ConfigModule } from '@nestjs/config';  // Module to handle environment variables

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

// 
import { ValidationController } from './Verification/controller/MailValidation.controller';
import { MailValidationService } from './Verification/services/MailValidation.service';
import { TaskController } from './TaskModule/controller/TaskModule.controller';
import { TaskService } from './TaskModule/services/TaskModule.service';
import { Task, TaskDocument } from './TaskModule/schema/TaskModule.schema';

// 
import { UploadService } from './Upload/services/Upload.service';
import { UploadController } from './Upload/controller/Upload.controller';
import { CloudinaryProvider } from './Upload/provider/cloudinary.provider';
import { AppController } from './app.controller';



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

    // Register the schemas for the User and Profile collections in MongoDB
    MongooseModule.forFeature([
      { name: User.name, schema: AuthDocument },  // Register User schema for authentication-related data
      { name: Profile.name, schema: ProfileDocument },  // Register Profile schema for storing user profile information
      { name: Task.name, schema: TaskDocument }  // Register Profile schema for storing user profile information
    ]),
  ],

  // Define the controllers responsible for handling HTTP requests and routing them to appropriate service methods
  controllers: [
    AppController,
    AuthController,  // Handles authentication-related routes (login, signup, etc.)
    ProfileController,  // Handles profile-related routes (view/update profile, etc.)
    ValidationController,
    TaskController,
    UploadController,
  ],

  // Define the providers that contain the core business logic for this module
  providers: [
    AuthService,  // Contains authentication logic such as user validation and token generation
    ProfileService,  // Handles profile-related business logic such as fetching and updating user profiles
    TaskService,
    JwtStrategy,  // Custom JWT strategy for handling token validation and securing routes
    MailValidationService,
    UploadService,
    CloudinaryProvider,
  ],
})

export class AppModule { }  // The root application module that integrates the core logic of the app