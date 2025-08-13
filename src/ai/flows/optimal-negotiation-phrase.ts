'use server';
/**
 * @fileOverview An AI agent that helps drivers negotiate intercity fares with passengers.
 *
 * - getOptimalNegotiationPhrase - A function that returns the optimal negotiation phrase to use.
 * - GetOptimalNegotiationPhraseInput - The input type for the getOptimalNegotiationPhrase function.
 * - GetOptimalNegotiationPhraseOutput - The return type for the getOptimalNegotiationPhrase function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetOptimalNegotiationPhraseInputSchema = z.object({
  passengerName: z.string().describe('The name of the passenger.'),
  distanceInKm: z.number().describe('The distance of the intercity ride in kilometers.'),
  suggestedFare: z.number().describe('The fare suggested by the driver.'),
  passengerOffer: z.number().describe('The fare offered by the passenger.'),
});
export type GetOptimalNegotiationPhraseInput = z.infer<typeof GetOptimalNegotiationPhraseInputSchema>;

const GetOptimalNegotiationPhraseOutputSchema = z.object({
  optimalPhrase: z.string().describe('The optimal negotiation phrase to use with the passenger.'),
});
export type GetOptimalNegotiationPhraseOutput = z.infer<typeof GetOptimalNegotiationPhraseOutputSchema>;

export async function getOptimalNegotiationPhrase(
  input: GetOptimalNegotiationPhraseInput
): Promise<GetOptimalNegotiationPhraseOutput> {
  return optimalNegotiationPhraseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'optimalNegotiationPhrasePrompt',
  input: {schema: GetOptimalNegotiationPhraseInputSchema},
  output: {schema: GetOptimalNegotiationPhraseOutputSchema},
  prompt: `You are an expert negotiation assistant for intercity ride fares.

You are assisting a driver named Bob negotiating a fare with a passenger named {{{passengerName}}}.

The ride distance is {{{distanceInKm}}} km.

Bob's suggested fare is ${{{suggestedFare}}}.

{{{passengerName}}}'s offered fare is ${{{passengerOffer}}}.

What is the single most optimal negotiation phrase that Bob can use with {{{passengerName}}} to maximize the fare while still maintaining a positive relationship? Be polite and professional.

Optimal Negotiation Phrase: `,
});

const optimalNegotiationPhraseFlow = ai.defineFlow(
  {
    name: 'optimalNegotiationPhraseFlow',
    inputSchema: GetOptimalNegotiationPhraseInputSchema,
    outputSchema: GetOptimalNegotiationPhraseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
