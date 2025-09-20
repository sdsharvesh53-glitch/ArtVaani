
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
  productDescription: z.string().describe("A brief description of the product."),
  productImage: z.string().describe("A data URI of the product's image."),
});
export type GenerateProductListingInput = z.infer<typeof GenerateProductListingInputSchema>;

const GenerateProductListingOutputSchema = z.object({
  productTitle: z.string().describe('A catchy and descriptive title for the product.'),
  productStory: z.string().describe('A detailed and appealing story-based product description.'),
  suggestedPrice: z.number().describe('A suggested price for the product in INR.'),
  hashtags: z.array(z.string()).describe('An array of 3-5 relevant hashtags for social media.'),
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
  prompt: `You are an expert e-commerce marketer specializing in handmade Indian crafts.
  
  Based on the user's description and the product image, generate a compelling product listing.
  The currency should be in Indian Rupees (₹).

  Product Description: {{{productDescription}}}
  Image: {{media url=productImage}}
  
  Generate a catchy title, a detailed story-based description, a fair price in INR, and 3-5 relevant hashtags.`,
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
