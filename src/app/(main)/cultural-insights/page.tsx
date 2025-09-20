'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Search, Volume2 } from 'lucide-react';
import { exploreCulturalCraftInsights } from '@/ai/flows/explore-cultural-craft-insights';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const formSchema = z.object({
  craftName: z.string().min(3, { message: 'Please enter at least 3 characters.' }),
});

export default function CulturalInsightsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [insight, setInsight] = useState<string | null>(null);
  const [currentCraft, setCurrentCraft] = useState('');
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      craftName: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setInsight(null);
    setCurrentCraft(values.craftName);
    try {
      const result = await exploreCulturalCraftInsights(values);
      setInsight(result.craftDetails);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error Generating Insight',
        description: 'Could not fetch details for this craft. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleTextToSpeech = () => {
    if (!insight) return;
    const utterance = new SpeechSynthesisUtterance(insight);
    // You could add language selection logic here in a real app
    // utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div>
      <section className="relative w-full bg-card py-20">
        <Image
          src="https://picsum.photos/seed/cultural-insights-hero/1200/400"
          alt="Cultural art forms"
          layout="fill"
          objectFit="cover"
          className="absolute inset-0 -z-10 opacity-20"
          data-ai-hint="indian art"
        />
        <div className="container relative mx-auto px-4 text-center">
          <h1 className="font-headline text-5xl font-bold text-primary">
            Cultural Insights Explorer
          </h1>
          <p className="mx-auto mt-2 max-w-2xl text-lg text-foreground/80">
            Enter the name of a craft to uncover its rich history and cultural
            significance.
          </p>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="mx-auto mt-8 max-w-lg"
            >
              <FormField
                control={form.control}
                name="craftName"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="e.g., Madhubani Painting"
                          className="h-14 rounded-full pl-6 pr-28 text-lg"
                          {...field}
                        />
                        <Button
                          type="submit"
                          size="lg"
                          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <Loader2 className="animate-spin" />
                          ) : (
                            <Search />
                          )}
                          <span className="sr-only">Search</span>
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-left" />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
      </section>
      <section className="container mx-auto px-4 py-12">
        {isLoading && (
          <Card className="mx-auto max-w-4xl rounded-2xl shadow-lg">
            <CardHeader>
              <Skeleton className="h-8 w-3/4 rounded-md" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full rounded-md" />
              <Skeleton className="h-4 w-full rounded-md" />
              <Skeleton className="h-4 w-5/6 rounded-md" />
              <Skeleton className="h-4 w-full rounded-md" />
              <Skeleton className="h-4 w-4/5 rounded-md" />
            </CardContent>
          </Card>
        )}
        {insight && (
          <Card className="mx-auto max-w-4xl rounded-2xl shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="font-headline text-4xl text-primary">
                  {currentCraft}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleTextToSpeech}
                  aria-label="Read text aloud"
                >
                  <Volume2 />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div
                className="prose max-w-none text-foreground/90"
                dangerouslySetInnerHTML={{ __html: insight.replace(/\n/g, '<br />') }}
              />
            </CardContent>
          </Card>
        )}
        {!isLoading && !insight && (
            <div className="text-center text-foreground/60">
                <p>Enter a craft name above to begin your journey.</p>
            </div>
        )}
      </section>
    </div>
  );
}
