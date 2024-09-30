// Import necessary decorators and types from NestJS and Mongoose packages
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId, Types } from 'mongoose';  // Types for MongoDB documents

// Define the ProfileDocument type, which combines the Profile class and Mongoose Document
export type ProfileDocument = Profile & Document;

@Schema({ timestamps: true })  // Enable timestamps for createdAt and updatedAt fields
export class Profile {
    @Prop({ required: true, trim: true })
    firstName: string;

    @Prop({ required: true, type: Types.ObjectId, ref: 'User', trim: true })
    userId: Types.ObjectId;

    @Prop({ required: true, trim: true })
    lastName: string;

    @Prop({ required: true, trim: true })
    occupation: string;

    @Prop({ required: false, trim: true })
    address?: string;  // Made optional with a question mark (?)

    @Prop({
        required: true,
        trim: true,
        minlength: 10,  // Added validation for minimum length
    })
    phoneNumber: string;
}

// Generate the Mongoose schema for the Profile class
export const ProfileDocument = SchemaFactory.createForClass(Profile);