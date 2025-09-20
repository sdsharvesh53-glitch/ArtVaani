
'use client';

import { useState, useEffect, useMemo } from 'react';
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
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductFilters } from '@/components/products/product-filters';

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
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
}

export default function ProductsPage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('newest');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

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
        setAllProducts(productsData);
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

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    allProducts.forEach(product => {
        product.aiTags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags);
  }, [allProducts]);

  const filteredProducts = useMemo(() => {
    return allProducts
      .filter(product => {
        // Search query filter
        const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase());
        
        // Price range filter
        const matchesPrice = product.aiPrice >= priceRange[0] && product.aiPrice <= priceRange[1];

        // Tag filter
        const matchesTags = selectedTags.length === 0 || selectedTags.every(tag => product.aiTags.includes(tag));

        return matchesSearch && matchesPrice && matchesTags;
      })
      .sort((a, b) => {
        switch (sortOption) {
          case 'newest':
            return b.createdAt.seconds - a.createdAt.seconds;
          case 'oldest':
            return a.createdAt.seconds - b.createdAt.seconds;
          case 'price-asc':
            return a.aiPrice - b.aiPrice;
          case 'price-desc':
            return b.aiPrice - a.aiPrice;
          default:
            return 0;
        }
      });
  }, [allProducts, searchQuery, sortOption, priceRange, selectedTags]);

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

  const clearFilters = () => {
    setSearchQuery('');
    setSortOption('newest');
    setPriceRange([0, 10000]);
    setSelectedTags([]);
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

      <ProductFilters 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        sortOption={sortOption}
        setSortOption={setSortOption}
        priceRange={priceRange}
        setPriceRange={setPriceRange}
        allTags={allTags}
        selectedTags={selectedTags}
        setSelectedTags={setSelectedTags}
        clearFilters={clearFilters}
      />

      {loading ? (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
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
                  <ShoppingCart className="mr-2 h-4 w-4" /> Add
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      { !loading && filteredProducts.length === 0 && (
         <div className="mt-16 text-center text-foreground/60">
            <h3 className="text-2xl font-semibold">No Products Found</h3>
            <p className="mt-2">Try adjusting your filters to find what you're looking for.</p>
            <Button onClick={clearFilters} className="mt-4 rounded-full">Clear Filters</Button>
         </div>
      )}
    </div>
  );
}
