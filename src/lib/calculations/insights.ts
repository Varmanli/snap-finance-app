import { DailyRecord } from '@/types';
import { calculateShiftSummary } from '@/lib/calculations/financial';
import { getPersianDayName } from '@/lib/formatters/jalali';
import { formatToman } from '@/lib/formatters/currency';

export interface DayOfWeekInsight {
  dayName: string;
  shiftCount: number;
  avgProfitPerHour: number;
  avgProfitPerKm: number;
  totalRealProfit: number;
}

export interface TimeSlotInsight {
  slotName: string;
  shiftCount: number;
  avgProfitPerHour: number;
}

export interface SmartInsightsData {
  bestDay: DayOfWeekInsight | null;
  bestTimeSlot: TimeSlotInsight | null;
  avgHourlyProfit: number;
  totalDistanceKm: number;
  dayBreakdown: DayOfWeekInsight[];
  insightMessages: string[];
}

export function calculateSmartInsights(
  records: DailyRecord[],
  depreciationRate: number
): SmartInsightsData {
  if (!records || records.length === 0) {
    return {
      bestDay: null,
      bestTimeSlot: null,
      avgHourlyProfit: 0,
      totalDistanceKm: 0,
      dayBreakdown: [],
      insightMessages: ['هنوز شیفت کاری برای تحلیل هوشمند ثبت نشده است.'],
    };
  }

  // Group by day of week
  const dayStats: Record<string, { count: number; totalProfit: number; totalHours: number; totalKm: number }> = {};
  const daysOfWeek = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'];

  daysOfWeek.forEach((d) => {
    dayStats[d] = { count: 0, totalProfit: 0, totalHours: 0, totalKm: 0 };
  });

  // Group by time slots (morning: 05-12, afternoon: 12-18, evening: 18-24)
  const timeSlots: Record<string, { count: number; totalProfit: number; totalHours: number }> = {
    'صبح (۰۵:۰۰ تا ۱۲:۰۰)': { count: 0, totalProfit: 0, totalHours: 0 },
    'عصر (۱۲:۰۰ تا ۱۸:۰۰)': { count: 0, totalProfit: 0, totalHours: 0 },
    'شب (۱۸:۰۰ تا ۲۴:۰۰)': { count: 0, totalProfit: 0, totalHours: 0 },
  };

  let totalProfitAll = 0;
  let totalHoursAll = 0;
  let totalKmAll = 0;

  records.forEach((r) => {
    const summary = calculateShiftSummary(r, depreciationRate);
    const dayName = getPersianDayName(r.date);
    const hours = Math.max(0.5, (r.durationMinutes || 480) / 60);

    totalProfitAll += summary.realProfit;
    totalHoursAll += hours;
    totalKmAll += r.distanceKm;

    if (dayStats[dayName]) {
      dayStats[dayName].count += 1;
      dayStats[dayName].totalProfit += summary.realProfit;
      dayStats[dayName].totalHours += hours;
      dayStats[dayName].totalKm += r.distanceKm;
    }

    // Time slot categorization
    const startHour = parseInt(r.startTime?.split(':')[0] || '8', 10);
    let slotKey = 'صبح (۰۵:۰۰ تا ۱۲:۰۰)';
    if (startHour >= 12 && startHour < 18) {
      slotKey = 'عصر (۱۲:۰۰ تا ۱۸:۰۰)';
    } else if (startHour >= 18 || startHour < 5) {
      slotKey = 'شب (۱۸:۰۰ تا ۲۴:۰۰)';
    }

    timeSlots[slotKey].count += 1;
    timeSlots[slotKey].totalProfit += summary.realProfit;
    timeSlots[slotKey].totalHours += hours;
  });

  const dayBreakdown: DayOfWeekInsight[] = daysOfWeek
    .map((d) => {
      const stat = dayStats[d];
      return {
        dayName: d,
        shiftCount: stat.count,
        avgProfitPerHour: stat.totalHours > 0 ? Math.round(stat.totalProfit / stat.totalHours) : 0,
        avgProfitPerKm: stat.totalKm > 0 ? Math.round(stat.totalProfit / stat.totalKm) : 0,
        totalRealProfit: stat.totalProfit,
      };
    })
    .filter((d) => d.shiftCount > 0);

  // Find best day
  let bestDay: DayOfWeekInsight | null = null;
  for (const d of dayBreakdown) {
    if (!bestDay || d.avgProfitPerHour > (bestDay as DayOfWeekInsight).avgProfitPerHour) {
      bestDay = d;
    }
  }

  // Find best time slot
  let bestTimeSlot: TimeSlotInsight | null = null;
  for (const [slotName, stat] of Object.entries(timeSlots)) {
    if (stat.count > 0) {
      const avg = stat.totalHours > 0 ? Math.round(stat.totalProfit / stat.totalHours) : 0;
      if (!bestTimeSlot || avg > (bestTimeSlot as TimeSlotInsight).avgProfitPerHour) {
        bestTimeSlot = { slotName, shiftCount: stat.count, avgProfitPerHour: avg };
      }
    }
  }

  const avgHourlyProfit = totalHoursAll > 0 ? Math.round(totalProfitAll / totalHoursAll) : 0;

  // Generate automated insight messages
  const insightMessages: string[] = [];

  if (bestDay) {
    const bDay = bestDay as DayOfWeekInsight;
    insightMessages.push(
      `روزهای ${bDay.dayName} با میانگین سود خالص ${formatToman(bDay.avgProfitPerHour)} در ساعت، بیشترین سودآوری هفته را برای شما داشته‌اند.`
    );
  }

  if (bestTimeSlot) {
    const bSlot = bestTimeSlot as TimeSlotInsight;
    insightMessages.push(
      `شیفت‌های شروع در بازه ${bSlot.slotName} با میانگین ${formatToman(bSlot.avgProfitPerHour)} سود ساعتی، بازدهی بهینه‌تری ثبت کرده‌اند.`
    );
  }

  if (totalKmAll > 0) {
    const avgProfitPerKmAll = Math.round(totalProfitAll / totalKmAll);
    insightMessages.push(
      `به ازای هر ۱ کیلومتر رانندگی، میانگین سود خالص ماندگار شما ${formatToman(avgProfitPerKmAll)} بوده است.`
    );
  }

  return {
    bestDay,
    bestTimeSlot,
    avgHourlyProfit,
    totalDistanceKm: totalKmAll,
    dayBreakdown,
    insightMessages,
  };
}
