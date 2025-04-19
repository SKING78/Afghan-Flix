import { google } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(
  '481908488603-34bsdlb070h7tn72tf2rf18443rlhm1m.apps.googleusercontent.com',
  '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',
  'https://afghan-flix.vercel.app/api/oauth2callback'
);

let resolveAuth;
const authPromise = new Promise((resolve) => { resolveAuth = resolve; });

export default async (req, res) => {
  const { code } = req.query;
  const { tokens } = await oauth2Client.getToken(code);
  resolveAuth(tokens);
  res.send('Authorization successful! You can now close this tab.');
};

export async function getTokens() {
  return await authPromise;
}
