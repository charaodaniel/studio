'use server';
/**
 * @fileOverview An AI agent that helps a passenger negotiate an intercity fare with AI-suggested phrases.
 *
 * - negotiateIntercityFare - A function that handles the fare negotiation process.
 * - NegotiateIntercityFareInput - The input type for the negotiateIntercityFare function.
 * - NegotiateIntercityFareOutput - The return type for the negotiateIntercityFare function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const NegotiateIntercityFareInputSchema = z.object({
  passengerMessage: z
    .string()
    .describe('The current message from the passenger to the driver.'),
  driverMessage: z.string().describe('The current message from the driver to the passenger.'),
  initialFare: z.number().describe('The initial fare proposed by the driver.'),
  suggestedFare: z.number().describe('The fare the passenger is willing to pay.'),
});
export type NegotiateIntercityFareInput = z.infer<typeof NegotiateIntercityFareInputSchema>;

const NegotiateIntercityFareOutputSchema = z.object({
  suggestedPhrases: z
    .array(z.string())
    .describe('AI-suggested phrases for the passenger to use in the negotiation.'),
});
export type NegotiateIntercityFareOutput = z.infer<typeof NegotiateIntercityFareOutputSchema>;

export async function negotiateIntercityFare(input: NegotiateIntercityFareInput): Promise<NegotiateIntercityFareOutput> {
  return negotiateIntercityFareFlow(input);
}

const prompt = ai.definePrompt({
  name: 'negotiateIntercityFarePrompt',
  input: {schema: NegotiateIntercityFareInputSchema},
  output: {schema: NegotiateIntercityFareOutputSchema},
  prompt: `You are an AI assistant helping a passenger negotiate an intercity fare with a driver.
  The driver has proposed an initial fare of {{initialFare}}.
  The passenger is willing to pay {{suggestedFare}}.

  The passenger has sent the following message: {{{passengerMessage}}}
  The driver has responded with: {{{driverMessage}}}

  Suggest three different phrases the passenger could use to negotiate effectively. The phrases should be polite and persuasive, and should take into account the driver's perspective.
  The phrases should be designed to move the negotiation towards the passenger's desired fare of {{suggestedFare}}.
  The phrases must be no longer than 20 words.
  Output the phrases in an array of strings.
  `,
});

const negotiateIntercityFareFlow = ai.defineFlow(
  {
    name: 'negotiateIntercityFareFlow',
    inputSchema: NegotiateIntercityFareInputSchema,
    outputSchema: NegotiateIntercityFareOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
