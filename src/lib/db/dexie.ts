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
      settings: '++id',
    });
  }
}

export const db = new SnappDriverDB();

export const DEFAULT_SETTINGS: Settings = {
  id: 1,
  vehicleBrand: 'تیبا ۲ (هاشبک)',
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
 * Completely wipes all Dexie tables, deletes IndexedDB database, clears browser storage,
 * and performs a hard window reload to reset the application to pristine zero state.
 */
export async function hardResetLocalDatabase() {
  try {
    // Clear all tables
    await Promise.all(db.tables.map((table) => table.clear()));

    // Close active connection and delete IndexedDB
    await db.close();
    await Dexie.delete('SnappDriverFinanceDB');

    // Clear browser storage fallbacks
    if (typeof window !== 'undefined') {
      localStorage.clear();
      sessionStorage.clear();
    }

    // Hard reload
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  } catch (error) {
    console.error('Failed to reset DB:', error);
    if (typeof window !== 'undefined' && window.indexedDB) {
      window.indexedDB.deleteDatabase('SnappDriverFinanceDB');
      window.location.href = '/';
    }
  }
}
