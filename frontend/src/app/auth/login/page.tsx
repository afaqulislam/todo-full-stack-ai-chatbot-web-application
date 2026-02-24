'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/src/utils/api';
import { useAuth } from '../../contexts/auth-context';
import { useNotification } from '@/src/components/notifications';
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '@/src/components/ui';

export default function LoginPage() {
  const router = useRouter();
  const { login, authState } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const { showNotification } = useNotification();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect authenticated users to dashboard - only after auth state is determined
  useEffect(() => {
    if (authState === 'authenticated') {
      router.replace('/dashboard');
    }
  }, [authState, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return; // Prevent multiple submissions

    setIsSubmitting(true);
    setError('');

    try {
      // Validate inputs before making API call
      if (!formData.email.trim() || !formData.password) {
        setError('Please enter both email and password.');
        setIsSubmitting(false);
        return;
      }

      // Call the backend login API using the utility
      await authApi.login(formData.email, formData.password);

      // Update auth context state - this will verify the user is authenticated
      await login();

      // Wait to ensure the cookie is properly committed to browser storage
      // and available for subsequent requests before redirecting
      await new Promise(resolve => setTimeout(resolve, 200));

      // Double-check authentication status before redirecting
      // This ensures the user is definitely authenticated before navigating
      const currentUser = await authApi.getUser();
      if (!currentUser) {
        // If user is not authenticated after login, show error
        setError('Authentication verification failed. Please try logging in again.');
        setIsSubmitting(false);
        return;
      }

      // Show success notification
      showNotification('success', 'Login successful! Welcome back.');

      // Redirect to dashboard after successful authentication
      // Use replace to prevent back navigation to login after login
      router.replace('/dashboard');
    } catch (error: any) {
      // Don't log the error message to avoid exposing it in console
      console.error("AUTH ERROR: Login failed"); // Generic log message
      setError(
        error.message ||
        "Unexpected error from server"
      );

      // Show error notification
      showNotification('error', error.message || 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Redirect if already authenticated
  if (authState === 'authenticated') {
    return null; // Redirect happens in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md overflow-hidden">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto bg-gradient-to-r from-blue-600 to-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="4" y="6" width="24" height="20" rx="3" fill="white" fillOpacity="0.9" />
              <path d="M12 12H20M12 16H18M12 20H16" stroke="#1E3A8A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M8 6V26" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 mb-2">Welcome back</CardTitle>
          <p className="text-gray-700">
            Sign in to your Taskory account
          </p>
        </CardHeader>

        <CardContent>
          {error && (
            <div className="mb-6 p-3 bg-red-50 text-red-700 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
              />
            </div>

            <div>
              {/* Label + Forgot */}
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700"
                >
                  Password
                </label>

                <Link
                  href="/auth/forgot-password"
                  className="text-sm font-medium text-blue-600 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Input wrapper */}
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="pr-12"
                />

                {/* PROFESSIONAL toggle button */}
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="
        absolute inset-y-0 right-2
        flex items-center justify-center
        w-9 h-9
        rounded-md
        text-gray-500
        hover:text-gray-800
        hover:bg-gray-100
        transition-colors
        focus:outline-none
        focus:ring-2 focus:ring-blue-500/40
      "
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    /* Eye Off – clean & minimal */
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.8}
                        d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c1.003 0 1.973-.124 2.897-.356M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.774 3.162 10.066 7.5a10.48 10.48 0 01-4.293 5.774M6.228 6.228l11.544 11.544"
                      />
                    </svg>
                  ) : (
                    /* Eye */
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.8}
                        d="M2.036 12.322C3.423 7.943 7.523 4.5 12 4.5c4.478 0 8.578 3.443 9.964 7.822-1.386 4.379-5.486 7.822-9.964 7.822-4.477 0-8.577-3.443-9.964-7.822z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.8}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full py-3 font-semibold"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </div>
              ) : (
                'Sign in to your account'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-700">
              Don&apos;t have an account?{' '}
              <Link href="/auth/signup" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline">
                Sign up for free
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}