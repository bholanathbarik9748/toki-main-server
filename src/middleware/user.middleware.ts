import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { MongoError } from 'mongodb';

@Catch(MongoError)
export class UserExceptionFilter implements ExceptionFilter {
    catch(exception: MongoError, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();

        // Handle duplicate key error (code 11000)
        if (exception.code === 11000) {
            const status = HttpStatus.CONFLICT; // HTTP 409 Conflict

            // Extract field name from errmsg (for MongoDB)
            const errmsg = exception.message || exception.errmsg;
            const match = errmsg.match(/index:\s+([^\s]+)/);
            const duplicateField = match ? match[1].split('_')[0] : 'field';

            return response.status(status).json({
                statusCode: status,
                timestamp: new Date().toISOString(),
                path: request.url,
                message: `${duplicateField} already exists. Please use another value for ${duplicateField}.`,
            });
        }

        // For other MongoDB errors, handle them accordingly
        return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            timestamp: new Date().toISOString(),
            path: request.url,
            message: 'Internal server error. Please try again later.',
        });
    }
}
