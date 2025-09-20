
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Phone, MapPin, Award } from 'lucide-react';

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

  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="mx-auto max-w-2xl shadow-lg">
        <CardHeader className="items-center space-y-4 text-center">
          <Avatar className="h-24 w-24 text-3xl">
            <AvatarImage src={user.photoURL ?? undefined} alt={userProfile?.name} />
            <AvatarFallback>{getInitials(userProfile?.name)}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="font-headline text-4xl text-primary">{userProfile?.name || 'User'}</CardTitle>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Badge variant={userProfile?.role === 'artisan' ? 'default' : 'secondary'} className="capitalize">{userProfile?.role}</Badge>
              {userProfile?.verified && <Badge variant="secondary" className="border-green-500 text-green-700">Verified</Badge>}
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
             <div className="flex items-center gap-4 rounded-lg bg-muted/50 p-3">
              <Award className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium">Craft: {userProfile?.craft} ({userProfile?.experience} years)</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
