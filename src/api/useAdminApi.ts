import { useMemo } from 'react';
import { auth } from '../firebase';
import { env } from '../env';
import { AdminApiClient } from './client';

export function useAdminApi(): AdminApiClient {
  return useMemo(
    () =>
      new AdminApiClient(env.API_BASE_URL, () => {
        const user = auth.currentUser;
        if (!user) return Promise.reject(new Error('Not authenticated'));
        return user.getIdToken();
      }),
    [],
  );
}
