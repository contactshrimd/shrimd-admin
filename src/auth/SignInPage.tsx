import { FormEvent, useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

const ERROR_MESSAGES: Record<string, string> = {
  'auth/invalid-credential': 'Incorrect email or password.',
  'auth/user-not-found': 'Incorrect email or password.',
  'auth/wrong-password': 'Incorrect email or password.',
  'auth/too-many-requests': 'Too many attempts. Please try again later.',
  'auth/network-request-failed': 'Network error. Check your connection and try again.',
};

function getErrorMessage(code: string): string {
  return ERROR_MESSAGES[code] ?? 'Sign-in failed. Please try again.';
}

export function SignInPage({ accessDenied }: { accessDenied: boolean }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      const code = (err as { code?: string }).code ?? '';
      setError(getErrorMessage(code));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="sign-in-page">
      <div className="sign-in-card">
        <div className="sign-in-header">
          <p className="eyebrow">ShriMD</p>
          <h1>Admin Portal</h1>
        </div>

        {accessDenied && (
          <div className="error-banner" role="alert">
            Access denied — contact your administrator.
          </div>
        )}

        <form onSubmit={handleSubmit} className="sign-in-form">
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              required
              disabled={loading}
            />
          </label>

          <label className="field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              disabled={loading}
            />
          </label>

          {error && (
            <p className="error-message" role="alert">
              {error}
            </p>
          )}

          <button type="submit" disabled={loading} className="sign-in-button">
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </main>
  );
}
