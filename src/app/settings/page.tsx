'use client';

import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { toast } from 'sonner';
import { db, DEFAULT_SETTINGS, hardResetLocalDatabase } from '@/lib/db/dexie';
import { seedDatabaseIfEmpty } from '@/lib/db/seed';
import { exportBackupJSON, validateBackupJSON, restoreBackupJSON } from '@/lib/backup/export-import';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { JalaliDatePicker } from '@/components/ui/JalaliDatePicker';
import { PersianNumberInput } from '@/components/ui/PersianNumberInput';
import { Settings as SettingsType, BackupData } from '@/types';
import { Settings, Save, Download, Upload, RefreshCw, Car, Target, ShieldCheck, CheckCircle, AlertTriangle, Trash2 } from 'lucide-react';

export default function SettingsPage() {
  const settingsList = useLiveQuery(() => db.settings.toArray(), []) || [];

  const [formData, setFormData] = useState<SettingsType>(DEFAULT_SETTINGS);
  const [isSaved, setIsSaved] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  // Restore state modal
  const [, setImportFile] = useState<File | null>(null);
  const [parsedBackup, setParsedBackup] = useState<BackupData | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // Clear data state modal
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    if (settingsList.length > 0) {
      setFormData(settingsList[0]);
    }
  }, [settingsList]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated = { ...formData, updatedAt: new Date().toISOString() };
    await db.settings.put(updated);
    setIsSaved(true);
    toast.success('تنظیمات با موفقیت ذخیره گردید.');
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFile(file);
    setImportError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const { valid, error, parsedData } = validateBackupJSON(json);
        if (!valid) {
          setImportError(error || 'ساختار فایل معتبر نیست.');
          toast.error(error || 'ساختار فایل معتبر نیست.');
          setParsedBackup(null);
        } else if (parsedData) {
          setParsedBackup(parsedData);
          setIsConfirmModalOpen(true);
        }
      } catch (err) {
        setImportError('فایل انتخاب شده یک JSON معتبر نمی‌باشد.');
        toast.error('فایل انتخاب شده یک JSON معتبر نمی‌باشد.');
        setParsedBackup(null);
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmRestore = async () => {
    if (!parsedBackup) return;

    try {
      await restoreBackupJSON(parsedBackup);
      setIsConfirmModalOpen(false);
      setParsedBackup(null);
      setImportFile(null);
      toast.success('اطلاعات با موفقیت از فایل پشتیبان بازیابی شد.');
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      console.error(err);
      toast.error('خطا در بازیابی پشتیبان.');
    }
  };

  const handleResetMockData = async () => {
    toast('آیا مایلید ۳۰ روز داده آزمایشی جدید تولید کنید؟', {
      action: {
        label: 'تولید داده',
        onClick: async () => {
          setIsSeeding(true);
          await seedDatabaseIfEmpty(true);
          setIsSeeding(false);
          toast.success('داده‌های ۳۰ روز شیفت کاری اسنپ مجدداً تولید گردید.');
          setTimeout(() => window.location.reload(), 1000);
        },
      },
      cancel: {
        label: 'انصراف',
        onClick: () => {},
      },
    });
  };

  const handleClearAllData = async () => {
    setIsClearing(true);
    try {
      toast.success('داده‌ها پاکسازی شدند. در حال بارگذاری مجدد...');
      await hardResetLocalDatabase();
    } catch (err) {
      console.error('Failed to clear database:', err);
      toast.error('خطا در پاکسازی پایگاه داده.');
      setIsClearing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-4 sm:p-5 border-emerald-500/30">
        <h2 className="text-base sm:text-xl font-bold text-zinc-100 flex items-center gap-2">
          <Settings className="h-5 w-5 text-emerald-400 shrink-0" />
          <span>تنظیمات سیستم، پیکربندی نرخ و پشتیبان‌گیری</span>
        </h2>
        <p className="text-[11px] sm:text-xs text-zinc-400 mt-1">
          تنظیم اطلاعات خودرو، سقف درآمد/مسافت روزانه، هدف مالی ۴۰۰ میلیونی و خروجی/ورودی JSON
        </p>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* 1. Vehicle Config Card */}
        <Card className="border-amber-500/20">
          <CardHeader>
            <CardTitle className="amber-gradient-text">
              <Car className="h-5 w-5 text-amber-400" />
              پیکربندی مشخصات خودرو و نرخ استهلاک
            </CardTitle>
          </CardHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">مدل/برند خودرو</label>
              <input
                type="text"
                value={formData.vehicleBrand || ''}
                onChange={(e) => setFormData({ ...formData, vehicleBrand: e.target.value })}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:border-emerald-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">سال ساخت (شمسی)</label>
              <input
                type="number"
                value={formData.vehicleModel || 1399}
                onChange={(e) => setFormData({ ...formData, vehicleModel: Number(e.target.value) })}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:border-emerald-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">کیلومتر اولیه شروع به کار</label>
              <PersianNumberInput
                value={formData.initialKm || 100000}
                onChange={(val) => setFormData({ ...formData, initialKm: val })}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:border-emerald-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-amber-400 mb-1">نرخ استهلاک (تومان / کیلومتر)</label>
              <PersianNumberInput
                value={formData.depreciationRate || 1800}
                onChange={(val) => setFormData({ ...formData, depreciationRate: val })}
                className="w-full rounded-lg border border-amber-500/40 bg-zinc-950 px-3 py-2 text-sm font-bold text-amber-400 focus:border-amber-400 focus:outline-none"
                required
              />
            </div>
          </div>
        </Card>

        {/* 2. Daily Target & Master Financial Goal Card */}
        <Card className="border-emerald-500/20">
          <CardHeader>
            <CardTitle className="emerald-gradient-text">
              <Target className="h-5 w-5 text-emerald-400" />
              اهداف کاری روزانه و هدف مالی کل (۴۰۰ میلیون تومان)
            </CardTitle>
          </CardHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">سقف کارکرد روزانه (کیلومتر)</label>
              <PersianNumberInput
                value={formData.targetDailyKm || 250}
                onChange={(val) => setFormData({ ...formData, targetDailyKm: val })}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:border-emerald-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">هدف درآمد روزانه (تومان)</label>
              <PersianNumberInput
                value={formData.targetDailyIncome || 2500000}
                onChange={(val) => setFormData({ ...formData, targetDailyIncome: val })}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:border-emerald-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">مبلغ هدف کل پس‌انداز (تومان)</label>
              <PersianNumberInput
                value={formData.goalTargetAmount || 400000000}
                onChange={(val) => setFormData({ ...formData, goalTargetAmount: val })}
                className="w-full rounded-lg border border-emerald-500/40 bg-zinc-950 px-3 py-2 text-sm font-bold text-emerald-400 focus:border-emerald-400 focus:outline-none"
                required
              />
            </div>

            <JalaliDatePicker
              label="تاریخ ددلاین هدف (شمسی)"
              value={formData.goalTargetDate || '2027-03-21'}
              onChange={(newIso) => setFormData({ ...formData, goalTargetDate: newIso })}
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
            {isSaved ? (
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle className="h-4 w-4" /> تنظیمات با موفقیت ذخیره گردید.
              </span>
            ) : (
              <span />
            )}

            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 px-6 py-2.5 text-xs font-bold text-zinc-950 transition-all cursor-pointer shadow-lg shadow-emerald-950/50"
            >
              <Save className="h-4 w-4" />
              <span>ذخیره تنظیمات</span>
            </button>
          </div>
        </Card>
      </form>

      {/* Backup, Restore, Demo Reset & Clear Data Card */}
      <Card className="border-blue-500/20">
        <CardHeader>
          <CardTitle className="text-blue-400">
            <ShieldCheck className="h-5 w-5" />
            پشتیبان‌گیری (JSON Backup)، بازیابی و داده‌های آزمایشی
          </CardTitle>
        </CardHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Export JSON */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold text-zinc-100">
                <Download className="h-5 w-5 text-emerald-400" />
                دانلود پشتیبان کامل (JSON)
              </div>
              <p className="text-xs text-zinc-400">
                استخراج تمامی سوابق شیفت‌ها، قطعات، تراکنش‌ها و تنظیمات در قالب فایل JSON.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                exportBackupJSON();
                toast.success('فایل پشتیبان JSON با موفقیت دانلود شد.');
              }}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 py-2 text-xs font-bold transition-all cursor-pointer"
            >
              <span>دانلود فایل JSON</span>
            </button>
          </div>

          {/* Import JSON */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold text-zinc-100">
                <Upload className="h-5 w-5 text-blue-400" />
                بازیابی از فایل پشتیبان
              </div>
              <p className="text-xs text-zinc-400">
                بارگذاری فایل JSON و جایگزینی داده‌های قبلی مرورگر با تایید ساختار.
              </p>
            </div>
            <div>
              <label className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 py-2 text-xs font-bold transition-all cursor-pointer">
                <span>انتخاب فایل JSON</span>
                <input type="file" accept=".json" onChange={handleFileChange} className="hidden" />
              </label>
              {importError && <p className="text-[11px] text-rose-400 mt-1">{importError}</p>}
            </div>
          </div>

          {/* Reset 30-Day Seed Demo */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold text-zinc-100">
                <RefreshCw className="h-5 w-5 text-amber-400" />
                تولید داده آزمایشی ۳۰ روزه
              </div>
              <p className="text-xs text-zinc-400">
                بازنشانی پایگاه‌داده محلی و تولید ۳۰ روز داده واقعی اسنپ جهت تست و دمو.
              </p>
            </div>
            <button
              type="button"
              onClick={handleResetMockData}
              disabled={isSeeding}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 py-2 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
            >
              <span>{isSeeding ? 'در حال تولید...' : 'تولید داده‌های ۳۰ روزه دمو'}</span>
            </button>
          </div>

          {/* Clear All Data (Reset Database) */}
          <div className="rounded-xl border border-rose-500/30 bg-rose-950/10 p-4 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-bold text-rose-400">
                <Trash2 className="h-5 w-5 text-rose-500" />
                پاک کردن و ریست تمام اطلاعات
              </div>
              <p className="text-xs text-zinc-400">
                حذف کامل تمام شیفت‌ها، تراکنش‌ها و هزینه‌ها و بازگرداندن برنامه به حالت خام اولیه.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsClearModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white py-2 text-xs font-bold transition-all cursor-pointer shadow-lg shadow-rose-950/50"
            >
              <Trash2 className="h-4 w-4" />
              <span>پاک کردن تمام داده‌ها</span>
            </button>
          </div>
        </div>
      </Card>

      {/* Backup Confirmation Modal */}
      {parsedBackup && (
        <Modal
          isOpen={isConfirmModalOpen}
          onClose={() => setIsConfirmModalOpen(false)}
          title="تایید بازیابی فایل پشتیبان"
        >
          <div className="space-y-4 text-xs text-zinc-300">
            <div className="rounded-xl border border-amber-500/40 bg-amber-950/20 p-3 text-amber-200 flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong>هشدار:</strong> با تایید این عملیات، کلیه اطلاعات فعلی پایگاه داده مرورگر شما پاک شده و با اطلاعات فایل پشتیبان جایگزین خواهد شد.
              </div>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3 space-y-1.5">
              <div>تاریخ استخراج پشتیبان: <strong className="text-zinc-100">{parsedBackup.exportedAt}</strong></div>
              <div>تعداد شیفت‌ها: <strong className="text-emerald-400">{parsedBackup.dailyRecords?.length || 0} شیفت</strong></div>
              <div>تعداد هزینه‌ها: <strong className="text-amber-400">{parsedBackup.vehicleExpenses?.length || 0} هزینه</strong></div>
              <div>تراکنش‌های سرمایه: <strong className="text-blue-400">{parsedBackup.capitalTransactions?.length || 0} تراکنش</strong></div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
              <button
                onClick={() => setIsConfirmModalOpen(false)}
                className="rounded-xl px-4 py-2 text-zinc-400 hover:bg-zinc-800 cursor-pointer"
              >
                انصراف
              </button>
              <button
                onClick={handleConfirmRestore}
                className="rounded-xl bg-amber-500 hover:bg-amber-400 px-5 py-2 font-bold text-zinc-950 cursor-pointer"
              >
                تایید جایگزینی قطعی
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Clear All Data Confirmation Modal */}
      <Modal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        title="ریست قطعی و پاکسازی تمام اطلاعات"
      >
        <div className="space-y-4 text-xs text-zinc-300">
          <div className="rounded-xl border border-rose-500/40 bg-rose-950/30 p-3.5 text-rose-200 flex items-start gap-2.5">
            <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="text-sm font-bold text-rose-300">هشدار بسیار مهم:</strong>
              <p>
                آیا مطمئن هستید؟ تمام اطلاعات ثبت‌شده، سوابق شیفت‌ها و هزینه‌ها پاک خواهند شد و برنامه به حالت صفر بازمی‌گردد. این عملیات غیرقابل بازگشت است.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
            <button
              onClick={() => setIsClearModalOpen(false)}
              className="rounded-xl px-4 py-2 text-zinc-400 hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              انصراف
            </button>
            <button
              onClick={handleClearAllData}
              disabled={isClearing}
              className="rounded-xl bg-rose-600 hover:bg-rose-500 px-5 py-2 font-bold text-white shadow-lg shadow-rose-950/60 cursor-pointer transition-all disabled:opacity-50"
            >
              {isClearing ? 'در حال پاکسازی...' : 'پاکسازی قطعی پایگاه داده'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
