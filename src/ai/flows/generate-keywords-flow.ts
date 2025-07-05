'use server';
/**
 * @fileOverview A keyword generation AI agent.
 *
 * - generateKeywords - A function that handles the keyword generation process.
 * - GenerateKeywordsInput - The input type for the generateKeywords function.
 * - GenerateKeywordsOutput - The return type for the generateKeywords function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const GenerateKeywordsInputSchema = z.object({
  descricaoDocumento: z.string().describe('A descrição detalhada do conteúdo do documento.'),
  tipoDocumento: z.string().optional().describe('A espécie ou tipo do documento (ex: "Ação Ordinária", "Contrato").'),
  assuntoClassificacao: z.string().optional().describe('O assunto principal derivado da classificação arquivística (ex: "Processos Judiciais Cíveis").'),
  nomesDasPartes: z.array(z.string()).optional().describe('Uma lista com os nomes das partes envolvidas no documento.'),
});
export type GenerateKeywordsInput = z.infer<typeof GenerateKeywordsInputSchema>;

const GenerateKeywordsOutputSchema = z.object({
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
  model: 'googleai/gemini-1.5-flash-latest',
  input: {schema: GenerateKeywordsInputSchema},
  output: {schema: GenerateKeywordsOutputSchema},
  system: `Você é uma API JSON. Sua única tarefa é analisar as informações de um documento e retornar um objeto JSON com uma única chave "keywords". O valor dessa chave deve ser um array de strings (palavras-chave em português) relevantes para indexação.

**REGRAS ABSOLUTAS:**
1.  Sua resposta deve ser APENAS o objeto JSON.
2.  NÃO inclua markdown \`\`\`json.
3.  NÃO inclua explicações ou texto adicional.

**Exemplo de Saída Válida:**
{
  "keywords": ["tribunal de recursos", "procuração", "decreto 2681", "processo civil"]
}`,
  prompt: `**Contexto do Documento:**
- Descrição: {{{descricaoDocumento}}}
{{#if tipoDocumento}}
- Tipo de Documento: {{{tipoDocumento}}}
{{/if}}
{{#if assuntoClassificacao}}
- Assunto: {{{assuntoClassificacao}}}
{{/if}}
{{#if nomesDasPartes.length}}
- Partes: {{#each nomesDasPartes}}{{{this}}}{{/each}}
{{/if}}
`,
  config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_CIVIC_INTEGRITY', threshold: 'BLOCK_NONE' },
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
    const response = await prompt(input);
    const output = response.output;

    if (!output || !output.keywords) {
      console.error(
        "AI response did not conform to the output schema or was empty. Raw text:", 
        response.text
      );
      console.error("Full response object:", JSON.stringify(response));
      throw new Error(`Erro de IA: ${response.text}`);
    }
    return output;
  }
);
