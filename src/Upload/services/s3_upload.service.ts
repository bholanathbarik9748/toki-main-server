import { Injectable, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { S3Provider } from '../provider/s3.provider';  // Updated from CloudinaryProvider to S3Provider

@Injectable()
export class S3UploadService {
    private readonly logger = new Logger(S3UploadService.name);
    constructor(private readonly s3Provider: S3Provider) { }

    async upload(id: string, files: Array<Express.Multer.File>, req: Request, res: Response) {
        try {
            const uploadPromises = files.map(file => this.s3Provider.uploadFile(file));
            const uploadResults = await Promise.all(uploadPromises);  // Wait for all files to be uploaded

            return res.status(200).json({
                message: 'Files uploaded successfully!',
                userId: id,
                files: uploadResults,
            });
        } catch (error) {
            this.logger.error('Error uploading files:', error);
            return res.status(500).json({
                message: 'Failed to upload files',
                error: error.message,
            });
        }
    }
}
