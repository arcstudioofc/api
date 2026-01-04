import { z } from 'zod';
import 'dotenv/config';

const envSchema = z.object({
  BETTER_AUTH_SECRET: z.string(),
  BETTER_AUTH_URL: z.url(),

  PORT: z.coerce.number(),

  GITHUB_CLIENT_ID: z.string(),
  GITHUB_CLIENT_SECRECT: z.string(),

  RESEND_API_KEY: z.string(),

  WEB_APP_URL: z.url(),
  WEB_DEV_URL: z.url(),
  WEB_URL: z.url(),

  MONGODB_URI: z.string(),
});

export const env = envSchema.parse(process.env);