// Pure Financial Calculations and Virtual Depreciation Fund Logic

import { DailyRecord, DailyFinancialSummary, DepreciationFundSummary, VehicleExpense } from '@/types';

/**
 * Calculates cash expenses, depreciation, cash profit, and real economic profit for a single shift or record.
 */
export function calculateShiftSummary(
  record: {
    grossIncome: number;
    fuelExpense: number;
    parkingExpense: number;
    tollExpense: number;
    carwashExpense: number;
    otherExpenses: number;
    distanceKm: number;
  },
  depreciationRate: number = 1800
): DailyFinancialSummary {
  const fuel = record.fuelExpense || 0;
  const parking = record.parkingExpense || 0;
  const toll = record.tollExpense || 0;
  const carwash = record.carwashExpense || 0;
  const other = record.otherExpenses || 0;
  const gross = record.grossIncome || 0;
  const km = record.distanceKm || 0;

  const cashExpenses = fuel + parking + toll + carwash + other;
  const depreciation = Math.round(km * depreciationRate);
  const cashProfit = gross - cashExpenses;
  const realProfit = cashProfit - depreciation;

  return {
    cashExpenses,
    depreciation,
    cashProfit,
    realProfit,
  };
}

/**
 * Computes aggregate totals across a list of daily records.
 */
export function aggregateRecordsSummary(records: DailyRecord[], depreciationRate: number = 1800) {
  let totalGrossIncome = 0;
  let totalCashExpenses = 0;
  let totalDepreciation = 0;
  let totalCashProfit = 0;
  let totalRealProfit = 0;
  let totalDistanceKm = 0;
  let totalDurationMinutes = 0;

  for (const rec of records) {
    const summary = calculateShiftSummary(rec, depreciationRate);
    totalGrossIncome += rec.grossIncome || 0;
    totalCashExpenses += summary.cashExpenses;
    totalDepreciation += summary.depreciation;
    totalCashProfit += summary.cashProfit;
    totalRealProfit += summary.realProfit;
    totalDistanceKm += rec.distanceKm || 0;
    totalDurationMinutes += rec.durationMinutes || 0;
  }

  const shiftCount = records.length;
  const avgIncomePerShift = shiftCount > 0 ? Math.round(totalGrossIncome / shiftCount) : 0;
  const avgRealProfitPerShift = shiftCount > 0 ? Math.round(totalRealProfit / shiftCount) : 0;
  const avgKmPerShift = shiftCount > 0 ? Math.round(totalDistanceKm / shiftCount) : 0;

  return {
    totalGrossIncome,
    totalCashExpenses,
    totalDepreciation,
    totalCashProfit,
    totalRealProfit,
    totalDistanceKm,
    totalDurationMinutes,
    shiftCount,
    avgIncomePerShift,
    avgRealProfitPerShift,
    avgKmPerShift,
  };
}

/**
 * Calculates the Virtual Depreciation Fund status:
 * Accrued Fund = Total Distance Logged (km) * Depreciation Rate (Toman/km)
 * Spent From Fund = Sum of all Vehicle Expenses where paidFromDepreciationFund === true
 * Current Balance = Accrued Fund - Spent From Fund
 */
export function calculateDepreciationFund(
  records: DailyRecord[],
  expenses: VehicleExpense[],
  depreciationRate: number = 1800
): DepreciationFundSummary {
  const totalKmLogged = records.reduce((sum, r) => sum + (r.distanceKm || 0), 0);
  const accruedFund = Math.round(totalKmLogged * depreciationRate);

  const spentFromFund = expenses
    .filter((e) => e.paidFromDepreciationFund)
    .reduce((sum, e) => sum + (e.amount || 0), 0);

  const currentBalance = accruedFund - spentFromFund;

  return {
    totalKmLogged,
    accruedFund,
    spentFromFund,
    currentBalance,
  };
}
