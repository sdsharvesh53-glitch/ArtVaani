
'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { doc, updateDoc } from 'firebase/firestore';
import { Camera, CheckCircle, Loader2, ShieldCheck, XCircle } from 'lucide-react';

import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  verifyArtisanIdentity,
  VerifyArtisanIdentityOutput,
} from '@/ai/flows/verify-artisan-identity';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function VerifyIdentityPage() {
  const { user, userProfile, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [verificationResult, setVerificationResult] =
    useState<VerifyArtisanIdentityOutput | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading) {
      if (!user || userProfile?.role !== 'artisan' || userProfile?.verificationStatus !== 'pending') {
        toast({ title: 'Access Denied', description: 'This page is for pending artisan verification only.', variant: 'destructive'});
        router.push('/profile');
      }
    }
  }, [user, userProfile, authLoading, router, toast]);

  useEffect(() => {
    const getCameraPermission = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Not Supported',
          description: 'Your browser does not support camera access.',
        });
        return;
      }
      
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
      }
    };
    getCameraPermission();
  }, []);

  const handleVerify = async () => {
    if (!videoRef.current || !canvasRef.current || !user || !userProfile?.city) {
      toast({ title: 'Error', description: 'Could not initialize verification.', variant: 'destructive' });
      return;
    }
    
    setIsLoading(true);
    setVerificationResult(null);

    // 1. Capture photo
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
    const photoDataUri = canvas.toDataURL('image/jpeg');

    // 2. Get GPS location
    if (!navigator.geolocation) {
       toast({ title: 'GPS Not Supported', description: 'Your browser does not support geolocation.', variant: 'destructive' });
       setIsLoading(false);
       return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const gpsLocation = `${position.coords.latitude}, ${position.coords.longitude}`;

        try {
          // 3. Call Genkit flow
          const result = await verifyArtisanIdentity({
            photoDataUri,
            gpsLocation,
            declaredCity: userProfile.city!,
          });
          setVerificationResult(result);

          // 4. Update Firestore if verified
          if (result.isVerified) {
            const userDocRef = doc(db, 'users', user.uid);
            await updateDoc(userDocRef, {
              verificationStatus: 'verified',
            });
            toast({
              title: 'Verification Successful!',
              description: 'You are now a verified artisan.',
            });
          } else {
             toast({
              title: 'Verification Failed',
              description: 'Your identity could not be verified. Please check the results.',
              variant: 'destructive'
            });
          }
        } catch (error) {
          console.error('Verification failed:', error);
          toast({ title: 'Verification Error', description: 'An unexpected error occurred.', variant: 'destructive' });
        } finally {
          setIsLoading(false);
        }
      },
      (error) => {
        console.error('GPS error:', error);
        toast({ title: 'GPS Error', description: 'Could not retrieve your location.', variant: 'destructive' });
        setIsLoading(false);
      }
    );
  };
  
  if (authLoading) {
    return <div className="container text-center py-12">Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="mx-auto max-w-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline text-4xl text-primary">
            <ShieldCheck />
            Artisan Identity Verification
          </CardTitle>
          <CardDescription>
            Please allow camera and location access. We'll take a live photo and check your location to verify your identity.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted">
            <video ref={videoRef} className="h-full w-full object-cover" autoPlay playsInline muted />
             <Camera className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-16 w-16 text-muted-foreground/50" />
            <canvas ref={canvasRef} className="hidden"></canvas>
          </div>

          {hasCameraPermission === false && (
            <Alert variant="destructive">
              <AlertTitle>Camera Access Denied</AlertTitle>
              <AlertDescription>
                Please enable camera permissions in your browser settings to continue.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={handleVerify} disabled={isLoading || !hasCameraPermission} className="w-full rounded-full">
            {isLoading ? <Loader2 className="animate-spin" /> : 'Start Verification'}
          </Button>
        </CardFooter>
      </Card>
      
      {verificationResult && (
        <Card className="mx-auto mt-8 max-w-2xl shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center gap-3">
                    {verificationResult.isVerified ? (
                        <CheckCircle className="text-green-500" />
                    ) : (
                        <XCircle className="text-red-500" />
                    )}
                    Verification Result
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-foreground/80">{verificationResult.verificationResult}</p>
            </CardContent>
            {verificationResult.isVerified && (
                <CardFooter>
                    <Button onClick={() => router.push('/dashboard')} className="w-full rounded-full">
                        Go to Dashboard
                    </Button>
                </CardFooter>
            )}
        </Card>
      )}

    </div>
  );
}
