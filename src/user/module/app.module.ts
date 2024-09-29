// Import necessary global packages for the module
import { Module } from '@nestjs/common';  // Core NestJS module functionality
import { ConfigModule } from '@nestjs/config';  // Module for environment configuration

// Import controller for handling authentication routes
import { AuthController } from '../controller/Auth.controller';  // Controller responsible for authentication-related actions

// Import services that handle business logic
import { AuthService } from '../service/auth.service';  // Service that manages authentication and related logic

// Import MongoDB connection configurations
import { MongooseModule } from '@nestjs/mongoose';  // MongoDB integration with NestJS
import { AuthDocument, User } from 'src/user/schema/user.schema';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    // Configuration module for environment variables, set to be globally available across the entire application
    ConfigModule.forRoot({
      isGlobal: true,  // This ensures environment variables can be accessed in any module without needing to import ConfigModule multiple times
    }),

    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRETE_TOKEN,  // Replace with your secret or use a config service
      signOptions: { expiresIn: '1y' },
    }),

    // Connect to MongoDB using the MONGO_URI environment variable from the configuration file
    MongooseModule.forRoot(process.env.MONGO_URI),  // Initializes the Mongoose connection using the MongoDB URI
    MongooseModule.forFeature([{ name: User.name, schema: AuthDocument }]), // Register the schema here
  ],

  // Controllers define the request handling logic and map incoming requests to appropriate services
  controllers: [AuthController],  // The auth controller will handle authentication requests (login, signup, etc.)

  // Providers are services that handle the business logic and interact with the database
  providers: [AuthService],  // The authentication service will contain the core logic for user authentication and token handling
})

export class AppModule { }  // Main application module that brings together the controllers, services, and configurations