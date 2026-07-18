import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useLocation, useNavigate, type Location } from 'react-router-dom';
import { AlertCircle, Boxes, Loader2, Lock, Mail } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ApiClientError } from '@/lib/apiClient';
import { withColdStartRetry } from '@/lib/coldStart';
import { useAuth } from './useAuth';
import { loginFormSchema, type LoginFormValues } from './loginSchema';

// Public demo credentials, so a visitor (e.g. a recruiter) can look around.
const DEMO_EMAIL = 'admin@gmail.com';
const DEMO_PASSWORD = '12345678';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation() as Location & { state?: { from?: string } };
  const [formError, setFormError] = useState<string | null>(null);
  const [waking, setWaking] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: '', password: '' },
  });

  const submit = async (values: LoginFormValues) => {
    setFormError(null);
    setWaking(false);
    // A sleeping free-tier server also just responds slowly, so hint after 3s.
    const slowTimer = window.setTimeout(() => setWaking(true), 3000);
    try {
      await withColdStartRetry(() => login(values), () => setWaking(true));
      navigate(location.state?.from ?? '/', { replace: true });
    } catch (error) {
      setFormError(
        error instanceof ApiClientError ? error.message : 'Something went wrong. Please try again.',
      );
    } finally {
      window.clearTimeout(slowTimer);
      setWaking(false);
    }
  };

  const onSubmit = handleSubmit(submit);

  // Fill the demo credentials into the form (so they're visible) and sign in.
  const onDemoLogin = () => {
    setValue('email', DEMO_EMAIL, { shouldValidate: true });
    setValue('password', DEMO_PASSWORD, { shouldValidate: true });
    void submit({ email: DEMO_EMAIL, password: DEMO_PASSWORD });
  };

  return (
    <div className="flex min-h-full items-center justify-center bg-background px-4 py-12">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="relative mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-fg">
            <Boxes className="h-6 w-6" />
            <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-accent ring-2 ring-background" />
          </span>
          <h1 className="text-xl font-semibold text-foreground">Sign in to CoreSphere</h1>
          <p className="mt-1 text-sm text-muted-fg">Enterprise Resource Planning</p>
        </div>

        <form
          onSubmit={onSubmit}
          noValidate
          className="space-y-4 rounded-xl border border-border bg-surface p-6 shadow-sm"
        >
          {formError && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-lg bg-danger/10 p-3 text-sm text-danger"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {waking && !formError && (
            <div
              role="status"
              className="flex items-start gap-2 rounded-lg bg-primary/10 p-3 text-sm text-foreground"
            >
              <Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-primary" />
              <span>Waking up the server — this can take up to a minute on the first visit.</span>
            </div>
          )}

          <TextField
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            leadingIcon={<Mail className="h-4 w-4" />}
            error={errors.email?.message}
            {...register('email')}
          />

          <TextField
            label="Password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            leadingIcon={<Lock className="h-4 w-4" />}
            error={errors.password?.message}
            {...register('password')}
          />

          <Button type="submit" fullWidth isLoading={isSubmitting}>
            Sign in
          </Button>

          <div className="space-y-2 border-t border-border pt-4">
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={onDemoLogin}
              disabled={isSubmitting}
            >
              Explore the demo
            </Button>
            <p className="text-center text-xs text-muted-fg">
              Signs you in as{' '}
              <span className="font-medium text-foreground">{DEMO_EMAIL}</span> · password{' '}
              <span className="font-medium text-foreground">{DEMO_PASSWORD}</span>
            </p>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-muted-fg">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-medium text-primary hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
