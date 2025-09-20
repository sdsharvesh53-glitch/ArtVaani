import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { LoginForm } from '@/components/auth/login-form';

export default function LoginPage() {
  return (
    <div className="w-full max-w-md">
      <Card className="rounded-2xl shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-4xl text-primary">
            Welcome Back
          </CardTitle>
          <CardDescription>
            Log in to your Craftopia account to continue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
      <p className="mt-4 text-center text-sm text-foreground/80">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="font-semibold text-primary hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
