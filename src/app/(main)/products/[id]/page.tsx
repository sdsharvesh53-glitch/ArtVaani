
'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/hooks/use-cart';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, Star } from 'lucide-react';
import { type Product } from '../page';

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, 'products', params.id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() } as Product);
        } else {
          notFound();
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        toast({
          title: "Error",
          description: "Could not fetch product details.",
          variant: "destructive"
        })
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params.id, toast]);
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          <CardHeader>
             <Skeleton className="h-[400px] w-full rounded-lg" />
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-48" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!product) {
    return null; // notFound() is called in useEffect
  }

    const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.title,
      price: `₹${product.aiPrice.toFixed(2)}`,
      image: product.images[0],
      quantity: 1,
      hint: product.aiTags[0] || 'craft',
    });
    toast({
      title: 'Added to cart',
      description: `${product.title} has been added to your cart.`,
    });
  };

  return (
    <div className="container mx-auto px-4 py-12">
       <Card className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 p-4 shadow-lg rounded-2xl">
        <CardHeader className="p-0">
          <Image 
            src={product.images[0]}
            alt={product.title}
            width={600}
            height={600}
            className="w-full h-auto object-cover rounded-lg"
          />
        </CardHeader>

        <div className="flex flex-col justify-center">
            <CardHeader>
              <CardTitle className="font-headline text-5xl text-primary">{product.title}</CardTitle>
              <CardDescription className="text-2xl font-bold text-accent">₹{product.aiPrice.toFixed(2)}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="text-foreground/80">
                    <p>{product.aiStory}</p>
                </div>
                <Separator />
                <div>
                  <h4 className="font-semibold text-lg mb-2">Sold by:</h4>
                  <p className="text-primary font-medium">{product.sellerDetails.name} from {product.sellerDetails.city}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    {product.aiTags.map(tag => (
                        <Badge key={tag} variant="secondary">#{tag}</Badge>
                    ))}
                 </div>
            </CardContent>
            <CardFooter>
                 <Button size="lg" className="w-full rounded-full shadow-md" onClick={handleAddToCart}>
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Add to Cart
                </Button>
            </CardFooter>
        </div>
       </Card>

       {/* Reviews Section Placeholder */}
       <Card className="mt-12 shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle className="font-headline text-4xl text-primary">Reviews & Ratings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <Star className="text-yellow-400 fill-yellow-400" />
            <Star className="text-yellow-400 fill-yellow-400" />
            <Star className="text-yellow-400 fill-yellow-400" />
            <Star className="text-yellow-400 fill-yellow-400" />
            <Star className="text-muted-foreground/50 fill-muted-foreground/20" />
            <span className="text-muted-foreground ml-2">(Feature coming soon)</span>
          </div>
          <p className="text-foreground/80">Review functionality will be implemented here.</p>
        </CardContent>
       </Card>
    </div>
  );
}
