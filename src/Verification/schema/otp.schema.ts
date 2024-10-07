// Import necessary decorators and types from NestJS and Mongoose packages
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId, Types } from 'mongoose';  // Types for MongoDB documents

// Define the OtpDocument type, which combines the Otp class and Mongoose Document
export type OtpDocument = Otp & Document;

@Schema({ timestamps: true })  // Enable timestamps for createdAt and updatedAt fields
export class Otp {
    @Prop({
        required: false,
        trim: true,
        validate: {
            validator: (email: string) => {
                const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
                return emailRegex.test(email);
            },
            message: 'Invalid email format',
        },
    })
    email: string;

    @Prop({
        required: true,
        trim: true,
        minlength: 6,
        maxlength: 6,
        validate: {
            validator: (otp: string) => {
                const otpRegex = /^\d{6}$/;
                return otpRegex.test(otp);
            },
            message: 'OTP must be a 6-digit number',
        },
    })
    otp: string;
}

// Generate the Mongoose schema for the Otp class
export const OtpSchema = SchemaFactory.createForClass(Otp);
