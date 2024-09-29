import { IsString, IsNotEmpty, Min, Max, MinLength } from 'class-validator';

export class AuthDto {
    @IsString()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    password: number;
}