'use server';
/**
 * @fileOverview Generates keywords for document indexing.
 *
 * - generateKeywords - A function that generates keywords based on a description.
 * - GenerateKeywordsInput - The input type for the generateKeywords function.
 * - GenerateKeywordsOutput - The return type for the generateKeywords function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

export const GenerateKeywordsInputSchema = z.object({
  description: z.string().describe('The document description to extract keywords from.'),
});
export type GenerateKeywordsInput = z.infer<typeof GenerateKeywordsInputSchema>;

export const GenerateKeywordsOutputSchema = z.object({
  keywords: z
    .array(z.string().describe('Uma única palavra-chave concisa em português.'))
    .min(3)
    .max(5)
    .describe(
      'Um array contendo de 3 a 5 palavras-chave relevantes extraídas da descrição do documento.'
    ),
});
export type GenerateKeywordsOutput = z.infer<typeof GenerateKeywordsOutputSchema>;

export async function generateKeywords(input: GenerateKeywordsInput): Promise<GenerateKeywordsOutput> {
  return generateKeywordsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateKeywordsPrompt',
  input: {schema: GenerateKeywordsInputSchema},
  output: {schema: GenerateKeywordsOutputSchema},
  prompt: `Analise a seguinte descrição de documento e extraia de 3 a 5 palavras-chave relevantes em português.

Descrição:
{{{description}}}

Retorne as palavras-chave como um array de strings dentro de um objeto JSON.`,
});

const generateKeywordsFlow = ai.defineFlow(
  {
    name: 'generateKeywordsFlow',
    inputSchema: GenerateKeywordsInputSchema,
    outputSchema: GenerateKeywordsOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      console.error("AI response did not conform to the output schema.");
      throw new Error("AI response was invalid.");
    }
    return output;
  }
);
