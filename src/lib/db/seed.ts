// 30-Day Mock Seed Data Generator for Dexie.js

import { db, DEFAULT_SETTINGS } from './dexie';
import { DailyRecord, VehicleExpense, MaintenanceService, CapitalTransaction, PersonalGoal } from '@/types';

export async function seedDatabaseIfEmpty(forceReset: boolean = false) {
  const recordCount = await db.dailyRecords.count();
  if (recordCount > 0 && !forceReset) {
    return; // Already populated
  }

  if (forceReset) {
    await db.transaction('rw', [db.dailyRecords, db.vehicleExpenses, db.maintenanceServices, db.capitalTransactions, db.personalGoals, db.settings], async () => {
      await db.dailyRecords.clear();
      await db.vehicleExpenses.clear();
      await db.maintenanceServices.clear();
      await db.capitalTransactions.clear();
      await db.personalGoals.clear();
      await db.settings.clear();
    });
  }

  // 1. Save Default Settings
  await db.settings.put(DEFAULT_SETTINGS);

  // 2. Generate 30 days of realistic daily shifts
  const mockDailyRecords: DailyRecord[] = [];
  let currentOdometer = 100000;

  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const shiftDate = new Date();
    shiftDate.setDate(now.getDate() - i);
    
    // Skip Fridays as rest day (or half day) occasionally
    const dayOfWeek = shiftDate.getDay();
    if (dayOfWeek === 5 && Math.random() > 0.4) {
      continue; // Friday off
    }

    const isoDate = shiftDate.toISOString().split('T')[0];
    const distanceKm = Math.floor(180 + Math.random() * 80); // 180 - 260 km
    const startKm = currentOdometer;
    const endKm = startKm + distanceKm;
    currentOdometer = endKm;

    const durationMinutes = Math.floor(420 + Math.random() * 120); // 7 - 9 hours
    const grossIncome = Math.floor((1900000 + Math.random() * 900000) / 10000) * 10000; // 1.9M - 2.8M Toman
    const fuelExpense = Math.floor((120000 + Math.random() * 80000) / 5000) * 5000; // 120k - 200k Toman
    const parkingExpense = Math.floor((20000 + Math.random() * 30000) / 5000) * 5000;
    const tollExpense = Math.floor((10000 + Math.random() * 20000) / 5000) * 5000;
    const carwashExpense = Math.random() > 0.7 ? 80000 : 0;
    const otherExpenses = Math.random() > 0.8 ? 50000 : 0;

    mockDailyRecords.push({
      date: isoDate,
      startTime: '07:30',
      endTime: '16:00',
      durationMinutes,
      startKm,
      endKm,
      distanceKm,
      grossIncome,
      fuelExpense,
      parkingExpense,
      tollExpense,
      carwashExpense,
      otherExpenses,
      fatigueLevel: Math.floor(4 + Math.random() * 5),
      moodLevel: Math.floor(5 + Math.random() * 5),
      notes: i % 5 === 0 ? 'شیفت پرکار و عالی با اسنپ در مسیرهای شمال تهران' : undefined,
      createdAt: shiftDate.toISOString(),
    });
  }

  await db.dailyRecords.bulkAdd(mockDailyRecords);

  // 3. Maintenance Services Status
  const currentKm = currentOdometer;
  const mockMaintenance: MaintenanceService[] = [
    {
      title: 'تعویض روغن موتور و فیلترها',
      category: 'engine_oil',
      lastServiceKm: currentKm - 5400,
      intervalKm: 6000,
      nextServiceKm: currentKm + 600,
      status: 'due',
      notes: 'روغن ۱۰W40 سپاهان یا بهران پیشتاز',
    },
    {
      title: 'لنت ترمز جلو',
      category: 'brake_pads',
      lastServiceKm: currentKm - 18000,
      intervalKm: 25000,
      nextServiceKm: currentKm + 7000,
      status: 'normal',
      notes: 'لنت شرکتی سایپا یا گلد',
    },
    {
      title: 'تسمه تایم و تسمه دینام',
      category: 'timing_belt',
      lastServiceKm: currentKm - 58000,
      intervalKm: 60000,
      nextServiceKm: currentKm + 2000,
      status: 'due',
      notes: 'بررسی وضعیت کشش و دندانه‌ها',
    },
    {
      title: 'لاستیک‌های جلو',
      category: 'tires',
      lastServiceKm: currentKm - 45000,
      intervalKm: 70000,
      nextServiceKm: currentKm + 25000,
      status: 'normal',
      notes: 'کویر تایر ۱۷۵/۷۰R۱۳',
    },
    {
      title: 'شمع و وایر',
      category: 'spark_plugs',
      lastServiceKm: currentKm - 32000,
      intervalKm: 30000,
      nextServiceKm: currentKm - 2000,
      status: 'overdue',
      notes: 'شمع اینجکشن ان‌جی‌کی',
    },
  ];

  await db.maintenanceServices.bulkAdd(mockMaintenance);

  // 4. Vehicle Expenses (Some paid from depreciation fund)
  const mockExpenses: VehicleExpense[] = [
    {
      date: new Date(Date.now() - 22 * 86400000).toISOString().split('T')[0],
      km: currentKm - 4800,
      category: 'engine_oil',
      amount: 750000,
      notes: 'تعویض روغن بهران پیشتاز + فیلتر روغن و فیلتر هوا',
      paidFromDepreciationFund: true,
      createdAt: new Date().toISOString(),
    },
    {
      date: new Date(Date.now() - 12 * 86400000).toISOString().split('T')[0],
      km: currentKm - 2500,
      category: 'general_repair',
      amount: 1200000,
      notes: 'تعویض گردگیر پلوس و تنظیم موتور',
      paidFromDepreciationFund: true,
      createdAt: new Date().toISOString(),
    },
    {
      date: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
      km: currentKm - 1000,
      category: 'other',
      amount: 350000,
      notes: 'خرید مایه شیشه‌شور و اسپری داشبورد',
      paidFromDepreciationFund: false,
      createdAt: new Date().toISOString(),
    },
  ];

  await db.vehicleExpenses.bulkAdd(mockExpenses);

  // 5. Capital Transactions (Initial deposit + additional savings)
  const mockCapital: CapitalTransaction[] = [
    {
      date: new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0],
      type: 'deposit',
      amount: 65000000, // 65 Million Toman initial seed
      note: 'موجودی اولیه صندوق پس‌انداز خرید خودروی جدید',
      createdAt: new Date().toISOString(),
    },
    {
      date: new Date(Date.now() - 10 * 86400000).toISOString().split('T')[0],
      type: 'deposit',
      amount: 15000000, // 15 Million Toman deposit
      note: 'واریز سود خالص شیفت‌های هفته قبل به صندوق',
      createdAt: new Date().toISOString(),
    },
  ];

  await db.capitalTransactions.bulkAdd(mockCapital);

  // 6. Personal Goals
  const mockGoals: PersonalGoal[] = [
    {
      title: 'ورزش و پیاده‌روی هفتگی',
      targetWeeklyMinutes: 180,
      loggedMinutes: 120,
      notes: '۳ روز در هفته بعد از پایان شیفت کاری',
    },
    {
      title: 'صرف وقت با خانواده و فرزندان',
      targetWeeklyMinutes: 600,
      loggedMinutes: 480,
      notes: 'عصر روزهای جمعه و روزهای نیمه‌تعطیل',
    },
    {
      title: 'مطالعه کتاب و توسعه فردی',
      targetWeeklyMinutes: 120,
      loggedMinutes: 90,
      notes: '۳۰ دقیقه قبل از خواب',
    },
  ];

  await db.personalGoals.bulkAdd(mockGoals);
}
