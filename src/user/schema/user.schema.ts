// Import necessary decorators and types from NestJS and Mongoose packages
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';  // Decorators to define Mongoose schema properties
import { Document, Types } from 'mongoose';  // Types for MongoDB documents and other Mongoose types

// Define the Mongoose document type for authentication
export type AuthDocument = User & Document;  // Combines the User class and Mongoose Document type for the AuthDocument type

// Define the User schema with Mongoose and apply automatic timestamp generation
@Schema({ timestamps: true })  // Automatically adds createdAt and updatedAt timestamps to the User schema
export class User {
    // Define the email field with required validation and ensure it's unique
    @Prop({ required: true, unique: true })  // Email is required and must be unique in the database
    email: string;

    // Define the password field with required validation
    @Prop({ required: true })  // Password is required for user authentication
    password: string;  // Use lowercase string type for the password field
}

// Corrected schema export name for better clarity and consistency
export const AuthDocument = SchemaFactory.createForClass(User);  // Create the Mongoose schema for the User class and export it as AuthDocument
