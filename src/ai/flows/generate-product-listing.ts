'use server';

/**
 * @fileOverview Generates product listings for artisan crafts.
 * 
 * - generateProductListing - A function to generate product details.
 * - GenerateProductListingInput - The input type for generateProductListing.
 * - GenerateProductListingOutput - The return type for generateProductListing.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateProductListingInputSchema = z.object({
  craftName: z.string().describe('The name of the craft.'),
  artisanStory: z.string().describe("The artisan's story about the craft."),
  craftImage: z.string().describe("A data URI of the craft's image."),
});
export type GenerateProductListingInput = z.infer<typeof GenerateProductListingInputSchema>;

const GenerateProductListingOutputSchema = z.object({
  productTitle: z.string().describe('A catchy and descriptive title for the product.'),
  productDescription: z.string().describe('A detailed and appealing product description.'),
  suggestedPrice: z.number().describe('A suggested price for the product.'),
});
export type GenerateProductListingOutput = z.infer<typeof GenerateProductListingOutputSchema>;

export async function generateProductListing(
  input: GenerateProductListingInput
): Promise<GenerateProductListingOutput> {
  return generateProductListingFlow(input);
}

const productListingPrompt = ai.definePrompt({
  name: 'productListingPrompt',
  input: {schema: GenerateProductListingInputSchema},
  output: {schema: GenerateProductListingOutputSchema},
  prompt: `You are an expert e-commerce marketer specializing in handmade crafts.
  
  Based on the craft name, artisan's story, and the product image, generate a compelling product listing.
  
  Craft Name: {{{craftName}}}
  Artisan Story: {{{artisanStory}}}
  Image: {{media url=craftImage}}
  
  Generate a catchy title, a detailed description, and suggest a fair price for the product.`,
});

const generateProductListingFlow = ai.defineFlow(
  {
    name: 'generateProductListingFlow',
    inputSchema: GenerateProductListingInputSchema,
    outputSchema: GenerateProductListingOutputSchema,
  },
  async input => {
    const {output} = await productListingPrompt(input);
    return output!;
  }
);
