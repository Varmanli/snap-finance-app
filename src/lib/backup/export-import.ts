// IndexedDB JSON Backup Export & Schema Validator Import Utility

import { db } from '../db/dexie';
import { BackupData } from '@/types';

/**
 * Exports all IndexedDB tables into a single structured, versioned JSON object and downloads it.
 */
export async function exportBackupJSON(): Promise<void> {
  const dailyRecords = await db.dailyRecords.toArray();
  const vehicleExpenses = await db.vehicleExpenses.toArray();
  const maintenanceServices = await db.maintenanceServices.toArray();
  const capitalTransactions = await db.capitalTransactions.toArray();
  const personalGoals = await db.personalGoals.toArray();
  const settingsList = await db.settings.toArray();
  const settings = settingsList[0] || ({} as any);

  const backupData: BackupData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    dailyRecords,
    vehicleExpenses,
    maintenanceServices,
    capitalTransactions,
    personalGoals,
    settings,
  };

  const jsonString = JSON.stringify(backupData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `snapp_driver_backup_${dateStr}.json`;

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Validates the structure and version of an imported JSON backup file.
 */
export function validateBackupJSON(data: any): { valid: boolean; error?: string; parsedData?: BackupData } {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'فایل وارد شده معتبر نمی‌باشد.' };
  }

  if (data.version !== 1) {
    return { valid: false, error: `نسخه فایل پشتیبان (${data.version}) پشتیبانی نمی‌شود. نسخه معتبر: ۱` };
  }

  if (!Array.isArray(data.dailyRecords) || !Array.isArray(data.vehicleExpenses)) {
    return { valid: false, error: 'ساختار داده‌های پشتیبان کامل نیست.' };
  }

  return { valid: true, parsedData: data as BackupData };
}

/**
 * Restores all database tables from a verified BackupData object.
 */
export async function restoreBackupJSON(backupData: BackupData): Promise<void> {
  await db.transaction(
    'rw',
    [
      db.dailyRecords,
      db.vehicleExpenses,
      db.maintenanceServices,
      db.capitalTransactions,
      db.personalGoals,
      db.settings,
    ],
    async () => {
      await db.dailyRecords.clear();
      await db.vehicleExpenses.clear();
      await db.maintenanceServices.clear();
      await db.capitalTransactions.clear();
      await db.personalGoals.clear();
      await db.settings.clear();

      if (backupData.dailyRecords?.length > 0) {
        await db.dailyRecords.bulkAdd(backupData.dailyRecords);
      }
      if (backupData.vehicleExpenses?.length > 0) {
        await db.vehicleExpenses.bulkAdd(backupData.vehicleExpenses);
      }
      if (backupData.maintenanceServices?.length > 0) {
        await db.maintenanceServices.bulkAdd(backupData.maintenanceServices);
      }
      if (backupData.capitalTransactions?.length > 0) {
        await db.capitalTransactions.bulkAdd(backupData.capitalTransactions);
      }
      if (backupData.personalGoals?.length > 0) {
        await db.personalGoals.bulkAdd(backupData.personalGoals);
      }
      if (backupData.settings) {
        await db.settings.put(backupData.settings);
      }
    }
  );
}
