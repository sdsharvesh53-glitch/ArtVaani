import Image from 'next/image';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-4">
      <Image
        src="https://picsum.photos/seed/login-background/1920/1080"
        alt="Background pattern"
        fill
        className="-z-10 object-cover opacity-10"
        data-ai-hint="indian pattern"
      />
      {children}
    </main>
  );
}
