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
  prompt: `Você é um arquivista e indexador especialista. Com base na descrição do documento fornecida, gere pelo menos 3 palavras-chave relevantes que resumam os tópicos principais. As palavras-chave devem estar em português. Retorne apenas as palavras-chave no formato especificado.

Descrição do Documento:
{{{description}}}`,
});

const generateKeywordsFlow = ai.defineFlow(
  {
    name: 'generateKeywordsFlow',
    inputSchema: GenerateKeywordsInputSchema,
    outputSchema: GenerateKeywordsOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
