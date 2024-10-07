import { Injectable, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { isValidObjectId, Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { AuthDocument } from 'src/Auth/schema/user.schema';
import * as nodemailer from 'nodemailer'; // Import nodemailer

@Injectable()
export class MailValidationService {
  private readonly logger = new Logger(MailValidationService.name);

  constructor(
    @InjectModel('User') private UserModel: Model<AuthDocument>,
  ) { }

  // Get profile by ID with improved error handling and validation
  async sendValidationCode(req: Request, res: Response): Promise<Response> {
    const { email } = req.body;

    // Generate a validation code
    const validationCode = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit code

    // Configure nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // Your email address from environment variables
        pass: process.env.EMAIL_PASS, // Your email password or app password
      },
    });

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER, // Sender email address
      to: email, // Receiver email address from the user's details
      subject: 'Your Validation Code',
      text: `Your email validation code is: ${validationCode}`,
    };

    try {
      // Send email
      await transporter.sendMail(mailOptions);
      this.logger.log(`Validation code sent to ${email}`);

      return res.status(200).json({
        status: 'success',
        message: 'Validation code sent successfully.',
        data: {
          code: validationCode,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to send validation code: ${error.message}`);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to send validation code. Please try again later.',
      });
    }
  }
}
