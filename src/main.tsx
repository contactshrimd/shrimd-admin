import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { AuthProvider } from './auth/AuthContext';
import { useAuth } from './auth/useAuth';
import { App } from './App';
import './styles.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 5 * 60 * 1000,
      staleTime: 30 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

function CacheGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const client = useQueryClient();
  const prevUserRef = useRef(user);

  useEffect(() => {
    if (prevUserRef.current !== null && user === null) {
      client.clear();
    }
    prevUserRef.current = user;
  }, [user, client]);

  return <>{children}</>;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CacheGuard>
          <App />
        </CacheGuard>
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
