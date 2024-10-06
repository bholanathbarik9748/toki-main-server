import { Controller, Param, Post, Req, Res, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { Request, Response } from 'express';
import { S3UploadService } from '../services/s3_upload.service';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('user')
export class S3UploadController {
    constructor(private readonly S3UploadService: S3UploadService) { }

    @Post('/:id/upload/')
    @UseInterceptors(FilesInterceptor('files', 100))  // Max 100 files (customize as per your needs)
    uploadMultipleFiles(
        @Param('id') id: string,  // Capture 'id' from route
        @UploadedFiles() files: Array<Express.Multer.File>,  // Handle multiple files
        @Req() req: Request,
        @Res() res: Response,
    ) {
        return this.S3UploadService.upload(id, files, req, res);
    }
}
