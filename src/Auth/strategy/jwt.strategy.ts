import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthDocument } from '../schema/user.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

interface JwtPayload {
    username: string;
    sub: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        @InjectModel('User') private readonly userModel: Model<AuthDocument>,  // Inject the user model
    ) {
        super({
            // Extracts the JWT from the Authorization header (Bearer token)
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRETE_TOKEN, // JWT secret
        });
    }

    async validate(payload: JwtPayload) {
        // Attach the user information to the request object
        const user = await this.userModel.findById(payload.sub).exec();

        if (!user) {
            throw new UnauthorizedException('Invalid token: user does not exist');  // If user not found, throw error
        }

        return { userId: payload.sub, username: payload.username };
    }
}
