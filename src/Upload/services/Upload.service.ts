import { Injectable, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { CloudinaryProvider } from '../provider/cloudinary.provider';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  constructor(private readonly cloudinaryProvider: CloudinaryProvider) { }

  // Get profile by ID with improved error handling and validation
  async upload(id: string, files: Array<Express.Multer.File>, req: Request, res: Response) {
    console.log("files", files);

    try {
      const uploadPromises = files.map(file => this.cloudinaryProvider.uploadFile(file));
      const uploadResults = await Promise.all(uploadPromises); // Wait for all files to be uploaded

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
