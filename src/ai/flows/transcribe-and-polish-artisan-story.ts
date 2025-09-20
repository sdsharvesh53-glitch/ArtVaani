// The transcribeAndPolishArtisanStory flow transcribes audio to text and polishes it into a cultural story.

'use server';

/**
 * @fileOverview Converts artisan audio recordings to polished cultural stories.
 *
 * - transcribeAndPolishArtisanStory - A function to transcribe audio and polish it.
 * - TranscribeAndPolishArtisanStoryInput - The input type for transcribeAndPolishArtisanStory.
 * - TranscribeAndPolishArtisanStoryOutput - The return type for transcribeAndPolishArtisanStory.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import wav from 'wav';

const TranscribeAndPolishArtisanStoryInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "The artisan's voice recording about their craft, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type TranscribeAndPolishArtisanStoryInput = z.infer<typeof TranscribeAndPolishArtisanStoryInputSchema>;

const TranscribeAndPolishArtisanStoryOutputSchema = z.object({
  rawTranscript: z.string().describe('The raw transcribed text from the audio.'),
  polishedStory: z
    .string()
    .describe('The polished and well-structured cultural story.'),
});
export type TranscribeAndPolishArtisanStoryOutput = z.infer<
  typeof TranscribeAndPolishArtisanStoryOutputSchema
>;

export async function transcribeAndPolishArtisanStory(
  input: TranscribeAndPolishArtisanStoryInput
): Promise<TranscribeAndPolishArtisanStoryOutput> {
  return transcribeAndPolishArtisanStoryFlow(input);
}

const transcriptionPrompt = ai.definePrompt({
  name: 'transcriptionPrompt',
  prompt: `Transcribe the following audio recording to text:\n\n{{media url=audioDataUri}}`,
});


const polishStoryPrompt = ai.definePrompt({
  name: 'polishStoryPrompt',
  input: z.object({
    rawTranscript: z.string(),
  }),
  output: z.object({
    polishedStory: z.string(),
  }),
  prompt: `You are a cultural storyteller who helps artisans share their stories.
  Given the raw transcript of an artisan speaking about their craft, polish it into a well-structured and engaging cultural story.
  Raw Transcript: {{{rawTranscript}}}`,
});

const transcribeAndPolishArtisanStoryFlow = ai.defineFlow(
  {
    name: 'transcribeAndPolishArtisanStoryFlow',
    inputSchema: TranscribeAndPolishArtisanStoryInputSchema,
    outputSchema: TranscribeAndPolishArtisanStoryOutputSchema,
  },
  async input => {
    const {output: transcriptionOutput} = await transcriptionPrompt(input);
    const rawTranscript = transcriptionOutput?.text ?? '';

    const {output: polishStoryOutput} = await polishStoryPrompt({
      rawTranscript,
    });
    const polishedStory = polishStoryOutput?.polishedStory ?? '';

    return {
      rawTranscript,
      polishedStory,
    };
  }
);
