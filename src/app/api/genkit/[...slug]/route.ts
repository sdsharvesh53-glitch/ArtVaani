import { genkit } from '@/ai/genkit';
import { toNextResponse } from '@genkit-ai/next';

export const POST = genkit.nextJSHandler(toNextResponse);
