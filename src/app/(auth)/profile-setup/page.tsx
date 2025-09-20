
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { doc, setDoc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';

import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

const profileSetupSchema = z.object({
  name: z.string().min(2, { message: 'Please enter your full name.' }),
  city: z.string().min(2, { message: 'Please enter your city.' }),
  phone: z.string().min(10, { message: 'Please enter a valid phone number.' }),
});

export default function ProfileSetupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { user, loading, userProfile } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof profileSetupSchema>>({
    resolver: zodResolver(profileSetupSchema),
    defaultValues: {
      name: '',
      city: '',
      phone: '',
    },
  });

  useEffect(() => {
    // If profile is already complete, redirect away.
    if (!loading && userProfile?.profileComplete) {
      router.push('/');
    }
    // If not logged in, redirect to login.
    if (!loading && !user) {
        router.push('/login');
    }
  }, [user, userProfile, loading, router]);


  async function onSubmit(values: z.infer<typeof profileSetupSchema>) {
    if (!user) {
        toast({ title: 'Not authenticated', variant: 'destructive' });
        return;
    }
    setIsLoading(true);
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        ...values,
        profileComplete: true,
      }, { merge: true });

      router.push('/');
      toast({
        title: 'Profile Updated!',
        description: 'Welcome to ArtVaani!',
      });
    } catch (error) {
      toast({
        title: 'Update Failed',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (loading || !user) {
      return <div>Loading...</div>
  }

  return (
    <div className="w-full max-w-md">
      <Card className="rounded-2xl shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-4xl text-primary">
            Complete Your Profile
          </CardTitle>
          <CardDescription>
            Just a few more details to get you started.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Jaipur Kala" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="Jaipur" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+91 98765 43210" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full rounded-full" disabled={isLoading}>
                {isLoading && <Loader2 className="animate-spin" />}
                Save & Continue
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
