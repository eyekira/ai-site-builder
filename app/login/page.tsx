'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [googleEnabled, setGoogleEnabled] = useState(false);
  const [step, setStep] = useState<'login' | 'signup'>('login');
  const returnTo = searchParams.get('returnTo');
  const safeReturnTo = returnTo && returnTo.startsWith('/') ? returnTo : '/dashboard';

  useEffect(() => {
    const loadProviders = async () => {
      try {
        const response = await fetch('/api/auth/providers');
        if (!response.ok) {
          return;
        }
        const providers = (await response.json()) as Record<string, { id: string }>;
        setGoogleEnabled(Boolean(providers.google));
      } catch {
        setGoogleEnabled(false);
      }
    };

    loadProviders();
  }, []);

const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  setError(null);

  const trimmedPassword = password.trim();
  if (trimmedPassword.length < 6) {
    setError('Password must be at least 6 characters.');
    return;
  }

    startTransition(async () => {
      try {
        let shouldSignup = step === 'signup';
        if (step === 'login') {
          const checkResponse = await fetch(`/api/auth/check-email?email=${encodeURIComponent(email)}`);
          if (checkResponse.ok) {
            const data = (await checkResponse.json()) as { exists?: boolean };
            shouldSignup = !data.exists;
          }
        }

        if (shouldSignup && step === 'login') {
          setStep('signup');
          setError('Please enter your name and phone number to create an account.');
          return;
        }

        if (shouldSignup && (!name.trim() || !phone.trim())) {
          setError('Please enter your name and phone number to create an account.');
          return;
        }

        const result = await signIn('credentials', {
          redirect: false,
          email,
          password,
          ...(shouldSignup ? { name, phone } : {}),
        });

        if (result?.error) {
          const message = shouldSignup
            ? 'Sign up failed. Please check your information.'
            : result.error === 'CredentialsSignin'
              ? 'Please check your email or password.'
              : result.error;
          throw new Error(message);
        }

        router.push(safeReturnTo);
        router.refresh();
      } catch (requestError) {
        const message = requestError instanceof Error ? requestError.message : 'Login failed';
        setError(message);
      }
    });
  };

  return (
    <section className="mx-auto flex w-full max-w-xl flex-col gap-6">
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Log in to save your drafts to your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button
              type="button"
              variant="outline"
              disabled={!googleEnabled || isPending}
              onClick={() => signIn('google', { callbackUrl: safeReturnTo })}
              className="w-full"
            >
              Continue with Google
            </Button>
            {!googleEnabled && <p className="text-xs text-muted-foreground">Google login is not configured yet.</p>}
          </div>
          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            or
            <span className="h-px flex-1 bg-border" />
          </div>
          <form className="space-y-4" onSubmit={onSubmit}>
            <label className="block space-y-1 text-sm font-medium">
              Email
              <Input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
              />
            </label>
            <label className="block space-y-1 text-sm font-medium">
              Password
              <Input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 6 characters"
                required
              />
            </label>
            {step === 'login' && (
              <p className="text-xs text-muted-foreground">
                If you do not have an account, enter your name and phone number in the next step to sign up.
              </p>
            )}
            {step === 'signup' && (
              <>
                <label className="block space-y-1 text-sm font-medium">
                  Name
                  <Input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Your name"
                    required
                  />
                </label>
                <label className="block space-y-1 text-sm font-medium">
                  Phone
                  <Input
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="01012345678"
                    required
                  />
                </label>
              </>
            )}
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? 'Signing in…' : step === 'signup' ? 'Create account' : 'Continue with email'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
