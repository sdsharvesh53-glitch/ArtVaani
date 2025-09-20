
'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Loader2, Sparkles, Tag, Pencil, Mic, Square, AudioLines, Trash2, PencilLine } from 'lucide-react';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
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
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  generateProductListing,
  type GenerateProductListingOutput,
} from '@/ai/flows/generate-product-listing';
import { transcribeAudio } from '@/ai/flows/transcribe-audio';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserProfile } from '@/providers/auth-provider';

export default function ProductGeneratorPage() {
  const { user, userProfile, loading: authLoading } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [productImage, setProductImage] = useState<File | null>(null);
  const [productImageUrl, setProductImageUrl] = useState<string | null>(null);
  const [textDescription, setTextDescription] = useState('');
  
  // Audio recording state
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

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

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      toast({ title: 'Microphone access denied', variant: 'destructive' });
      console.error('Microphone access denied:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const deleteRecording = () => {
      setAudioBlob(null);
      setAudioUrl(null);
  }

  const handleGenerate = async (inputType: 'text' | 'audio') => {
    if (!productImage) {
      toast({ title: 'Missing Product Image', variant: 'destructive' });
      return;
    }
    if (inputType === 'text' && !textDescription) {
      toast({ title: 'Missing Text Description', variant: 'destructive' });
      return;
    }
     if (inputType === 'audio' && !audioBlob) {
      toast({ title: 'Missing Audio Recording', variant: 'destructive' });
      return;
    }
    
    setIsGenerating(true);
    setGeneratedListing(null);
    setEditableListing(null);

    try {
        let description = textDescription;
        if (inputType === 'audio' && audioBlob) {
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            await new Promise<void>((resolve, reject) => {
                reader.onloadend = async () => {
                    try {
                        const audioDataUri = reader.result as string;
                        const { transcript } = await transcribeAudio({ audioDataUri });
                        description = transcript;
                        resolve();
                    } catch (e) {
                        reject(e);
                    }
                };
                reader.onerror = reject;
            });
        }

        const imageReader = new FileReader();
        imageReader.readAsDataURL(productImage);
        await new Promise<void>((resolve, reject) => {
            imageReader.onloadend = async () => {
                try {
                    const base64Image = imageReader.result as string;
                    const result = await generateProductListing({
                      productImage: base64Image,
                      productDescription: description,
                    });
                    setGeneratedListing(result);
                    resolve();
                } catch(e) {
                    reject(e);
                }
            };
            imageReader.onerror = reject;
        });

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


  const handleListingChange = (field: keyof GenerateProductListingOutput, value: string | number | string[]) => {
    if (editableListing) {
      setEditableListing({ ...editableListing, [field]: value });
    }
  };


  const handleSave = async () => {
    if (!editableListing || !user || !productImage) {
      toast({
        title: 'Missing Information',
        description: 'Please ensure an image is selected and content is generated.',
        variant: 'destructive',
      });
      return;
    }
    setIsSaving(true);
    try {
      // 1. Fetch the latest user profile data to ensure rules are met
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (!userDocSnap.exists()) {
        throw new Error('User profile not found.');
      }
      const freshUserProfile = userDocSnap.data() as UserProfile;
       if (freshUserProfile.role !== 'artisan' || freshUserProfile.verificationStatus !== 'verified') {
        throw new Error('You must be a verified artisan to publish products.');
      }

      // 2. Upload image to Firebase Storage
      const imageRef = ref(storage, `products/${user.uid}/${Date.now()}_${productImage.name}`);
      const snapshot = await uploadBytes(imageRef, productImage);
      const imageUrl = await getDownloadURL(snapshot.ref);

      // 3. Prepare data for Firestore
      let tags: string[] = [];
      if (Array.isArray(editableListing.hashtags)) {
        tags = editableListing.hashtags.filter(t => typeof t === 'string' && t.trim() !== '');
      } else if (typeof editableListing.hashtags === 'string') {
        tags = editableListing.hashtags.split(',').map(t => t.trim()).filter(t => t);
      }

      const productData = {
        artisanId: user.uid,
        title: editableListing.productTitle,
        images: [imageUrl],
        descriptionInput: textDescription,
        aiStory: editableListing.productStory,
        aiPrice: Number(editableListing.suggestedPrice) || 0,
        aiTags: tags,
        status: 'published',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        sellerDetails: {
          name: freshUserProfile.name || 'Artisan',
          city: freshUserProfile.city || 'Unknown',
        },
      };

      // 4. Save product to Firestore
      await addDoc(collection(db, 'products'), productData);

      toast({
        title: '✅ Product Published!',
        description: 'Your new product is now live on the marketplace.',
      });
      router.push('/products');
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: '❌ Publish Failed',
        description:
          error instanceof Error
            ? error.message
            : 'Could not save the product. Please try again.',
        variant: 'destructive',
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
              Create a compelling product listing with a photo and a description.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor='product-image'>1. Product Photo</Label>
                <Input id="product-image" type="file" accept="image/*" onChange={handleImageChange} className="file:text-primary"/>
                {productImageUrl && (
                    <div className='mt-4'>
                        <Image src={productImageUrl} alt="Product preview" width={150} height={150} className="rounded-lg object-cover" />
                    </div>
                )}
            </div>
            
            <div className="space-y-2">
              <Label>2. Description (Choose One)</Label>
              <Tabs defaultValue="text" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="text"><PencilLine className="mr-2"/>Text</TabsTrigger>
                  <TabsTrigger value="voice"><Mic className="mr-2"/>Voice</TabsTrigger>
                </TabsList>
                <TabsContent value="text" className="pt-4">
                  <Textarea 
                      id="product-description" 
                      placeholder="e.g., 'A handmade clay pot, painted with traditional motifs from my village.'"
                      value={textDescription}
                      onChange={(e) => setTextDescription(e.target.value)}
                  />
                  <Button onClick={() => handleGenerate('text')} disabled={isGenerating || !productImage || !textDescription} className="mt-4">
                    {isGenerating ? <><Loader2 className="animate-spin" /> Generating...</> : 'Generate with Text'}
                  </Button>
                </TabsContent>
                <TabsContent value="voice" className="pt-4 space-y-4">
                  {!isRecording && !audioBlob && (
                    <Button onClick={startRecording} className="w-full">
                      <Mic /> Start Recording
                    </Button>
                  )}
                  {isRecording && (
                     <Button onClick={stopRecording} variant="destructive" className="w-full">
                      <Square/> Stop Recording
                    </Button>
                  )}
                   {audioUrl && !isRecording && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 p-2 rounded-lg bg-muted">
                        <AudioLines className="text-primary"/>
                        <audio src={audioUrl} controls className="w-full" />
                        <Button variant="ghost" size="icon" onClick={deleteRecording}><Trash2 className="text-destructive"/></Button>
                      </div>
                       <Button onClick={() => handleGenerate('audio')} disabled={isGenerating || !productImage || !audioBlob} className="w-full">
                         {isGenerating ? <><Loader2 className="animate-spin" /> Transcribing & Generating...</> : 'Generate with Voice Note'}
                       </Button>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </CardContent>
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
                        {isSaving && <Loader2 className="animate-spin mr-2" />}
                        {isSaving ? 'Publishing...' : 'Publish to Marketplace'}
                    </Button>
                </CardFooter>
            </Card>
        )}

      </div>
    </div>
  );
}
