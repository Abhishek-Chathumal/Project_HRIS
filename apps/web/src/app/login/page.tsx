'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import { useAuthStore } from '@/lib/stores';
import { toast } from '@/components/toast';
import { createLogger } from '@/lib/logger';
import styles from './login.module.css';

const log = createLogger('LoginPage');

export default function LoginPage() {
  const router = useRouter();
  const { setUser, isAuthenticated } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      log.info('Login', `Attempting login for ${email}`);

      const res = await api.post<{
        data: { accessToken: string; refreshToken: string; expiresIn: number };
      }>('/auth/login', { email, password });

      localStorage.setItem('accessToken', res.data.accessToken);
      localStorage.setItem('refreshToken', res.data.refreshToken);

      // Fetch user profile to populate auth store
      try {
        const me = await api.get<{
          data: { id: string; email: string; roles: string[] };
        }>('/auth/me');
        setUser(me.data);
      } catch {
        // Non-critical — dashboard will re-hydrate
      }

      log.info('Login', `Login successful for ${email}`);
      toast.success('Welcome back!', 'Redirecting to dashboard...');
      router.push('/dashboard');
    } catch (err: any) {
      const message = err.message || 'An error occurred';
      setError(message);
      log.warn('Login', `Login failed for ${email}: ${message}`);
      toast.error('Login Failed', message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles['login-page']}>
      {/* Left Brand Panel */}
      <div className={styles['login-brand']}>
        <div className={styles['login-brand-content']}>
          <div className={styles['login-logo']}>
            <div className={styles['login-logo-icon']}>H</div>
            <span className={styles['login-logo-text']}>Project HRIS</span>
          </div>
          <p className={styles['login-tagline']}>
            Enterprise-grade Human Resource Information System. Secure, intelligent, and built for
            scale.
          </p>
          <ul className={styles['login-features']}>
            <li>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              Complete HR lifecycle management
            </li>
            <li>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              Policy-driven adaptive workflows
            </li>
            <li>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              ML-powered analytics & insights
            </li>
            <li>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              Self-healing infrastructure
            </li>
            <li>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              GDPR, SOC 2 & ISO 27001 compliant
            </li>
          </ul>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className={styles['login-form-wrapper']}>
        <div className={styles['login-form-container']}>
          <div className={styles['login-form-header']}>
            <h1>Welcome back</h1>
            <p>Sign in to your HRIS account to continue</p>
          </div>

          {error && (
            <div
              style={{
                background: 'var(--danger-light)',
                color: 'var(--danger)',
                padding: 'var(--space-3) var(--space-4)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                marginBottom: 'var(--space-4)',
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles['login-form']}>
            <div className={styles['login-form-field']}>
              <label className="label" htmlFor="email">
                Email address
              </label>
              <input
                id="email"
                type="email"
                className="input"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                autoFocus
              />
            </div>

            <div className={styles['login-form-field']}>
              <label className="label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                minLength={8}
              />
            </div>

            <div className={styles['login-remember']}>
              <label>
                <input type="checkbox" /> Remember me
              </label>
              <a href="/forgot-password">Forgot password?</a>
            </div>

            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? (
                <>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    style={{ animation: 'spin 1s linear infinite' }}
                  >
                    <circle cx="12" cy="12" r="10" strokeDasharray="60" strokeDashoffset="20" />
                  </svg>
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <div className={styles['login-footer']}>
            <p>Protected by enterprise-grade security</p>
            <p style={{ marginTop: 'var(--space-1)' }}>TLS 1.3 · AES-256 · SOC 2 Type II</p>
          </div>
        </div>
      </div>
    </div>
  );
}
