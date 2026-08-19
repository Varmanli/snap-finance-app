'use client';

import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db/dexie';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { MaintenanceService } from '@/types';
import { formatNumber } from '@/lib/formatters/currency';
import { Wrench, ShieldCheck, Plus, CheckCircle2, AlertTriangle, Car } from 'lucide-react';

export default function VehiclePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<MaintenanceService | null>(null);

  const services = useLiveQuery(() => db.maintenanceServices.toArray(), []) || [];
  const records = useLiveQuery(() => db.dailyRecords.toArray(), []) || [];
  const settingsList = useLiveQuery(() => db.settings.toArray(), []) || [];
  const settings = settingsList[0] || { vehicleBrand: 'تیبا ۲', vehicleModel: 1399, initialKm: 100000 };

  const currentKm = records.length > 0
    ? Math.max(...records.map((r) => r.endKm || 0))
    : settings.initialKm;

  // Handler to perform service reset
  const handlePerformService = async (service: MaintenanceService) => {
    const updatedService: MaintenanceService = {
      ...service,
      lastServiceKm: currentKm,
      nextServiceKm: currentKm + service.intervalKm,
      status: 'normal',
    };
    if (service.id) {
      await db.maintenanceServices.put(updatedService);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card p-5">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Car className="h-7 w-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
              وضعیت سلامت و قطعات {settings.vehicleBrand} ({settings.vehicleModel})
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              کیلومتر فعلی خودرو: <span className="font-bold text-amber-400">{formatNumber(currentKm)} کیلومتر</span>
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setSelectedService(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 px-4 py-2.5 text-xs font-bold text-zinc-950 transition-all cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4 stroke-[3]" />
          <span>افزودن قطعه جدید</span>
        </button>
      </div>

      {/* Parts Health Monitor Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((service) => {
          const distanceSinceLast = Math.max(0, currentKm - service.lastServiceKm);
          const percentUsed = Math.min(100, Math.round((distanceSinceLast / service.intervalKm) * 100));
          const remainingKm = service.nextServiceKm - currentKm;
          const isOverdue = remainingKm < 0;
          const isDue = remainingKm >= 0 && remainingKm <= 1000;

          let badgeVariant: 'emerald' | 'amber' | 'rose' = 'emerald';
          let statusText = 'عالی';
          if (isOverdue) {
            badgeVariant = 'rose';
            statusText = 'انقضا گذشته';
          } else if (isDue) {
            badgeVariant = 'amber';
            statusText = 'موعد تعویض';
          }

          return (
            <Card key={service.id || service.title} className="space-y-4 border-zinc-800">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-zinc-100">{service.title}</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">{service.notes || 'بدون یادداشت'}</p>
                </div>
                <Badge variant={badgeVariant}>{statusText}</Badge>
              </div>

              {/* Progress bar */}
              <ProgressBar
                progress={percentUsed}
                color={isOverdue ? 'rose' : isDue ? 'amber' : 'emerald'}
                label={`کارکرد: ${formatNumber(distanceSinceLast)} / ${formatNumber(service.intervalKm)} کیلومتر`}
              />

              <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-xs">
                <div className="text-zinc-400">
                  {isOverdue ? (
                    <span className="text-rose-400 font-bold flex items-center gap-1">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      {formatNumber(Math.abs(remainingKm))} کیلومتر تاخیر داشته است!
                    </span>
                  ) : (
                    <span>باقیمانده: <strong className="text-zinc-200">{formatNumber(remainingKm)} کیلومتر</strong></span>
                  )}
                </div>

                <button
                  onClick={() => handlePerformService(service)}
                  className="flex items-center gap-1.5 rounded-lg bg-zinc-800 hover:bg-emerald-500/20 hover:text-emerald-400 text-zinc-300 px-3 py-1.5 font-medium transition-colors cursor-pointer text-xs"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>ثبت تعویض قطعه</span>
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Modal to Add New Service Item */}
      <AddServiceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentKm={currentKm}
      />
    </div>
  );
}

function AddServiceModal({
  isOpen,
  onClose,
  currentKm,
}: {
  isOpen: boolean;
  onClose: () => void;
  currentKm: number;
}) {
  const [title, setTitle] = useState('');
  const [intervalKm, setIntervalKm] = useState(10000);
  const [lastServiceKm, setLastServiceKm] = useState(currentKm);
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    const newService: MaintenanceService = {
      title,
      category: 'general_repair',
      lastServiceKm,
      intervalKm,
      nextServiceKm: lastServiceKm + intervalKm,
      status: 'normal',
      notes,
    };

    await db.maintenanceServices.add(newService);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="افزودن قطعه / سرویس دوره‌ای جدید">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1">عنوان قطعه یا سرویس</label>
          <input
            type="text"
            placeholder="مثلا: صافی بنزین، فیلتر کابین، روغن گیربکس"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:border-emerald-500 focus:outline-none"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">دوره تعویض (کیلومتر)</label>
            <input
              type="number"
              step="1000"
              value={intervalKm}
              onChange={(e) => setIntervalKm(Number(e.target.value))}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:border-emerald-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">کیلومتر آخرین تعویض</label>
            <input
              type="number"
              value={lastServiceKm}
              onChange={(e) => setLastServiceKm(Number(e.target.value))}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:border-emerald-500 focus:outline-none"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1">توضیحات یا برند پیشنهادی</label>
          <input
            type="text"
            placeholder="مثلا برند سرکان یا ایساکو"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-sm text-zinc-400 hover:bg-zinc-800 transition-colors"
          >
            انصراف
          </button>
          <button
            type="submit"
            className="rounded-xl bg-emerald-500 hover:bg-emerald-400 px-5 py-2 text-sm font-bold text-zinc-950 transition-all cursor-pointer"
          >
            افزودن سرویس
          </button>
        </div>
      </form>
    </Modal>
  );
}
