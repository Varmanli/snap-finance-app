// Dexie.js Local IndexedDB Schema Definition

import Dexie, { Table } from 'dexie';
import {
  DailyRecord,
  VehicleExpense,
  MaintenanceService,
  CapitalTransaction,
  PersonalGoal,
  Settings,
} from '@/types';

export class SnappDriverDB extends Dexie {
  dailyRecords!: Table<DailyRecord, number>;
  vehicleExpenses!: Table<VehicleExpense, number>;
  maintenanceServices!: Table<MaintenanceService, number>;
  capitalTransactions!: Table<CapitalTransaction, number>;
  personalGoals!: Table<PersonalGoal, number>;
  settings!: Table<Settings, number>;

  constructor() {
    super('SnappDriverFinanceDB');
    this.version(1).stores({
      dailyRecords: '++id, date, startKm, endKm, grossIncome, createdAt',
      vehicleExpenses: '++id, date, km, category, paidFromDepreciationFund, createdAt',
      maintenanceServices: '++id, title, category, nextServiceKm, status',
      capitalTransactions: '++id, date, type, createdAt',
      personalGoals: '++id, title',
      settings: 'id', // Fixed primary key id: 1 for single settings row
    });
  }
}

export const db = new SnappDriverDB();

export const DEFAULT_SETTINGS: Settings = {
  id: 1,
  vehicleBrand: 'تیبا',
  vehicleModel: 1399,
  initialKm: 100000,
  depreciationRate: 1800, // Toman / km
  targetDailyKm: 250, // km / day
  targetDailyIncome: 2500000, // Toman / day
  goalTargetAmount: 400000000, // 400M Toman
  goalTargetDate: '2027-03-21', // 1 Farvardin 1406
  updatedAt: new Date().toISOString(),
};

/**
 * Completely wipes all Dexie tables, resets settings to clean initial state,
 * sets is_seeded = 'false' in localStorage, and performs a hard reload.
 */
export async function hardResetLocalDatabase() {
  try {
    // 1. Clear all Dexie data tables
    await db.transaction('rw', [db.dailyRecords, db.vehicleExpenses, db.maintenanceServices, db.capitalTransactions, db.personalGoals, db.settings], async () => {
      await db.dailyRecords.clear();
      await db.vehicleExpenses.clear();
      await db.maintenanceServices.clear();
      await db.capitalTransactions.clear();
      await db.personalGoals.clear();
      await db.settings.clear();
      // Put clean initial settings
      await db.settings.put(DEFAULT_SETTINGS);
    });

    // 2. Clear browser storage & set is_seeded flag to false
    if (typeof window !== 'undefined') {
      localStorage.clear();
      sessionStorage.clear();
      localStorage.setItem('is_seeded', 'false');
    }

    // 3. Hard reload to homepage with fresh clean state
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  } catch (error) {
    console.error('Failed to reset DB:', error);
    if (typeof window !== 'undefined') {
      localStorage.clear();
      localStorage.setItem('is_seeded', 'false');
      if (window.indexedDB) {
        window.indexedDB.deleteDatabase('SnappDriverFinanceDB');
      }
      window.location.href = '/';
    }
  }
}
