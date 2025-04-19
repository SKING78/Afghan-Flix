import formidable from 'formidable';
import fs from 'fs';
import { google } from 'googleapis';

export const config = { api: { bodyParser: false } };

const oauth2Client = new google.auth.OAuth2(
  '481908488603-34bsdlb070h7tn72tf2rf18443rlhm1m.apps.googleusercontent.com',
  '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',
  'https://afghan-flix.vercel.app/api/oauth2callback'
);

let tokens = null;

const handler = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Only POST allowed' });
  if (!tokens) {
    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/youtube.upload']
    });
    return res.status(401).json({ error: 'Authorize required', authUrl: url });
  }

  const form = new formidable.IncomingForm({ multiples: false });
  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: 'Form parsing error' });

    const file = files.video;
    const title = fields.title || 'Afghan Flix Video';
    const videoPath = file.filepath;

    oauth2Client.setCredentials(tokens);
    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

    try {
      const response = await youtube.videos.insert({
        part: 'snippet,status',
        requestBody: {
          snippet: { title },
          status: { privacyStatus: 'public' }
        },
        media: {
          body: fs.createReadStream(videoPath)
        }
      });
      const videoId = response.data.id;
      const url = `https://www.youtube.com/watch?v=${videoId}`;
      return res.status(200).json({ url });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  });
};

export default handler;
