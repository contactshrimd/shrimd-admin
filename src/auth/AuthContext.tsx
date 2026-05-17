import { createContext, useEffect, useState } from 'react';
import { onIdTokenChanged, signOut, User } from 'firebase/auth';
import { auth } from '../firebase';
import { AdminRole, ADMIN_ROLES } from '../routes';

type AuthState = {
  user: User | null;
  role: AdminRole | null;
  loading: boolean;
  accessDenied: boolean;
};

type AuthContextValue = AuthState & {
  signOutUser: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    role: null,
    loading: true,
    accessDenied: false,
  });

  useEffect(() => {
    return onIdTokenChanged(auth, async user => {
      if (!user) {
        setState({ user: null, role: null, loading: false, accessDenied: false });
        return;
      }

      const tokenResult = await user.getIdTokenResult();
      const claim = tokenResult.claims['admin_role'] as string | undefined;

      if (!claim || !(ADMIN_ROLES as readonly string[]).includes(claim)) {
        await signOut(auth);
        setState({ user: null, role: null, loading: false, accessDenied: true });
        return;
      }

      setState({ user, role: claim as AdminRole, loading: false, accessDenied: false });
    });
  }, []);

  async function signOutUser() {
    await signOut(auth);
  }

  return (
    <AuthContext.Provider value={{ ...state, signOutUser }}>
      {children}
    </AuthContext.Provider>
  );
}
