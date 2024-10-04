import { v2 as cloudinary } from 'cloudinary'; // Import Cloudinary v2 for handling uploads
import { ConfigService } from '@nestjs/config'; // Import ConfigService to access environment variables
import { Injectable } from '@nestjs/common'; // Import Injectable for dependency injection

@Injectable() // This makes the class available for dependency injection
export class CloudinaryProvider {

    // Inject the ConfigService to access environment variables (Cloudinary credentials)
    constructor(private configService: ConfigService) {

        // Configure Cloudinary using credentials stored in environment variables
        cloudinary.config({
            cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'), // Get Cloudinary cloud name
            api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),       // Get Cloudinary API key
            api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'), // Get Cloudinary API secret
        });
    }

    // Function to upload a file to Cloudinary using Multer's file buffer
    async uploadFile(file: Express.Multer.File): Promise<any> {
        return new Promise((resolve, reject) => {

            // Create a Cloudinary upload stream with the desired options (e.g., upload folder)
            const uploadStream = cloudinary.uploader.upload_stream(
                { folder: 'uploads' }, // Specify the folder where the file will be uploaded in Cloudinary
                (error, result) => {    // Callback function that handles the response from Cloudinary
                    if (error) {
                        return reject(error); // Reject the promise if there’s an error during upload
                    }
                    resolve(result); // Resolve the promise with the upload result from Cloudinary
                },
            );

            // Pass the file buffer to the Cloudinary stream
            // `.end()` is important to ensure the file's buffer is properly passed to the upload stream
            uploadStream.end(file.buffer);
        });
    }
}