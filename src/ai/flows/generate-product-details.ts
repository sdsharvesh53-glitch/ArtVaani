'use server';

/**
 * @fileOverview AI-powered product detail generator for artisans.
 *
 * - generateProductDetails - A function that takes product photo, description, and target audience to generate compelling product details.
 * - GenerateProductDetailsInput - The input type for the generateProductDetails function.
 * - GenerateProductDetailsOutput - The return type for the generateProductDetails function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateProductDetailsInputSchema = z.object({
  productPhotoDataUri: z
    .string()
    .describe(
      "A photo of the product, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  productDescription: z.string().describe('A short description of the product.'),
  targetAudience: z.string().describe('The target audience for the product.'),
});

export type GenerateProductDetailsInput = z.infer<
  typeof GenerateProductDetailsInputSchema
>;

const GenerateProductDetailsOutputSchema = z.object({
  productTitle: z.string().describe('A catchy product title.'),
  productDescription: z.string().describe('A detailed marketing description.'),
  hashtags: z.string().describe('Relevant hashtags for the product.'),
  suggestedPrice: z
    .string()
    .describe('A suggested price for the product in Indian Rupees (₹).'),
});

export type GenerateProductDetailsOutput = z.infer<
  typeof GenerateProductDetailsOutputSchema
>;

export async function generateProductDetails(
  input: GenerateProductDetailsInput
): Promise<GenerateProductDetailsOutput> {
  return generateProductDetailsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateProductDetailsPrompt',
  input: {schema: GenerateProductDetailsInputSchema},
  output: {schema: GenerateProductDetailsOutputSchema},
  prompt: `You are an AI assistant helping artisans create compelling product listings.

  Given a product photo, description, and target audience, you will generate:
  - A catchy product title
  - A detailed marketing description
  - Relevant hashtags
  - A suggested price in Indian Rupees (₹)

  Product Description: {{{productDescription}}}
  Target Audience: {{{targetAudience}}}
  Product Photo: {{media url=productPhotoDataUri}}

  Please provide the output in JSON format.
  `,
});

const generateProductDetailsFlow = ai.defineFlow(
  {
    name: 'generateProductDetailsFlow',
    inputSchema: GenerateProductDetailsInputSchema,
    outputSchema: GenerateProductDetailsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
