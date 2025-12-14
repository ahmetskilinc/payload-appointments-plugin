'use client';

import Link from 'next/link';
import { useState } from 'react';

import { Button } from '../../../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { signup } from '../actions/auth';

export default function SignupPageClient() {
  const [error, setError] = useState<null | string>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const result = await signup(formData);
      if (result?.error) {
        setError(result.error);
      }
    } catch {
      setError('An error occurred while signing up');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 py-10 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-gray-200/30 rounded-full blur-3xl animate-pulse-soft" />
        <div
          className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-slate-200/30 rounded-full blur-3xl animate-pulse-soft"
          style={{ animationDelay: '1s' }}
        />
      </div>

      <Card className="w-full max-w-md border-0 shadow-2xl shadow-gray-900/10 bg-white/80 backdrop-blur-xl animate-fade-in-up">
        <CardHeader className="text-center pb-2 pt-8">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gray-900 flex items-center justify-center mb-5 shadow-xl shadow-gray-900/30 animate-float">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z"
              />
            </svg>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Create an account</CardTitle>
          <CardDescription className="text-gray-500 mt-1">
            Get started with your appointment bookings
          </CardDescription>
        </CardHeader>
        <form action={handleSubmit}>
          <CardContent className="space-y-5 pt-6 px-8">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-gray-700 font-medium">
                  First Name
                </Label>
                <Input
                  id="firstName"
                  name="firstName"
                  required
                  type="text"
                  placeholder="John"
                  className="h-12 border-gray-200 bg-gray-50/50 focus:bg-white focus:border-gray-400 focus:ring-4 focus:ring-gray-500/10 rounded-xl transition-all duration-200"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-gray-700 font-medium">
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  name="lastName"
                  required
                  type="text"
                  placeholder="Doe"
                  className="h-12 border-gray-200 bg-gray-50/50 focus:bg-white focus:border-gray-400 focus:ring-4 focus:ring-gray-500/10 rounded-xl transition-all duration-200"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 font-medium">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                required
                type="email"
                placeholder="you@example.com"
                className="h-12 border-gray-200 bg-gray-50/50 focus:bg-white focus:border-gray-400 focus:ring-4 focus:ring-gray-500/10 rounded-xl transition-all duration-200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 font-medium">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                required
                type="password"
                placeholder="••••••••"
                className="h-12 border-gray-200 bg-gray-50/50 focus:bg-white focus:border-gray-400 focus:ring-4 focus:ring-gray-500/10 rounded-xl transition-all duration-200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                required
                type="password"
                placeholder="••••••••"
                className="h-12 border-gray-200 bg-gray-50/50 focus:bg-white focus:border-gray-400 focus:ring-4 focus:ring-gray-500/10 rounded-xl transition-all duration-200"
              />
            </div>
            {error && (
              <div className="flex items-center gap-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl p-4 animate-scale-in">
                <svg
                  className="w-5 h-5 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                  />
                </svg>
                {error}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex-col gap-4 px-8 pb-8">
            <Button
              className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white border-0 shadow-lg shadow-gray-900/25 hover:shadow-xl hover:shadow-gray-900/30 text-base font-medium transition-all duration-300 hover:-translate-y-0.5"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </Button>
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-400">or</span>
              </div>
            </div>
            <p className="text-sm text-gray-500 text-center">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-gray-900 hover:text-gray-500 font-semibold transition-colors"
              >
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
