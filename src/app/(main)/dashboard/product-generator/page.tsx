
'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Loader2, Sparkles } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

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
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  generateProductListing,
  type GenerateProductListingOutput,
} from '@/ai/flows/generate-product-listing';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProductGeneratorPage() {
  const { user, userProfile, loading } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [generatedListing, setGeneratedListing] =
    useState<GenerateProductListingOutput | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!userProfile?.craft || !userProfile.about || !userProfile.profileImage) {
      toast({
        title: 'Profile Incomplete',
        description: 'Please ensure your craft name, about section, and profile image are set in your artisan profile.',
        variant: 'destructive',
      });
      return;
    }
    setIsGenerating(true);
    setGeneratedListing(null);

    // This is a simple way to get a data URI from a URL.
    // In a real app, you might want a more robust solution that handles CORS.
    const toDataURL = (url: string) => fetch(url)
      .then(response => response.blob())
      .then(blob => new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsDataURL(blob)
      }));
      
    try {
        const craftImage = await toDataURL(userProfile.profileImage) as string;
        const result = await generateProductListing({
          craftName: userProfile.craft,
          artisanStory: userProfile.about,
          craftImage: craftImage,
        });
        setGeneratedListing(result);
    } catch (error) {
      console.error('Error generating product listing:', error);
      toast({
        title: 'Generation Failed',
        description: 'Could not generate listing. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!generatedListing || !user || !userProfile) {
        return;
    }
    setIsSaving(true);
    try {
        await addDoc(collection(db, "products"), {
            title: generatedListing.productTitle,
            description: generatedListing.productDescription,
            price: generatedListing.suggestedPrice,
            hashtags: [], // The AI doesn't generate hashtags yet
            imageUrl: userProfile.profileImage,
            artisanId: user.uid,
            reviews: [],
            sellerDetails: {
              name: userProfile.name,
              city: userProfile.city,
            },
            createdAt: serverTimestamp(),
        });
        toast({
            title: "Product Saved!",
            description: "Your new product listing is now live.",
        });
        router.push("/products");
    } catch (error) {
        console.error("Error saving product:", error);
        toast({
            title: "Save Failed",
            description: "Could not save the product. Please try again.",
            variant: "destructive"
        });
    } finally {
        setIsSaving(false);
    }
  };


  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <Card className="shadow-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline text-4xl text-primary">
              <Sparkles />
              AI Product Listing Generator
            </CardTitle>
            <CardDescription>
              Let our AI create a compelling product listing for your craft based on your artisan profile.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={handleGenerate} disabled={isGenerating || loading}>
              {isGenerating ? (
                <Loader2 className="animate-spin" />
              ) : (
                'Generate Listing'
              )}
            </Button>
            <p className="mt-2 text-xs text-muted-foreground">Uses your profile's craft name, about section, and sample photo.</p>
          </CardContent>
        </Card>

        {isGenerating && (
             <Card className="mt-8 shadow-lg">
                <CardHeader>
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-6 w-24" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-20 w-full" />
                </CardContent>
                <CardFooter>
                    <Skeleton className="h-10 w-28" />
                </CardFooter>
             </Card>
        )}
        
        {generatedListing && (
            <Card className="mt-8 shadow-lg">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-3xl text-primary">{generatedListing.productTitle}</CardTitle>
                            <p className="text-2xl font-semibold text-accent">₹{generatedListing.suggestedPrice.toFixed(2)}</p>
                        </div>
                        {userProfile?.profileImage && (
                            <Image src={userProfile.profileImage} alt="Craft sample" width={80} height={80} className="rounded-lg object-cover" />
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                     <p className="text-foreground/90">{generatedListing.productDescription}</p>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? <Loader2 className="animate-spin" /> : 'Save to Products'}
                    </Button>
                </CardFooter>
            </Card>
        )}

      </div>
    </div>
  );
}
