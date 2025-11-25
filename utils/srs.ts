import { VocabWord, ReviewAction } from '../types';
import { DEFAULT_INTERVALS } from '../constants';

const MILLISECONDS_IN_DAY = 24 * 60 * 60 * 1000;

/**
 * Calculates the new level and next review date based on user action.
 * Intervals: [1, 3, 7, 14, 30]
 * 
 * Logic:
 * - EASY: Move to next interval (Level + 1)
 * - GOOD: Stay at current interval (Level unchanged)
 * - HARD: Move down one interval (Level - 1, min 0)
 */
export const calculateNextReview = (
  currentLevel: number,
  action: ReviewAction,
  intervals: number[] = DEFAULT_INTERVALS
): { level: number; nextDate: number } => {
  let newLevel = currentLevel;
  let daysToAdd = 1;

  switch (action) {
    case ReviewAction.EASY:
      // Move up a level, capped at max level (intervals.length)
      // Level 0 -> 1 (1 day)
      // Level 1 -> 2 (3 days)
      // ...
      // Level 4 -> 5 (30 days)
      newLevel = Math.min(currentLevel + 1, intervals.length);
      break;

    case ReviewAction.GOOD:
      // Stay at current level
      // Special case: If word is Level 0 (New), "Good" graduates it to Level 1 
      // so it enters the spaced cycle (1 day interval) instead of staying "New" forever.
      newLevel = currentLevel === 0 ? 1 : currentLevel;
      break;

    case ReviewAction.HARD:
      // Drop a level, floored at 0
      newLevel = Math.max(0, currentLevel - 1);
      break;
  }

  // Determine days until next review based on the NEW level
  if (newLevel === 0) {
    // Level 0 (New/Reset) -> Review tomorrow (1 day)
    daysToAdd = 1;
  } else {
    // Level 1 corresponds to index 0 in intervals array
    // intervals[0] = 1 day
    // intervals[4] = 30 days
    const intervalIndex = newLevel - 1;
    daysToAdd = intervals[intervalIndex];
  }

  const nextDate = Date.now() + (daysToAdd * MILLISECONDS_IN_DAY);
  
  // Normalize to midnight so reviews accumulate cleanly for "Today"
  const normalizedDate = new Date(nextDate);
  normalizedDate.setHours(0, 0, 0, 0);

  return {
    level: newLevel,
    nextDate: normalizedDate.getTime()
  };
};

export const isDue = (timestamp: number): boolean => {
  const now = new Date();
  const dueDate = new Date(timestamp);
  // Due if date is today or in the past
  return dueDate <= now;
};
