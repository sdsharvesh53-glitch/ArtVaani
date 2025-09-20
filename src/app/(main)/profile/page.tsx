
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Phone, MapPin, Award, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export default function ProfilePage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const getInitials = (name?: string | null) => {
    return name
      ? name
          .split(' ')
          .map((n) => n[0])
          .join('')
      : user?.email?.charAt(0).toUpperCase() ?? '?';
  };
  
  if (loading || !user) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="mx-auto max-w-2xl">
          <CardHeader className="items-center text-center">
             <Skeleton className="h-24 w-24 rounded-full" />
             <Skeleton className="mt-4 h-8 w-48" />
             <Skeleton className="mt-2 h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const getVerificationBadgeClass = (status?: string) => {
    switch (status) {
      case 'verified':
        return 'border-green-500 text-green-700';
      case 'pending':
        return 'border-yellow-500 text-yellow-700';
      case 'rejected':
        return 'border-red-500 text-red-700';
      default:
        return 'hidden';
    }
  };

  const isPendingArtisan = userProfile?.role === 'artisan' && userProfile?.verificationStatus === 'pending';


  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="mx-auto max-w-2xl shadow-lg">
        <CardHeader className="items-center space-y-4 text-center">
          <Avatar className="h-24 w-24 text-3xl">
            <AvatarImage src={userProfile?.profileImage ?? user.photoURL ?? undefined} alt={userProfile?.name} />
            <AvatarFallback>{getInitials(userProfile?.name)}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="font-headline text-4xl text-primary">{userProfile?.name || 'User'}</CardTitle>
            <div className="mt-2 flex items-center justify-center gap-2">
              <Badge variant={userProfile?.role === 'artisan' ? 'default' : 'secondary'} className="capitalize">{userProfile?.role}</Badge>
              {userProfile?.role === 'artisan' && (
                <Badge variant="secondary" className={cn("capitalize", getVerificationBadgeClass(userProfile?.verificationStatus))}>
                  {userProfile?.verificationStatus}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="flex items-center gap-4 rounded-lg bg-muted/50 p-3">
            <User className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium">{userProfile?.name || 'Not set'}</span>
          </div>
          <div className="flex items-center gap-4 rounded-lg bg-muted/50 p-3">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium">{user.email}</span>
          </div>
          <div className="flex items-center gap-4 rounded-lg bg-muted/50 p-3">
            <Phone className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium">{userProfile?.phone || 'Not set'}</span>
          </div>
           <div className="flex items-center gap-4 rounded-lg bg-muted/50 p-3">
            <MapPin className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium">{userProfile?.city || 'Not set'}</span>
          </div>
          {userProfile?.role === 'artisan' && (
             <>
              <div className="flex items-center gap-4 rounded-lg bg-muted/50 p-3">
                <Award className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">Craft: {userProfile?.craft} ({userProfile?.experience} years)</span>
              </div>
              <div className="flex items-center gap-4 rounded-lg bg-muted/50 p-3">
                <Award className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">Bio: {userProfile?.bio}</span>
              </div>
             </>
          )}
        </CardContent>
         {isPendingArtisan && (
            <CardFooter className="flex-col gap-4 pt-4">
               <p className="text-sm text-center text-muted-foreground">
                Your application is pending. Please complete identity verification to start selling.
              </p>
              <Button onClick={() => router.push('/profile/verify-identity')} className="w-full rounded-full">
                <ShieldCheck className="mr-2 h-4 w-4" />
                Verify Identity
              </Button>
            </CardFooter>
        )}
      </Card>
    </div>
  );
}
