'use server';

/**
 * @fileOverview A cultural craft insights AI agent.
 *
 * - exploreCulturalCraftInsights - A function that explores cultural craft insights.
 * - ExploreCulturalCraftInsightsInput - The input type for the exploreCulturalCraftInsights function.
 * - ExploreCulturalCraftInsightsOutput - The return type for the exploreCulturalCraftInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExploreCulturalCraftInsightsInputSchema = z.object({
  craftName: z.string().describe('The name of the craft to explore.'),
});
export type ExploreCulturalCraftInsightsInput = z.infer<
  typeof ExploreCulturalCraftInsightsInputSchema
>;

const ExploreCulturalCraftInsightsOutputSchema = z.object({
  craftDetails: z.string().describe('Detailed write-up about the craft.'),
});
export type ExploreCulturalCraftInsightsOutput = z.infer<
  typeof ExploreCulturalCraftInsightsOutputSchema
>;

export async function exploreCulturalCraftInsights(
  input: ExploreCulturalCraftInsightsInput
): Promise<ExploreCulturalCraftInsightsOutput> {
  return exploreCulturalCraftInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'exploreCulturalCraftInsightsPrompt',
  input: {schema: ExploreCulturalCraftInsightsInputSchema},
  output: {schema: ExploreCulturalCraftInsightsOutputSchema},
  prompt: `You are an expert in cultural crafts. Provide a detailed write-up about the history, origin, techniques, and cultural significance of the following craft: {{{craftName}}}.`,
});

const exploreCulturalCraftInsightsFlow = ai.defineFlow(
  {
    name: 'exploreCulturalCraftInsightsFlow',
    inputSchema: ExploreCulturalCraftInsightsInputSchema,
    outputSchema: ExploreCulturalCraftInsightsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
