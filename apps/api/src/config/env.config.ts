import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: parseInt(process.env.PORT ?? '4000', 10),
  frontendOrigin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:888',
  jwtSecret: process.env.JWT_SECRET ?? '',
  googleClientId: process.env.GOOGLE_CLIENT_ID ?? '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
  googleCallbackUrl: process.env.GOOGLE_CALLBACK_URL ?? 'http://localhost:4000/auth/google/callback',
  mongodbUri: process.env.MONGODB_URI ?? 'mongodb://localhost:27017/anydo',
  geminiApiKey: process.env.GEMINI_API_KEY ?? '',
}));
