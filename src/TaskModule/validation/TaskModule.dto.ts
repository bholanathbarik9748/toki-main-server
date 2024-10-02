import { IsString, IsNotEmpty, MinLength, IsEnum } from 'class-validator';
import { PriorityEnum, ShareEnum } from '../schema/TaskModule.schema';

// DTO (Data Transfer Object) for validating incoming profile data
export class TaskDto {
    // Validate that taskName is a string, not empty, and has a minimum length of 5 characters
    @IsString({ message: 'Task name must be a string.' })
    @IsNotEmpty({ message: 'Task name is required.' })
    @MinLength(5, { message: 'Task name must be greater than 5 characters.' })
    taskName: string;

    // Validate that taskDescription is a string, not empty, and has a minimum length of 15 characters
    @IsString({ message: 'Task description must be a string.' })
    @IsNotEmpty({ message: 'Task description is required.' })
    @MinLength(15, { message: 'Task description must be greater than 15 characters.' })
    TaskDescription: string;

    // Validate that ShareType is one of the predefined values in ShareEnum and is not empty
    @IsEnum(ShareEnum, { message: `Share Option must be one of the following: ${Object.values(ShareEnum).join(', ')}` })
    @IsNotEmpty({ message: 'Share option is required.' })
    ShareType: ShareEnum;

    // Validate that Priority is one of the predefined values in PriorityEnum and is not empty
    @IsEnum(PriorityEnum, { message: `Priority Option must be one of the following: ${Object.values(PriorityEnum).join(', ')}` })
    @IsNotEmpty({ message: 'Priority is required.' })
    Priority: PriorityEnum;
}
