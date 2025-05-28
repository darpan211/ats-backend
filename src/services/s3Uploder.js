import AWS from 'aws-sdk';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

export const uploadToS3 = async (file) => {
    try {
        const fileContent = fs.readFileSync(file.path);
        const fileExt = path.extname(file.originalname);
        const s3Key = `tiles/${uuidv4()}${fileExt}`;
        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: s3Key,
            Body: fileContent,
            ContentType: file.mimetype,
            ACL: 'public-read',
        };
        const uploadResult = await s3.upload(params).promise();
        return uploadResult.Location;
    } catch (error) {
        console.error('S3 Upload Error:', error);
        throw new Error('Failed to upload file to S3');
    }
};
