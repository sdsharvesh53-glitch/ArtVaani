'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, ShoppingCart } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export interface Product {
  id: string;
  title: string;
  aiStory: string;
  aiPrice: number;
  images: string[];
  aiTags: string[];
  artisanId: string;
  sellerDetails: {
    name: string;
    city: string;
  };
  createdAt: any;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const productsData: Product[] = [];
        querySnapshot.forEach((doc) => {
          productsData.push({ id: doc.id, ...doc.data() } as Product);
        });
        setProducts(productsData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching products:', error);
        setLoading(false);
        toast({
          title: 'Error',
          description: 'Could not fetch products.',
          variant: 'destructive',
        });
      }
    );

    return () => unsubscribe();
  }, [toast]);

  const handleAddToCart = (product: Product) => {
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
      <div className="text-center">
        <h1 className="font-headline text-5xl font-bold text-primary">
          Our Collection
        </h1>
        <p className="mt-2 text-lg text-foreground/80">
          Explore authentic handicrafts from the heart of India.
        </p>
      </div>

      <div className="my-8 flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="relative w-full md:w-1/3">
          <Input placeholder="Search for crafts..." className="rounded-full pl-10" />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="rounded-full">
                Sort by <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Featured</DropdownMenuItem>
              <DropdownMenuItem>Newest</DropdownMenuItem>
              <DropdownMenuItem>Price: Low to High</DropdownMenuItem>
              <DropdownMenuItem>Price: High to Low</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="flex flex-col overflow-hidden rounded-2xl shadow-md">
              <CardHeader className="p-0">
                <Skeleton className="h-64 w-full" />
              </CardHeader>
              <CardContent className="flex-grow p-4">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="mt-2 h-5 w-1/4" />
              </CardContent>
              <CardFooter className="flex gap-2 p-4 pt-0">
                <Skeleton className="h-10 w-full rounded-full" />
                <Skeleton className="h-10 w-full rounded-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <Card
              key={product.id}
              className="flex flex-col overflow-hidden rounded-2xl shadow-md transition-shadow duration-300 hover:shadow-xl"
            >
              <CardHeader className="p-0">
                <Link href={`/products/${product.id}`}>
                  <Image
                    src={product.images[0] || 'https://placehold.co/400x400'}
                    alt={product.title}
                    width={400}
                    height={400}
                    className="h-64 w-full object-cover transition-transform duration-300 hover:scale-105"
                    data-ai-hint={product.aiTags[0]}
                  />
                </Link>
              </CardHeader>
              <CardContent className="flex-grow p-4">
                <CardTitle className="truncate text-lg">{product.title}</CardTitle>
                <CardDescription className="mt-2 text-base font-semibold text-primary">
                  ₹{product.aiPrice.toFixed(2)}
                </CardDescription>
              </CardContent>
              <CardFooter className="flex gap-2 p-4 pt-0">
                <Button asChild className="w-full rounded-full" variant="outline">
                  <Link href={`/products/${product.id}`}>View</Link>
                </Button>
                <Button onClick={() => handleAddToCart(product)} className="w-full rounded-full">
                  <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
