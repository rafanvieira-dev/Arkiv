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
      'Um array contendo de 3 a 5 palavras-chave relevantes em português, extraídas da descrição do documento.'
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
  system: `Você é um especialista em indexação de documentos. Sua tarefa é analisar a descrição de um documento e extrair de 3 a 5 palavras-chave relevantes em português.
Você DEVE responder APENAS com um objeto JSON válido que esteja em conformidade com o esquema de saída especificado. Não inclua nenhum outro texto, saudações ou explicações em sua resposta.
Sua resposta deve ser um JSON com uma única chave "keywords" contendo um array de strings.`,
  prompt: `Descrição do Documento:
{{{description}}}

Gere as palavras-chave agora.`,
});

const generateKeywordsFlow = ai.defineFlow(
  {
    name: 'generateKeywordsFlow',
    inputSchema: GenerateKeywordsInputSchema,
    outputSchema: GenerateKeywordsOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output || !output.keywords) {
      console.error("AI response did not conform to the output schema or was empty.");
      throw new Error("A resposta da IA foi inválida ou vazia.");
    }
    return output;
  }
);
