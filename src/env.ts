export const env = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL ?? '',
  FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY ?? '',
  FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? '',
  FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? '',
  FIREBASE_APP_ID: import.meta.env.VITE_FIREBASE_APP_ID ?? '',
  FIREBASE_EMULATOR: import.meta.env.VITE_FIREBASE_EMULATOR === 'true',
  FIREBASE_AUTH_EMULATOR_HOST: import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_HOST ?? '127.0.0.1:9099',
};
