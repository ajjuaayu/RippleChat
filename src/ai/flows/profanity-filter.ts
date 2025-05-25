'use server';
/**
 * @fileOverview Profanity filter AI agent.
 *
 * - moderateText - A function that moderates text for profanity.
 * - ModerateTextInput - The input type for the moderateText function.
 * - ModerateTextOutput - The return type for the moderateText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ModerateTextInputSchema = z.object({
  text: z.string().describe('The text to moderate for profanity.'),
});
export type ModerateTextInput = z.infer<typeof ModerateTextInputSchema>;

const ModerateTextOutputSchema = z.object({
  isProfane: z.boolean().describe('Whether the text contains profanity.'),
  reason: z.string().describe('The reason for the profanity detection.'),
});
export type ModerateTextOutput = z.infer<typeof ModerateTextOutputSchema>;

export async function moderateText(input: ModerateTextInput): Promise<ModerateTextOutput> {
  return moderateTextFlow(input);
}

const moderateTextPrompt = ai.definePrompt({
  name: 'moderateTextPrompt',
  input: {schema: ModerateTextInputSchema},
  output: {schema: ModerateTextOutputSchema},
  prompt: `You are a content moderation expert. Determine if the following text contains profanity.

Text: {{{text}}}

Respond with a JSON object indicating whether the text contains profanity and the reason for your determination.`,
});

const moderateTextFlow = ai.defineFlow(
  {
    name: 'moderateTextFlow',
    inputSchema: ModerateTextInputSchema,
    outputSchema: ModerateTextOutputSchema,
  },
  async input => {
    const {output} = await moderateTextPrompt(input);
    return output!;
  }
);
