import Image from 'next/image';
import Link from 'next/link';
import {
  Globe,
  Palette,
  Hammer,
  Sparkles,
  ShieldCheck,
  BookOpen,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

const featuredProducts = [
  {
    id: '1',
    name: 'Madhubani Painted Vase',
    price: '₹1,200',
    image: 'https://picsum.photos/seed/madhubani-vase/400/400',
    hint: 'painted vase',
  },
  {
    id: '2',
    name: 'Handwoven Pashmina Shawl',
    price: '₹8,500',
    image: 'https://picsum.photos/seed/pashmina-shawl/400/400',
    hint: 'woven shawl',
  },
  {
    id: '3',
    name: 'Terracotta Warrior Statue',
    price: '₹3,400',
    image: 'https://picsum.photos/seed/terracotta-statue/400/400',
    hint: 'clay statue',
  },
  {
    id: '4',
    name: 'Bidriware Silver Coasters',
    price: '₹2,100',
    image: 'https://picsum.photos/seed/bidriware-coasters/400/400',
    hint: 'metal coasters',
  },
];

const features = [
  {
    icon: <Palette className="h-10 w-10 text-primary" />,
    title: 'Discover Unique Crafts',
    description:
      'Explore a curated collection of authentic handmade products from artisans across India.',
  },
  {
    icon: <Sparkles className="h-10 w-10 text-primary" />,
    title: 'AI-Powered Storytelling',
    description:
      'Learn the rich history and cultural significance behind each craft through AI-generated stories.',
  },
  {
    icon: <ShieldCheck className="h-10 w-10 text-primary" />,
    title: 'Verified Artisans',
    description:
      'Shop with confidence from artisans whose identity and craft are verified for authenticity.',
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="relative w-full py-20 md:py-32 lg:py-40">
          <div className="container mx-auto px-4 text-center">
            <h1 className="font-headline text-5xl font-bold tracking-tighter text-primary sm:text-6xl md:text-7xl lg:text-8xl">
              Craftopia
            </h1>
            <p className="mx-auto mt-4 max-w-[700px] text-lg text-foreground/80 md:text-xl">
              Weaving stories, one craft at a time. Discover authentic Indian
              handicrafts directly from the artisans.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Button asChild size="lg" className="rounded-full shadow-lg">
                <Link href="/products">Explore Products</Link>
              </Button>
              <Button
                asChild
                variant="secondary"
                size="lg"
                className="rounded-full shadow-lg"
              >
                <Link href="/artisans">For Artisans</Link>
              </Button>
            </div>
          </div>
          <div
            className="absolute inset-0 -z-10 bg-cover bg-center opacity-10"
            style={{
              backgroundImage:
                'url(https://picsum.photos/seed/craft-pattern/1920/1080)',
            }}
            data-ai-hint="craft pattern"
          />
        </section>

        <section id="features" className="w-full bg-card py-12 md:py-24">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {features.map((feature, index) => (
                <div key={index} className="flex flex-col items-center text-center">
                  {feature.icon}
                  <h3 className="mt-4 font-headline text-2xl font-bold">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-foreground/70">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="featured-products" className="w-full py-12 md:py-24">
          <div className="container mx-auto px-4">
            <h2 className="text-center font-headline text-4xl font-bold text-primary md:text-5xl">
              Featured Products
            </h2>
            <p className="mt-4 text-center text-lg text-foreground/80">
              Handpicked creations from our talented artisans.
            </p>
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featuredProducts.map((product) => (
                <Card
                  key={product.id}
                  className="overflow-hidden rounded-2xl shadow-md transition-shadow hover:shadow-xl"
                >
                  <CardHeader className="p-0">
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={400}
                      height={400}
                      className="h-64 w-full object-cover"
                      data-ai-hint={product.hint}
                    />
                  </CardHeader>
                  <CardContent className="p-4">
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <CardDescription className="mt-2 text-base font-semibold text-primary">
                      {product.price}
                    </CardDescription>
                    <Button
                      asChild
                      className="mt-4 w-full rounded-full"
                    >
                      <Link href={`/products/${product.id}`}>View Details</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="mt-12 text-center">
              <Button asChild size="lg" variant="outline" className="rounded-full shadow-lg">
                <Link href="/products">Shop All</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="w-full bg-card py-12 md:py-24">
          <div className="container mx-auto grid items-center gap-10 px-4 md:grid-cols-2">
            <div className="space-y-4">
              <h2 className="font-headline text-4xl font-bold text-primary md:text-5xl">
                Empowering Artisans
              </h2>
              <p className="text-lg text-foreground/80">
                Are you an artisan? Join Craftopia to showcase your talent to a
                global audience and grow your business.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <Globe className="h-6 w-6 text-accent" />
                  <span>Reach a wider market and connect with new customers.</span>
                </li>
                <li className="flex items-center gap-3">
                  <BookOpen className="h-6 w-6 text-accent" />
                  <span>Use our AI tools to tell your story and create compelling product listings.</span>
                </li>
                <li className="flex items-center gap-3">
                  <Hammer className="h-6 w-6 text-accent" />
                  <span>Focus on your craft, we handle the technology.</span>
                </li>
              </ul>
              <Button asChild size="lg" className="mt-4 rounded-full shadow-lg">
                <Link href="/artisans">Learn More & Join</Link>
              </Button>
            </div>
            <div>
              <Image
                src="https://picsum.photos/seed/artisan-working/600/400"
                alt="Artisan working"
                width={600}
                height={400}
                className="rounded-2xl object-cover shadow-xl"
                data-ai-hint="artisan hands"
              />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
