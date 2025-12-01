import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class StorageService {
    private s3Client: S3Client;
    private bucketName = process.env.AWS_BUCKET_NAME || 'hisecure-erp-uploads';
    private useLocal = !process.env.AWS_ACCESS_KEY_ID; // Fallback to local if no AWS creds

    constructor() {
        if (!this.useLocal) {
            this.s3Client = new S3Client({
                region: process.env.AWS_REGION || 'us-east-1',
                credentials: {
                    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
                    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
                },
            });
        }
    }

    async uploadFile(file: Express.Multer.File): Promise<string> {
        const fileName = `${Date.now()}-${file.originalname}`;

        if (this.useLocal) {
            // Local storage fallback
            const uploadDir = path.join(process.cwd(), 'uploads');
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
            const filePath = path.join(uploadDir, fileName);
            fs.writeFileSync(filePath, file.buffer);
            // Return a local URL (assuming we serve 'uploads' statically)
            return `http://localhost:3000/uploads/${fileName}`;
        } else {
            // S3 upload
            await this.s3Client.send(
                new PutObjectCommand({
                    Bucket: this.bucketName,
                    Key: fileName,
                    Body: file.buffer,
                    ContentType: file.mimetype,
                    ACL: 'public-read', // Caution: Make sure bucket allows this or use signed URLs
                }),
            );
            return `https://${this.bucketName}.s3.amazonaws.com/${fileName}`;
        }
    }
}
