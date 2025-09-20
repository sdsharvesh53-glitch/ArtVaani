
'use server';

/**
 * @fileOverview Transcribes audio to text.
 * 
 * - transcribeAudio - A function to transcribe audio.
 * - TranscribeAudioInput - The input type for transcribeAudio.
 * - TranscribeAudioOutput - The return type for transcribeAudio.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranscribeAudioInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "The audio recording, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type TranscribeAudioInput = z.infer<typeof TranscribeAudioInputSchema>;

const TranscribeAudioOutputSchema = z.object({
  transcript: z.string().describe('The transcribed text from the audio.'),
});
export type TranscribeAudioOutput = z.infer<typeof TranscribeAudioOutputSchema>;


export async function transcribeAudio(
  input: TranscribeAudioInput
): Promise<TranscribeAudioOutput> {
  return transcribeAudioFlow(input);
}


const transcriptionPrompt = ai.definePrompt({
  name: 'transcriptionPrompt',
  input: {schema: TranscribeAudioInputSchema},
  output: {schema: TranscribeAudioOutputSchema},
  prompt: `Transcribe the following audio recording to text. Only return the transcribed text.

Audio: {{media url=audioDataUri}}`,
});


const transcribeAudioFlow = ai.defineFlow(
  {
    name: 'transcribeAudioFlow',
    inputSchema: TranscribeAudioInputSchema,
    outputSchema: TranscribeAudioOutputSchema,
  },
  async input => {
    const {output} = await transcriptionPrompt(input);
    return {
        transcript: output?.transcript ?? ''
    }
  }
);
