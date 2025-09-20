'use client';

import Link from 'next/link';
import { ShoppingCart, User, LogOut, LayoutDashboard } from 'lucide-react';
import { signOut } from 'firebase/auth';

import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { useAuth } from '@/hooks/use-auth';
import { auth } from '@/lib/firebase';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from './ui/skeleton';

export function Header() {
  const { user, loading, isArtisan } = useAuth();

  const handleLogout = async () => {
    await signOut(auth);
  };

  const getInitials = (email?: string | null) => {
    return email ? email.charAt(0).toUpperCase() : '?';
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-screen-2xl items-center px-4">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Icons.logo className="h-8 w-8 text-primary" />
          <span className="hidden font-headline text-2xl font-bold sm:inline-block">
            Craftopia
          </span>
        </Link>
        <nav className="hidden flex-1 items-center gap-6 text-sm font-medium md:flex">
          <Link
            href="/products"
            className="text-foreground/60 transition-colors hover:text-foreground/80"
          >
            Products
          </Link>
          <Link
            href="/cultural-insights"
            className="text-foreground/60 transition-colors hover:text-foreground/80"
          >
            Cultural Insights
          </Link>
          <Link
            href="/artisans"
            className="text-foreground/60 transition-colors hover:text-foreground/80"
          >
            For Artisans
          </Link>
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/cart">
              <ShoppingCart className="h-5 w-5" />
              <span className="sr-only">Shopping Cart</span>
            </Link>
          </Button>

          {loading ? (
            <Skeleton className="h-8 w-20 rounded-full" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-9 w-9 rounded-full"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user.photoURL ?? ''} alt="User avatar" />
                    <AvatarFallback>{getInitials(user.email)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.displayName || 'User'}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {isArtisan && (
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Button variant="ghost" asChild>
                <Link href="/login">Log In</Link>
              </Button>
              <Button className="rounded-full shadow-lg" asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
