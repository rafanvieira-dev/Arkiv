
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
  descricaoDocumento: z.string().describe('A descrição detalhada do conteúdo do documento.'),
  tipoDocumento: z.string().optional().describe('A espécie ou tipo do documento (ex: "Ação Ordinária", "Contrato").'),
  assuntoClassificacao: z.string().optional().describe('O assunto principal derivado da classificação arquivística (ex: "Processos Judiciais Cíveis").'),
  nomesDasPartes: z.array(z.string()).optional().describe('Uma lista com os nomes das partes envolvidas no documento.'),
});
export type GenerateKeywordsInput = z.infer<typeof GenerateKeywordsInputSchema>;

export const GenerateKeywordsOutputSchema = z.object({
  keywords: z
    .array(z.string().describe('Uma única palavra-chave concisa e relevante em português.'))
    .describe(
      'Um array contendo palavras-chave ou termos curtos relevantes em português, extraídos e derivados do contexto fornecido.'
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
  system: `Você é um especialista em indexação de documentos de arquivo. Sua tarefa é analisar o contexto fornecido sobre um documento e extrair ou derivar de 3 a 7 palavras-chave ou termos curtos que o representem de forma eficaz para buscas futuras. Considere todos os campos de entrada.

Você DEVE responder APENAS com um objeto JSON válido que esteja em conformidade com o esquema de saída especificado. Não inclua nenhum outro texto, saudações ou explicações em sua resposta. A resposta deve ser um JSON com uma única chave "keywords" contendo um array de strings.`,
  prompt: `Analise as seguintes informações do documento e gere as palavras-chave:

**Descrição do Documento:**
{{{descricaoDocumento}}}

{{#if tipoDocumento}}
**Espécie/Tipo de Documento:**
{{{tipoDocumento}}}
{{/if}}

{{#if assuntoClassificacao}}
**Assunto Principal:**
{{{assuntoClassificacao}}}
{{/if}}

{{#if nomesDasPartes}}
**Partes Envolvidas:**
{{#each nomesDasPartes}}
- {{{this}}}
{{/each}}
{{/if}}

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
