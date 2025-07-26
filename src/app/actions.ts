'use server';

import {
  suggestOptimalTimes,
  SuggestOptimalTimesInput,
  SuggestOptimalTimesOutput,
} from '@/ai/flows/suggest-optimal-times';

export async function getAISuggestions(
  input: SuggestOptimalTimesInput
): Promise<SuggestOptimalTimesOutput> {
  try {
    const result = await suggestOptimalTimes(input);
    if (!result) {
        throw new Error('AI did not return a result.');
    }
    return result;
  } catch (error) {
    console.error('Error getting AI suggestions:', error);
    throw new Error('Failed to get suggestions from AI.');
  }
}
