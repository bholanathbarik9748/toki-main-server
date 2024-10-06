import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { v4 as uuid } from 'uuid';

@Injectable()
export class S3Provider {
    private readonly s3Client: S3Client;
    private readonly bucketName: string;

    constructor(private configService: ConfigService) {
        // Fetch values from environment variables or ConfigService
        const region = process.env.AWS_REGION || this.configService.get<string>('AWS_REGION');
        const accessKeyId = process.env.AWS_ACCESS_KEY_ID || this.configService.get<string>('AWS_ACCESS_KEY_ID');
        const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || this.configService.get<string>('AWS_SECRET_ACCESS_KEY');
        this.bucketName = process.env.AWS_S3_BUCKET_NAME || this.configService.get<string>('AWS_S3_BUCKET_NAME');

        this.s3Client = new S3Client({
            region: region,  // Use dynamic region
            endpoint: `https://s3.${region}.amazonaws.com`,  // Use the correct endpoint
            credentials: {
                accessKeyId: accessKeyId,
                secretAccessKey: secretAccessKey,
            },
        });
    }

    async uploadFile(file: Express.Multer.File): Promise<any> {
        const uploadParams = {
            Bucket: this.bucketName,
            Key: `${uuid()}-${file.originalname}`,
            Body: file.buffer,
            ContentType: file.mimetype,
        };

        try {
            const result = await this.s3Client.send(new PutObjectCommand(uploadParams));
            return {
                key: uploadParams.Key,
                location: `https://${this.bucketName}.s3.${process.env.AWS_REGION || this.configService.get<string>('AWS_REGION')}.amazonaws.com/${uploadParams.Key}`,  // Dynamic region
            };
        } catch (error) {
            throw new Error(`Failed to upload file: ${error.message}`);
        }
    }
}