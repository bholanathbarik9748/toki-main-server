// Import necessary global packages for the module
import { Module } from '@nestjs/common';  // Core NestJS module for creating a module
import { ConfigModule } from '@nestjs/config';  // Module to handle environment variables

// Import controller for handling user authentication routes
import { AuthController } from './Auth/controller/Auth.controller';  // Controller that manages authentication requests like login, signup, etc.

// Import services that contain the business logic for authentication
import { AuthService } from './Auth/service/auth.service';  // Service for handling user authentication and token generation

// Import MongoDB connection configurations and schemas
import { MongooseModule } from '@nestjs/mongoose';  // MongoDB integration with NestJS
import { AuthDocument, User } from 'src/Auth/schema/user.schema';  // User schema and document for MongoDB

// Import Auth configurations
import { PassportModule } from '@nestjs/passport';  // Passport module for authentication strategies
import { JwtModule } from '@nestjs/jwt';  // JWT module to handle token creation and validation
import { JwtStrategy } from './Auth/strategy/jwt.strategy';
import { ProfileController } from './Profile/controller/Profile.controller';
import { ProfileService } from './Profile/services/Profile.service';
import { Profile, ProfileDocument } from './Profile/schema/Profile.schema';

@Module({
  imports: [
    // Load environment configuration globally so it is accessible in every module
    ConfigModule.forRoot({
      isGlobal: true,  // This makes ConfigModule available across the entire application without needing to import it multiple times
    }),

    // Import Passport for authentication strategies
    PassportModule,

    // Import JwtModule for signing and verifying JWT tokens
    JwtModule.register({
      secret: process.env.JWT_SECRETE_TOKEN,  // JWT secret token pulled from environment variables
      signOptions: { expiresIn: '1y' },  // Token expiry set to 1 year
    }),

    // Connect to MongoDB using the URI specified in environment variables
    MongooseModule.forRoot(process.env.MONGO_URI),  // Establish a connection to MongoDB using Mongoose
    MongooseModule.forFeature([
      { name: User.name, schema: AuthDocument },
      { name: Profile.name, schema: ProfileDocument }
    ]),  // Register the User schema with Mongoose
  ],

  // Controllers handle HTTP requests and map them to appropriate service methods
  controllers: [AuthController, ProfileController],  // The AuthController manages routes related to user authentication (login, registration, etc.)

  // Providers contain the core business logic for modules
  providers: [AuthService, ProfileService, JwtStrategy],  // AuthService will handle authentication logic, such as user validation and token management
})

export class AppModule { }  // The main application module that integrates controllers, services, and other configurations