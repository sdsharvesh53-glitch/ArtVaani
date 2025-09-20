'use server';
/**
 * @fileOverview This file implements the artisan identity verification flow.
 *
 * It includes:
 * - verifyArtisanIdentity: An async function to verify an artisan's identity.
 * - VerifyArtisanIdentityInput: The input type for the verifyArtisanIdentity function.
 * - VerifyArtisanIdentityOutput: The output type for the verifyArtisanIdentity function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VerifyArtisanIdentityInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A live photo captured using the device camera, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    ),
  gpsLocation: z
    .string()
    .describe('The GPS location of the artisan in latitude, longitude format.'),
  declaredCity: z.string().describe('The city declared by the artisan in their profile.'),
});

export type VerifyArtisanIdentityInput = z.infer<typeof VerifyArtisanIdentityInputSchema>;

const VerifyArtisanIdentityOutputSchema = z.object({
  isVerified: z
    .boolean()
    .describe(
      'Whether the artisan is verified based on the GPS location matching the declared city.'
    ),
  verificationResult: z.string().describe('The AI verification result.'),
});

export type VerifyArtisanIdentityOutput = z.infer<typeof VerifyArtisanIdentityOutputSchema>;

export async function verifyArtisanIdentity(
  input: VerifyArtisanIdentityInput
): Promise<VerifyArtisanIdentityOutput> {
  return verifyArtisanIdentityFlow(input);
}

const verifyArtisanIdentityPrompt = ai.definePrompt({
  name: 'verifyArtisanIdentityPrompt',
  input: {schema: VerifyArtisanIdentityInputSchema},
  output: {schema: VerifyArtisanIdentityOutputSchema},
  prompt: `You are an identity verification assistant for an artisan marketplace.

Your task is to verify an artisan's location. You will receive their current GPS coordinates and the city they have declared in their profile.

Your primary goal is to determine if the GPS location is reasonably within the declared city.

- If the GPS coordinates are consistent with the declared city, set the isVerified field to true and provide a confirmation message in verificationResult.
- If the GPS coordinates are not consistent with the declared city, set isVerified to false and explain the mismatch in verificationResult.

GPS Location: {{{gpsLocation}}}
Declared City: {{{declaredCity}}}`,
});

const verifyArtisanIdentityFlow = ai.defineFlow(
  {
    name: 'verifyArtisanIdentityFlow',
    inputSchema: VerifyArtisanIdentityInputSchema,
    outputSchema: VerifyArtisanIdentityOutputSchema,
  },
  async input => {
    const {output} = await verifyArtisanIdentityPrompt(input);
    return output!;
  }
);
