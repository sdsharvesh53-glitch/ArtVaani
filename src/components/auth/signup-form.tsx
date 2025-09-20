'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Mail, Phone, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { auth, db } from '@/lib/firebase';
import { Icons } from '../icons';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters.' }),
});

export function SignupForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const createInitialUserProfile = async (
    uid: string,
    email: string | null
  ) => {
    const userDocRef = doc(db, 'users', uid);
    await setDoc(userDocRef, {
      uid,
      email,
      role: 'buyer',
      profileComplete: false,
      createdAt: new Date(),
    });
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );
      await createInitialUserProfile(
        userCredential.user.uid,
        userCredential.user.email
      );
      router.push('/profile-setup');
      toast({
        title: 'Account Created',
        description: "Let's set up your profile.",
      });
    } catch (error: any) {
      toast({
        title: 'Sign Up Failed',
        description:
          error.code === 'auth/email-already-in-use'
            ? 'This email is already registered.'
            : 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      await createInitialUserProfile(result.user.uid, result.user.email);
      router.push('/profile-setup');
      toast({
        title: 'Account Created',
        description: "Let's set up your profile.",
      });
    } catch (error) {
      toast({
        title: 'Google Sign-In Failed',
        description: 'Could not sign in with Google. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="name@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full rounded-full" disabled={isLoading}>
            {isLoading ? <Loader2 className="animate-spin" /> : <Mail />}
            Sign Up with Email
          </Button>
        </form>
      </Form>
      <div className="relative">
        <Separator />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-sm text-muted-foreground">
          OR
        </span>
      </div>
      <div className="space-y-2">
        <Button
          variant="outline"
          className="w-full rounded-full"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
        >
          <Icons.google className="mr-2 h-5 w-5" />
          Continue with Google
        </Button>
        <Button variant="outline" className="w-full rounded-full" disabled>
          <Phone className="mr-2 h-4 w-4" />
          Continue with Phone (Coming Soon)
        </Button>
      </div>
    </div>
  );
}
