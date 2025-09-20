
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Sparkles, Palette, BookOpen, ShieldCheck, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


export default function DashboardPage() {
  const { isArtisan, userProfile, loading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
        router.push('/login');
    }
    else if (!loading && !isArtisan) {
      router.push('/products');
    }
  }, [isArtisan, loading, user, router]);

  if (loading) {
    return <div className="container mx-auto px-4 py-12 text-center">Loading dashboard...</div>;
  }
  
  if (!isArtisan) {
    return <div className="container mx-auto px-4 py-12 text-center">Redirecting...</div>;
  }

  const isVerified = userProfile?.verificationStatus === 'verified';

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="mb-8 text-center font-headline text-5xl font-bold text-primary">
        Artisan Dashboard
      </h1>
      
      {!isVerified && (
        <Alert variant="destructive" className="mb-8 max-w-2xl mx-auto">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Verification Required</AlertTitle>
          <AlertDescription>
            Your account is currently{' '}
            <span className="font-semibold capitalize">{userProfile?.verificationStatus}</span>.
            You will be able to upload products once your application is approved.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2">
        <Card className={`transform transition-transform hover:scale-105 hover:shadow-xl ${!isVerified && 'opacity-50 cursor-not-allowed'}`}>
          <Link href={isVerified ? "/dashboard/product-generator" : "#"} aria-disabled={!isVerified} tabIndex={!isVerified ? -1 : undefined}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="font-headline text-2xl text-primary">AI Product Listing</CardTitle>
              <Sparkles className="h-6 w-6 text-accent" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground/80">
                Generate catchy titles, descriptions, and prices for your products.
              </p>
            </CardContent>
          </Link>
        </Card>

        <Card className="transform transition-transform hover:scale-105 hover:shadow-xl">
          <Link href="/profile">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="font-headline text-2xl text-primary">My Profile</CardTitle>
              <ShieldCheck className="h-6 w-6 text-accent" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground/80">
                View and manage your artisan profile and verification status.
              </p>
            </CardContent>
          </Link>
        </Card>
      </div>
    </div>
  );
}
