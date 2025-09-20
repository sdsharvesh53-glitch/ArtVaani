
'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Loader2, Sparkles, Upload, ShieldAlert, Tag, Pencil } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

import { db, storage } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  generateProductListing,
  type GenerateProductListingOutput,
} from '@/ai/flows/generate-product-listing';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';

export default function ProductGeneratorPage() {
  const { user, userProfile, loading: authLoading } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [productImage, setProductImage] = useState<File | null>(null);
  const [productImageUrl, setProductImageUrl] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  
  const [generatedListing, setGeneratedListing] =
    useState<GenerateProductListingOutput | null>(null);
  
  const [editableListing, setEditableListing] = 
    useState<GenerateProductListingOutput | null>(null);

  const router = useRouter();
  const { toast } = useToast();

  const isVerifiedArtisan = userProfile?.role === 'artisan' && userProfile?.verificationStatus === 'verified';

  useEffect(() => {
      if (!authLoading && !isVerifiedArtisan) {
          toast({
              title: "Verification Required",
              description: "You must be a verified artisan to access this page.",
              variant: "destructive",
          });
          router.push('/dashboard');
      }
  }, [authLoading, isVerifiedArtisan, router, toast]);

  useEffect(() => {
    if (generatedListing) {
      setEditableListing(generatedListing);
    }
  }, [generatedListing]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setProductImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProductImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!productImage || !description) {
      toast({
        title: 'Missing Information',
        description: 'Please provide a product image and a description.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsGenerating(true);
    setGeneratedListing(null);

    const reader = new FileReader();
    reader.readAsDataURL(productImage);
    reader.onloadend = async () => {
        try {
            const base64Image = reader.result as string;
            const result = await generateProductListing({
              productImage: base64Image,
              productDescription: description,
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
    }
  };

  const handleListingChange = (field: keyof GenerateProductListingOutput, value: any) => {
    if (editableListing) {
      setEditableListing({ ...editableListing, [field]: value });
    }
  };


  const handleSave = async () => {
    if (!editableListing || !user || !productImage) {
        return;
    }
    setIsSaving(true);
    try {
        // 1. Upload image to Firebase Storage
        const imageRef = ref(storage, `products/${user.uid}/${Date.now()}_${productImage.name}`);
        const snapshot = await uploadBytes(imageRef, productImage);
        const imageUrl = await getDownloadURL(snapshot.ref);

        // 2. Save product to Firestore
        await addDoc(collection(db, "products"), {
            artisanId: user.uid,
            images: [imageUrl],
            title: editableListing.productTitle,
            descriptionInput: description,
            aiStory: editableListing.productStory,
            aiPrice: Number(editableListing.suggestedPrice) || 0,
            aiTags: Array.isArray(editableListing.hashtags) 
              ? editableListing.hashtags 
              : (editableListing.hashtags as unknown as string).split(',').map(t => t.trim()),
            status: "published",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            sellerDetails: {
              name: userProfile?.name,
              city: userProfile?.city,
            },
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

  if (authLoading || !isVerifiedArtisan) {
      return (
          <div className="container mx-auto px-4 py-12 text-center">
              <Loader2 className="animate-spin mx-auto"/>
              <p>Verifying access...</p>
          </div>
      )
  }


  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <Card className="shadow-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline text-4xl text-primary">
              <Sparkles />
              AI Product Publisher
            </CardTitle>
            <CardDescription>
              Create a compelling product listing with a photo and a few words. Our AI does the rest.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor='product-image'>Product Photo</Label>
                <Input id="product-image" type="file" accept="image/*" onChange={handleImageChange} className="file:text-primary"/>
                {productImageUrl && (
                    <div className='mt-4'>
                        <Image src={productImageUrl} alt="Product preview" width={150} height={150} className="rounded-lg object-cover" />
                    </div>
                )}
            </div>
             <div className="space-y-2">
                <Label htmlFor='product-description'>Description</Label>
                <Textarea 
                    id="product-description" 
                    placeholder="e.g., 'A handmade clay pot, painted with traditional motifs from my village.'"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleGenerate} disabled={isGenerating || !productImage || !description}>
              {isGenerating ? (
                <>
                <Loader2 className="animate-spin" /> Generating...
                </>
              ) : (
                'Generate Listing'
              )}
            </Button>
          </CardFooter>
        </Card>

        {isGenerating && (
             <Card className="mt-8 shadow-lg">
                <CardHeader>
                    <Skeleton className="h-8 w-3/4" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-6 w-full" />
                </CardContent>
                <CardFooter>
                    <Skeleton className="h-10 w-28" />
                </CardFooter>
             </Card>
        )}
        
        {editableListing && (
            <Card className="mt-8 shadow-lg">
                <CardHeader>
                    <div className="flex justify-between items-start gap-4">
                        <div className="flex-grow space-y-2">
                          <Label htmlFor='edit-title'>Product Title</Label>
                          <Input 
                            id="edit-title"
                            value={editableListing.productTitle} 
                            onChange={(e) => handleListingChange('productTitle', e.target.value)} 
                            className="text-3xl text-primary font-headline p-2 h-auto"
                          />
                          <Label htmlFor='edit-price'>Price (INR)</Label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                            <Input
                              id="edit-price"
                              type="number"
                              value={editableListing.suggestedPrice} 
                              onChange={(e) => handleListingChange('suggestedPrice', parseFloat(e.target.value))} 
                              className="pl-7 text-2xl font-semibold text-accent"
                            />
                          </div>
                        </div>
                        {productImageUrl && (
                            <Image src={productImageUrl} alt="Craft sample" width={100} height={100} className="rounded-lg object-cover" />
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor='edit-story'>Product Story</Label>
                      <Textarea 
                        id="edit-story"
                        value={editableListing.productStory} 
                        onChange={(e) => handleListingChange('productStory', e.target.value)} 
                        className="min-h-[150px] text-foreground/90"
                      />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor='edit-tags'>Hashtags (comma-separated)</Label>
                        <div className="relative">
                            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                              id="edit-tags"
                              value={Array.isArray(editableListing.hashtags) ? editableListing.hashtags.join(', ') : editableListing.hashtags}
                              onChange={(e) => handleListingChange('hashtags', e.target.value.split(',').map(t => t.trim()))}
                              className="pl-9"
                            />
                        </div>
                     </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? <Loader2 className="animate-spin" /> : 'Publish to Marketplace'}
                    </Button>
                </CardFooter>
            </Card>
        )}

      </div>
    </div>
  );
}

    