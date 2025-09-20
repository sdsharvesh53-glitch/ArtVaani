'use client';

import Image from 'next/image';
import Link from 'next/link';

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

// This would be fetched from Firestore in a real app
const products = [
  { id: '1', name: 'Madhubani Painted Vase', price: '₹1,200', image: 'https://picsum.photos/seed/madhubani-vase/400/400', hint: 'painted vase' },
  { id: '2', name: 'Handwoven Pashmina Shawl', price: '₹8,500', image: 'https://picsum.photos/seed/pashmina-shawl/400/400', hint: 'woven shawl' },
  { id: '3', name: 'Terracotta Warrior Statue', price: '₹3,400', image: 'https://picsum.photos/seed/terracotta-statue/400/400', hint: 'clay statue' },
  { id: '4', name: 'Bidriware Silver Coasters', price: '₹2,100', image: 'https://picsum.photos/seed/bidriware-coasters/400/400', hint: 'metal coasters' },
  { id: '5', name: 'Kalamkari Wall Hanging', price: '₹4,800', image: 'https://picsum.photos/seed/kalamkari-hanging/400/400', hint: 'fabric wall art' },
  { id: '6', name: 'Blue Pottery Mug Set', price: '₹1,900', image: 'https://picsum.photos/seed/pottery-mugs/400/400', hint: 'pottery mugs' },
  { id: '7', name: 'Wooden Jigsaw Puzzle Box', price: '₹2,500', image: 'https://picsum.photos/seed/puzzle-box/400/400', hint: 'wooden box' },
  { id: '8', name: 'Leather Puppets (Tholu Bommalata)', price: '₹3,200', image: 'https://picsum.photos/seed/leather-puppets/400/400', hint: 'leather puppets' },
];

export default function ProductsPage() {
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = (product: typeof products[0]) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
      hint: product.hint
    });
    toast({
      title: 'Added to cart',
      description: `${product.name} has been added to your cart.`,
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

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <Card
            key={product.id}
            className="flex flex-col overflow-hidden rounded-2xl shadow-md transition-shadow duration-300 hover:shadow-xl"
          >
            <CardHeader className="p-0">
               <Link href={`/products/${product.id}`}>
                <Image
                  src={product.image}
                  alt={product.name}
                  width={400}
                  height={400}
                  className="h-64 w-full object-cover transition-transform duration-300 hover:scale-105"
                  data-ai-hint={product.hint}
                />
              </Link>
            </CardHeader>
            <CardContent className="flex-grow p-4">
              <CardTitle className="truncate text-lg">{product.name}</CardTitle>
              <CardDescription className="mt-2 text-base font-semibold text-primary">
                {product.price}
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
    </div>
  );
}
