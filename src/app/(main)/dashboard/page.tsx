
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Palette, BookOpen, ShieldCheck } from 'lucide-react';
import Link from 'next/link';


export default function DashboardPage() {
  const { isArtisan, loading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
        router.push('/login');
    }
    else if (!loading && !isArtisan) {
      // Redirect non-artisans or show an unauthorized message
      router.push('/products');
    }
  }, [isArtisan, loading, user, router]);

  if (loading) {
    return <div className="container mx-auto px-4 py-12 text-center">Loading dashboard...</div>;
  }
  
  if (!isArtisan) {
    return <div className="container mx-auto px-4 py-12 text-center">Redirecting...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="mb-8 text-center font-headline text-5xl font-bold text-primary">
        Artisan Dashboard
      </h1>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2">
        <Card className="transform transition-transform hover:scale-105 hover:shadow-xl">
          <Link href="/dashboard/product-generator">
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
          <Link href="/dashboard/identity-verification">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="font-headline text-2xl text-primary">Identity Verification</CardTitle>
              <ShieldCheck className="h-6 w-6 text-accent" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground/80">
                Verify your identity to earn a trusted badge on your profile.
              </p>
            </CardContent>
          </Link>
        </Card>
      </div>
    </div>
  );
}
