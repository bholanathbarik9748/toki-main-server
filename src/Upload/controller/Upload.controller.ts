import { Controller, Param, Post, Req, Res, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { Request, Response } from 'express';
import { JwtAuthGuard } from 'src/Auth/strategy/jwt-auth.guard';
import { UploadService } from '../services/Upload.service';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';


@Controller('user')
export class UploadController {
    constructor(private readonly UploadService: UploadService) { }

    @Post('/:id/file/upload')
    @UseInterceptors(FilesInterceptor('files', 100)) // Max 1000 files (customize as per your needs)
    uploadMultipleFiles(
        @Param('id') id: string, // Capture 'id' from route
        @UploadedFiles() files: Array<Express.Multer.File>, // Handle multiple files
        @Req() req: Request,
        @Res() res: Response,
    ) {
        // You can now use 'id' and 'files' in your logic
        return this.UploadService.upload(id, files, req, res);
    }
}
