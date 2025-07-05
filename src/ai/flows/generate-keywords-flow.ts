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
  keywords: z.array(z.string()).describe('An array of at least 3 relevant keywords for the document description, in Portuguese.'),
});
export type GenerateKeywordsOutput = z.infer<typeof GenerateKeywordsOutputSchema>;

export async function generateKeywords(input: GenerateKeywordsInput): Promise<GenerateKeywordsOutput> {
  return generateKeywordsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateKeywordsPrompt',
  input: {schema: GenerateKeywordsInputSchema},
  output: {schema: GenerateKeywordsOutputSchema},
  prompt: `Você é um especialista em arquivologia. Sua tarefa é analisar o texto a seguir e extrair palavras-chave relevantes em português.

Texto para análise:
"{{{description}}}"

Com base no texto, forneça uma lista de pelo menos 3 palavras-chave que o resumam. As palavras-chave devem ser concisas e em português.`,
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
