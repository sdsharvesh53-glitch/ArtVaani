
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Loader2, Sparkles, Upload } from 'lucide-react';

import { db, storage } from '@/lib/firebase';
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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const artisanFormSchema = z.object({
  craftName: z.string().min(2, 'Craft name is required'),
  experience: z.coerce.number().min(0, 'Experience must be a positive number'),
  bio: z.string().min(20, 'Please tell us a bit more about your craft.'),
  sampleImage: z.instanceof(File).refine(file => file.size > 0, 'A sample photo is required.'),
});

export default function ForArtisansPage() {
  const { user, userProfile, isArtisan, loading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof artisanFormSchema>>({
    resolver: zodResolver(artisanFormSchema),
    defaultValues: {
      craftName: '',
      experience: 0,
      bio: '',
    },
  });

  async function onSubmit(values: z.infer<typeof artisanFormSchema>) {
    if (!user) return;
    setIsSubmitting(true);

    try {
      // 1. Upload sample photo to Firebase Storage
      const photoRef = ref(
        storage,
        `artisan-applications/${user.uid}/${values.sampleImage.name}`
      );
      const snapshot = await uploadBytes(photoRef, values.sampleImage);
      const photoUrl = await getDownloadURL(snapshot.ref);

      // 2. Update user document in Firestore
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        role: 'artisan',
        craft: values.craftName,
        experience: values.experience,
        bio: values.bio,
        sampleImages: [photoUrl],
        verificationStatus: 'pending',
      });
      
      toast({
        title: 'Application Submitted!',
        description: 'Your artisan application is under review. We will notify you once it is approved.',
      });

      // Redirect to profile to see the new status
      router.push('/profile');

    } catch (error) {
      console.error('Error submitting artisan application:', error);
      toast({
        title: 'Submission Failed',
        description: 'An error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return <div className="container mx-auto px-4 py-12 text-center">Loading...</div>;
  }
  
  if (!user) {
     return (
       <div className="container mx-auto px-4 py-12 text-center">
         <h1 className="font-headline text-5xl text-primary">Join as an Artisan</h1>
         <p className="mt-4 text-lg text-foreground/80">Please log in or create an account to apply.</p>
         <Button onClick={() => router.push('/login')} className="mt-6 rounded-full">Log In</Button>
       </div>
     );
  }

  if (isArtisan) {
    if (userProfile?.verificationStatus === 'verified') {
        return (
          <div className="container mx-auto px-4 py-12 text-center">
            <h1 className="font-headline text-5xl text-primary">Welcome, Artisan!</h1>
            <p className="mt-4 text-lg text-foreground/80">You are already a verified artisan.</p>
            <Button onClick={() => router.push('/dashboard')} className="mt-6 rounded-full">Go to Dashboard</Button>
          </div>
        );
    }
     if (userProfile?.verificationStatus === 'pending') {
        return (
          <div className="container mx-auto px-4 py-12 text-center">
            <h1 className="font-headline text-5xl text-primary">Application Pending</h1>
            <p className="mt-4 text-lg text-foreground/80">Your application is currently under review. We'll notify you soon!</p>
            <Button onClick={() => router.push('/profile')} className="mt-6 rounded-full">View My Profile</Button>
          </div>
        );
    }
  }

  return (
    <div>
      <section className="relative w-full bg-card py-20">
        <Image
          src="https://picsum.photos/seed/artisan-header/1200/400"
          alt="Artisan working"
          layout="fill"
          objectFit="cover"
          className="absolute inset-0 -z-10 opacity-20"
          data-ai-hint="artisan hands"
        />
        <div className="container relative mx-auto px-4 text-center">
          <h1 className="font-headline text-5xl font-bold text-primary">
            Become an ArtVaani Artisan
          </h1>
          <p className="mx-auto mt-2 max-w-2xl text-lg text-foreground/80">
            Share your craft with the world and grow your business with our powerful AI tools.
          </p>
        </div>
      </section>

      <section className="container mx-auto max-w-3xl px-4 py-12">
        <Card className="rounded-2xl shadow-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline text-3xl text-primary">
              <Sparkles className="h-8 w-8" />
              Your Artisan Application
            </CardTitle>
            <CardDescription>
              Tell us about your unique craft and experience.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="craftName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name of Your Craft</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Block Printing" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="experience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Years of Experience</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="5" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Bio</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the story, technique, and uniqueness of your art..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sampleImage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sample Craft Image</FormLabel>
                      <FormControl>
                         <Input 
                           type="file" 
                           accept="image/*"
                           onChange={(e) => field.onChange(e.target.files ? e.target.files[0] : null)}
                         />
                      </FormControl>
                       <FormDescription>
                        Upload one clear photo of your craft.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full rounded-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    'Submit Application'
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
