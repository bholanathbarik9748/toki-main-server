import { IsString, IsNotEmpty, MinLength, IsOptional } from 'class-validator';

// DTO (Data Transfer Object) for validating incoming profile data
export class ProfileDto {
    // The first name must be a non-empty string
    @IsString({ message: 'First name must be a string.' })  // Custom message for better error feedback
    @IsNotEmpty({ message: 'First name is required.' })  // Custom error message if empty
    firstName: string;

    // The last name must be a non-empty string
    @IsString({ message: 'Last name must be a string.' })
    @IsNotEmpty({ message: 'Last name is required.' })
    lastName: string;

    // The occupation must be a non-empty string
    @IsString({ message: 'Occupation must be a string.' })
    @IsNotEmpty({ message: 'Occupation is required.' })
    occupation: string;

    // The phone number must be a non-empty string with at least 10 characters
    @IsString({ message: 'Phone number must be a string.' })
    @IsNotEmpty({ message: 'Phone number is required.' })
    @MinLength(10, { message: 'Please enter a valid phone number with at least 10 characters.' })
    phoneNumber: string;

    // Address is optional but if provided, it must be a string
    @IsOptional()  // Mark as optional, no error if not provided
    @IsString({ message: 'Address must be a string.' })  // Ensure the value is a string if provided
    address?: string;  // Optional field with a string type
}
