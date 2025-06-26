import AWS from 'aws-sdk';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

const uploadFile = async (file, folder) => {
    try {
        const fileContent = fs.readFileSync(file.path);
        const fileExt = path.extname(file.originalname);
        const s3Key = `${folder}/${uuidv4()}${fileExt}`;
        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: s3Key,
            Body: fileContent,
            ContentType: file.mimetype,
        };
        const uploadResult = await s3.upload(params).promise();
        return uploadResult.Location;
    } catch (error) {
        console.error('S3 Upload Error:', error);
        throw new Error('Failed to upload file to S3');
    }
};

export const uploadToS3 = (file) => uploadFile(file, 'tiles');
export const uploadToRoomsS3 = (file) => uploadFile(file, 'rooms');
export const uploadToUserS3 = (file) => uploadFile(file, 'users');
export const uploadToConfigureS3 = (file) => uploadFile(file, 'configure');

export const deleteFromS3 = async (imageUrl) => {
    try {
        // Extract the S3 key from the URL
        const url = new URL(imageUrl);
        const key = decodeURIComponent(url.pathname.substring(1));
        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: key,
        };
        await s3.deleteObject(params).promise();
    } catch (error) {
        console.error('S3 Delete Error:', error);
        throw new Error('Failed to delete file from S3');
    }
};
