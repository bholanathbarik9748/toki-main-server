// Import necessary decorators and types from NestJS and Mongoose packages
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, ObjectId, Types } from 'mongoose';  // Types for MongoDB documents

// Define the TaskDocument type, which combines the Task class and Mongoose Document
export type TaskDocument = Task & Document;

// Priority Enum: Defines different levels of priority for tasks
export enum PriorityEnum {
    Critical = "CRITICAL",  // Highest level of priority
    VeryHigh = "VERY_HIGH", // Very high priority
    High = "HIGH",          // High priority
    Medium = "MEDIUM",      // Medium priority
    Low = "LOW",            // Low priority
    VeryLow = "VERY_LOW",   // Very low priority
    None = "NONE",          // No specific priority
}

// ShareEnum: Defines sharing options for tasks
export enum ShareEnum {
    Public = "PUBLIC",          // Task is visible to everyone
    Private = "PRIVATE",        // Task is visible only to the user
    ShareVieLink = "SHARE_VIE_LINK",  // Task can be shared via a generated link
}

@Schema({ timestamps: true })  // Enable timestamps for createdAt and updatedAt fields
export class Task {

    // taskName: The name of the task, required and trimmed to remove extra spaces
    @Prop({ required: true, trim: true })
    taskName: string;

    // TaskDescription: The detailed description of the task, required and trimmed
    @Prop({ required: true, trim: true })
    TaskDescription: string;

    // UserId: The ObjectId of the user who created the task, required
    @Prop({ required: true })
    UserId: Types.ObjectId;

    // ShareType: The sharing option for the task, defaults to "Private"
    @Prop({ required: true, default: ShareEnum.Private })
    ShareType: ShareEnum;

    // Priority: The priority level of the task, required and trimmed
    @Prop({ required: true, trim: true })
    Priority: PriorityEnum;

    // isActive: The Status of the task, required and default is true
    @Prop({ required: true, default: true })
    isActive: Boolean;
}

// Generate the Mongoose schema for the Task class
// This converts the Task class into a Mongoose schema, adding additional MongoDB features
export const TaskDocument = SchemaFactory.createForClass(Task);