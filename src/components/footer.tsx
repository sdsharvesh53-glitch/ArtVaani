import Link from 'next/link';
import { Icons } from './icons';

export function Footer() {
  return (
    <footer className="w-full border-t bg-card">
      <div className="container mx-auto grid grid-cols-2 gap-8 px-4 py-12 md:grid-cols-4">
        <div className="flex flex-col gap-4">
          <Link href="/" className="flex items-center space-x-2">
            <Icons.logo className="h-8 w-8 text-primary" />
            <span className="font-headline text-2xl font-bold">ArtVaani</span>
          </Link>
          <p className="text-sm text-foreground/70">
            Weaving stories, one craft at a time.
          </p>
        </div>
        <div className="space-y-2">
          <h4 className="font-semibold">Shop</h4>
          <ul className="space-y-1">
            <li>
              <Link
                href="/products"
                className="text-sm text-foreground/70 hover:text-primary"
              >
                All Products
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="text-sm text-foreground/70 hover:text-primary"
              >
                New Arrivals
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="text-sm text-foreground/70 hover:text-primary"
              >
                Best Sellers
              </Link>
            </li>
          </ul>
        </div>
        <div className="space-y-2">
          <h4 className="font-semibold">About Us</h4>
          <ul className="space-y-1">
            <li>
              <Link
                href="/cultural-insights"
                className="text-sm text-foreground/70 hover:text-primary"
              >
                Cultural Insights
              </Link>
            </li>
            <li>
              <Link
                href="/artisans"
                className="text-sm text-foreground/70 hover:text-primary"
              >
                For Artisans
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="text-sm text-foreground/70 hover:text-primary"
              >
                Our Story
              </Link>
            </li>
          </ul>
        </div>
        <div className="space-y-2">
          <h4 className="font-semibold">Support</h4>
          <ul className="space-y-1">
            <li>
              <Link
                href="#"
                className="text-sm text-foreground/70 hover:text-primary"
              >
                Contact Us
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="text-sm text-foreground/70 hover:text-primary"
              >
                FAQ
              </Link>
            </li>
            <li>
              <Link
                href="#"
                className="text-sm text-foreground/70 hover:text-primary"
              >
                Shipping & Returns
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t">
        <div className="container mx-auto flex flex-col items-center justify-between gap-2 px-4 py-4 sm:flex-row">
          <p className="text-sm text-foreground/60">
            &copy; {new Date().getFullYear()} ArtVaani. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {/* Add social icons here */}
          </div>
        </div>
      </div>
    </footer>
  );
}
