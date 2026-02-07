'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [googleEnabled, setGoogleEnabled] = useState(false);
  const [step, setStep] = useState<'login' | 'signup'>('login');

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
    setError('비밀번호는 최소 6자 이상이어야 합니다.');
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
          setError('이름과 전화번호를 입력해 계정을 생성해주세요.');
          return;
        }

        if (shouldSignup && (!name.trim() || !phone.trim())) {
          setError('이름과 전화번호를 입력해 계정을 생성해주세요.');
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
            ? '회원가입에 실패했습니다. 정보를 확인해주세요.'
            : result.error === 'CredentialsSignin'
              ? '이메일 또는 비밀번호를 확인해주세요.'
              : result.error;
          throw new Error(message);
        }

        router.push('/dashboard');
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
          <CardDescription>로그인하면 작성한 드래프트가 계정에 저장됩니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button
              type="button"
              variant="outline"
              disabled={!googleEnabled || isPending}
              onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
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
                계정이 없다면 다음 단계에서 이름과 전화번호를 입력해 가입할 수 있어요.
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
