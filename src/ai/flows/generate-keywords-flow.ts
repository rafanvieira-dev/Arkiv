
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
  system: `Você é um especialista em indexação de documentos de arquivo. Sua tarefa é analisar o contexto fornecido sobre um documento e gerar uma lista de palavras-chave relevantes.

**REGRAS IMPORTANTES:**
1.  A sua resposta DEVE SER APENAS um objeto JSON.
2.  Não inclua \`\`\`json, explicações, saudações ou qualquer outro texto fora do JSON.
3.  O JSON deve ter uma única chave chamada "keywords".
4.  O valor de "keywords" deve ser um array de strings (palavras-chave).

**Exemplo de Saída Válida:**
{
  "keywords": ["acidente", "trem", "indenização", "responsabilidade civil", "decreto 2681"]
}

Analise as informações a seguir e gere o JSON de palavras-chave.`,
  prompt: `**Descrição do Documento:**
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
`,
  config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
    ],
  },
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
      console.error("AI response did not conform to the output schema or was empty. Response:", JSON.stringify(output));
      throw new Error("A resposta da IA foi inválida ou vazia.");
    }
    return output;
  }
);
