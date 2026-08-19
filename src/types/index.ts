// Strict TypeScript Definitions for Local-First Financial & Vehicle Management App

export interface DailyRecord {
  id?: number;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  durationMinutes: number;
  startKm: number;
  endKm: number;
  distanceKm: number;
  grossIncome: number; // Integer Toman
  fuelExpense: number; // Integer Toman
  parkingExpense: number; // Integer Toman
  tollExpense: number; // Integer Toman
  carwashExpense: number; // Integer Toman
  otherExpenses: number; // Integer Toman
  fatigueLevel: number; // 1-10
  moodLevel: number; // 1-10
  notes?: string;
  createdAt: string; // ISO string
}

export interface VehicleExpense {
  id?: number;
  date: string; // YYYY-MM-DD
  km: number;
  category: VehicleExpenseCategory;
  amount: number; // Integer Toman
  notes?: string;
  paidFromDepreciationFund: boolean;
  createdAt: string;
}

export type VehicleExpenseCategory =
  | 'engine_oil' // روغن موتور
  | 'filters' // فیلترها (هوا، روغن، کابین)
  | 'brake_pads' // لنت ترمز
  | 'timing_belt' // تسمه تایم
  | 'tires' // لاستیک‌ها
  | 'spark_plugs' // شمع و وایر
  | 'suspension' // جلوبندی و کمک‌فنر
  | 'general_repair' // تعمیرات عمومی
  | 'other'; // سایر

export interface MaintenanceService {
  id?: number;
  title: string;
  category: VehicleExpenseCategory;
  lastServiceKm: number;
  intervalKm: number;
  nextServiceKm: number;
  status: 'normal' | 'due' | 'overdue';
  notes?: string;
}

export interface CapitalTransaction {
  id?: number;
  date: string; // YYYY-MM-DD
  type: 'deposit' | 'withdrawal';
  amount: number; // Integer Toman
  note?: string;
  createdAt: string;
}

export interface PersonalGoal {
  id?: number;
  title: string;
  targetWeeklyMinutes: number;
  loggedMinutes: number;
  notes?: string;
}

export interface Settings {
  id?: number;
  // Vehicle settings
  vehicleBrand: string; // e.g. "تیبا 2"
  vehicleModel: number; // e.g. 1399
  initialKm: number; // e.g. 100000
  depreciationRate: number; // e.g. 1800 Toman / km
  // Daily work targets
  targetDailyKm: number; // e.g. 250 km
  targetDailyIncome: number; // e.g. 2,500,000 Toman
  // Financial master goal
  goalTargetAmount: number; // e.g. 400,000,000 Toman
  goalTargetDate: string; // YYYY-MM-DD (e.g. 2027-03-21 -> 1 Farvardin 1406)
  updatedAt: string;
}

export interface DailyFinancialSummary {
  cashExpenses: number; // Fuel + Parking + Toll + Carwash + Other
  depreciation: number; // distanceKm * depreciationRate
  cashProfit: number; // grossIncome - cashExpenses
  realProfit: number; // cashProfit - depreciation
}

export interface TrajectoryForecast {
  average30DayRealDailyProfit: number;
  currentTotalSavings: number;
  remainingGoalAmount: number;
  goalProgressPercent: number;
  projectedCompletionDate: string | null; // Jalali formatted string or ISO
  projectedDaysRemaining: number | null;
  requiredDailySavingsToDeadline: number;
  daysRemainingToDeadline: number;
}

export interface DepreciationFundSummary {
  totalKmLogged: number;
  accruedFund: number; // totalKmLogged * rate
  spentFromFund: number; // sum of paidFromDepreciationFund expenses
  currentBalance: number; // accruedFund - spentFromFund
}

export interface BackupData {
  version: number;
  exportedAt: string;
  dailyRecords: DailyRecord[];
  vehicleExpenses: VehicleExpense[];
  maintenanceServices: MaintenanceService[];
  capitalTransactions: CapitalTransaction[];
  personalGoals: PersonalGoal[];
  settings: Settings;
}
