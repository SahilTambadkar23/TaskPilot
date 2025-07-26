'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting optimal times for activities based on the user's schedule and productivity patterns.
 *
 * - suggestOptimalTimes - An async function that takes an activity description and existing schedule, and returns suggested optimal times.
 * - SuggestOptimalTimesInput - The input type for the suggestOptimalTimes function.
 * - SuggestOptimalTimesOutput - The output type for the suggestOptimalTimes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestOptimalTimesInputSchema = z.object({
  activityDescription: z
    .string()
    .describe('A description of the activity to be scheduled.'),
  existingSchedule: z
    .string()
    .describe('A JSON string representing the user\'s existing schedule.'),
  userProductivityPatterns: z
    .string()
    .describe('A JSON string representing the user\'s typical productivity patterns.'),
});
export type SuggestOptimalTimesInput = z.infer<typeof SuggestOptimalTimesInputSchema>;

const SuggestOptimalTimesOutputSchema = z.object({
  suggestedTimes: z
    .string()
    .describe('A JSON string representing the suggested optimal times for the activity.'),
  reasoning: z
    .string()
    .describe('The AI reasoning behind the suggested times.'),
});
export type SuggestOptimalTimesOutput = z.infer<typeof SuggestOptimalTimesOutputSchema>;

export async function suggestOptimalTimes(input: SuggestOptimalTimesInput): Promise<SuggestOptimalTimesOutput> {
  return suggestOptimalTimesFlow(input);
}

const suggestOptimalTimesPrompt = ai.definePrompt({
  name: 'suggestOptimalTimesPrompt',
  input: {schema: SuggestOptimalTimesInputSchema},
  output: {schema: SuggestOptimalTimesOutputSchema},
  prompt: `You are an AI assistant specialized in scheduling and time management. Given the description of an activity, the user\'s existing schedule, and their typical productivity patterns, suggest the optimal times for the new activity.

Activity Description: {{{activityDescription}}}

Existing Schedule: {{{existingSchedule}}}

User Productivity Patterns: {{{userProductivityPatterns}}}

Consider the existing schedule to avoid conflicts and the productivity patterns to suggest times when the user is most likely to be productive. Output the suggested times as a JSON string and include a brief explanation of your reasoning.

Output the suggested times as a JSON string array.
`,
});

const suggestOptimalTimesFlow = ai.defineFlow(
  {
    name: 'suggestOptimalTimesFlow',
    inputSchema: SuggestOptimalTimesInputSchema,
    outputSchema: SuggestOptimalTimesOutputSchema,
  },
  async input => {
    const {output} = await suggestOptimalTimesPrompt(input);
    return output!;
  }
);
