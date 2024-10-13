import { IsString, IsNotEmpty, MinLength, IsNumber, IsEmail } from 'class-validator';

// This DTO (Data Transfer Object) is used to validate the incoming data for authentication (login/signup)
export class AuthDto {
  // The email field must be a string and it cannot be empty
  @IsString() // Ensures the value is a string
  @IsNotEmpty() // Ensures the value is not an empty string
  email: string;

  // The password field must be a string, cannot be empty, and has a minimum length of 8 characters
  @IsString() // Ensures the value is a string
  @IsNotEmpty() // Ensures the value is not an empty string
  @MinLength(8, { message: 'Password must be at least 8 characters long' }) // Ensures the password has at least 8 characters
  password: string; // The password should be a string, not a number
}

export class ForgotPasswordDto {
  // The email field must be a valid email format, and it cannot be empty
  @IsEmail() // Ensures the value is a valid email address
  @IsNotEmpty() // Ensures the value is not an empty string
  email: string;

  // The OTP field should be treated as a string to validate its length
  @IsString() // Ensures the value is a string (e.g., "123456")
  @IsNotEmpty() // Ensures the value is not empty
  @MinLength(6, { message: 'OTP must be at least 6 characters long' }) // Ensures the OTP is at least 6 characters long
  otp: string; // The OTP should be treated as a string for validation

  // The password field must be a string, cannot be empty, and has a minimum length of 8 characters
  @IsString() // Ensures the value is a string
  @IsNotEmpty() // Ensures the value is not an empty string
  @MinLength(8, { message: 'Password must be at least 8 characters long' }) // Ensures the password has at least 8 characters
  password: string;
}
