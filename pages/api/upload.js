// pages/api/upload.js
import { S3 } from 'aws-sdk';
import formidable from 'formidable';
import fs from 'fs';

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const form = new formidable.IncomingForm();
  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: err.message });

    const file = files.file;
    const stream = fs.createReadStream(file.filepath);

    const s3 = new S3({
      endpoint: 'https://s3.us.archive.org',
      accessKeyId: process.env.ARCHIVE_ACCESS_KEY,
      secretAccessKey: process.env.ARCHIVE_SECRET_KEY,
      signatureVersion: 'v4',
      s3ForcePathStyle: true
    });

    const identifier = `video_${Date.now()}`;

    try {
      await s3.createBucket({ Bucket: identifier }).promise();
      await s3.upload({
        Bucket: identifier,
        Key: file.originalFilename,
        Body: stream,
        ACL: 'public-read',
        ContentType: file.mimetype
      }).promise();

      const url = `https://archive.org/download/${identifier}/${file.originalFilename}`;
      res.status(200).json({ url });
    } catch (uploadErr) {
      res.status(500).json({ error: uploadErr.message });
    }
  });
}
