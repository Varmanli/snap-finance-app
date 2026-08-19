// Pure Financial Trajectory Forecasting & Goal Calculations

import { DailyRecord, CapitalTransaction, TrajectoryForecast, Settings } from '@/types';
import { calculateShiftSummary } from './financial';
import { formatJalaliDate } from '../formatters/jalali';

/**
 * Calculates 30-day moving average of daily real economic profit,
 * progress toward financial master goal (400M Toman),
 * projected completion date, and required daily savings rate to deadline.
 */
export function calculateTrajectoryForecast(
  records: DailyRecord[],
  capitalTransactions: CapitalTransaction[],
  settings: Settings
): TrajectoryForecast {
  const goalTargetAmount = settings.goalTargetAmount || 400000000;
  const depreciationRate = settings.depreciationRate || 1800;

  // 1. Calculate 30-day moving average of daily real profit
  const now = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(now.getDate() - 30);

  const recentRecords = records.filter((r) => {
    const recDate = new Date(r.date);
    return recDate >= thirtyDaysAgo;
  });

  const totalRecentRealProfit = recentRecords.reduce((sum, r) => {
    const summary = calculateShiftSummary(r, depreciationRate);
    return sum + summary.realProfit;
  }, 0);

  // Divide by 30 days (or actual distinct days logged if < 30)
  const daysInPeriod = Math.max(1, recentRecords.length || 30);
  const average30DayRealDailyProfit = Math.round(totalRecentRealProfit / daysInPeriod);

  // 2. Compute current total savings (Capital net + total cumulative real economic profit)
  const capitalNet = capitalTransactions.reduce((sum, tx) => {
    return tx.type === 'deposit' ? sum + tx.amount : sum - tx.amount;
  }, 0);

  const totalCumulativeRealProfit = records.reduce((sum, r) => {
    const summary = calculateShiftSummary(r, depreciationRate);
    return sum + summary.realProfit;
  }, 0);

  const currentTotalSavings = capitalNet + totalCumulativeRealProfit;

  // 3. Goal progress percent & remaining amount
  const remainingGoalAmount = Math.max(0, goalTargetAmount - currentTotalSavings);
  const rawProgress = (currentTotalSavings / goalTargetAmount) * 100;
  const goalProgressPercent = Math.min(100, Math.max(0, Math.round(rawProgress * 10) / 10));

  // 4. Required daily savings to target deadline date (e.g. 1 Farvardin 1406 -> 2027-03-21)
  const targetDeadline = settings.goalTargetDate ? new Date(settings.goalTargetDate) : new Date('2027-03-21');
  const msDiff = targetDeadline.getTime() - now.getTime();
  const daysRemainingToDeadline = Math.max(1, Math.ceil(msDiff / (1000 * 60 * 60 * 24)));

  const requiredDailySavingsToDeadline = Math.round(remainingGoalAmount / daysRemainingToDeadline);

  // 5. Projected completion date based on 30-day moving average daily savings
  let projectedCompletionDate: string | null = null;
  let projectedDaysRemaining: number | null = null;

  if (average30DayRealDailyProfit > 0 && remainingGoalAmount > 0) {
    projectedDaysRemaining = Math.ceil(remainingGoalAmount / average30DayRealDailyProfit);
    const projDate = new Date();
    projDate.setDate(now.getDate() + projectedDaysRemaining);
    projectedCompletionDate = formatJalaliDate(projDate);
  } else if (remainingGoalAmount <= 0) {
    projectedCompletionDate = 'هدف محقق شده است!';
    projectedDaysRemaining = 0;
  }

  return {
    average30DayRealDailyProfit,
    currentTotalSavings,
    remainingGoalAmount,
    goalProgressPercent,
    projectedCompletionDate,
    projectedDaysRemaining,
    requiredDailySavingsToDeadline,
    daysRemainingToDeadline,
  };
}
