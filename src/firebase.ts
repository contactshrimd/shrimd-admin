import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { env } from './env';

const app = initializeApp({
  apiKey: env.FIREBASE_API_KEY,
  authDomain: env.FIREBASE_AUTH_DOMAIN,
  projectId: env.FIREBASE_PROJECT_ID,
  appId: env.FIREBASE_APP_ID,
});

export const auth = getAuth(app);
