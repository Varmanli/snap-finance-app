'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { MaintenanceService } from '@/types';
import { formatNumber, toPersianDigits } from '@/lib/formatters/currency';
import { AlertTriangle, ShieldAlert, ArrowLeft } from 'lucide-react';

interface ServiceAlertsProps {
  services: MaintenanceService[];
  currentKm: number;
}

export function ServiceAlerts({ services, currentKm }: ServiceAlertsProps) {
  const alertServices = services.filter((s) => s.status === 'due' || s.status === 'overdue');

  if (alertServices.length === 0) {
    return (
      <Card className="border-emerald-500/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shrink-0">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-zinc-100">وضعیت سرویس‌های خودرو: عالی</h4>
              <p className="text-[11px] sm:text-xs text-zinc-400">همه قطعات مصرفی در محدوده کیلومتر استاندارد قرار دارند.</p>
            </div>
          </div>

          <Link
            href="/vehicle"
            className="self-start sm:self-auto text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 shrink-0 whitespace-nowrap pt-1 sm:pt-0"
          >
            <span>مشاهده قطعات</span>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-amber-500/30">
      <CardHeader>
        <CardTitle className="text-amber-400">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <span>هشدار نیازمند سرویس ({toPersianDigits(alertServices.length)} قطعه)</span>
        </CardTitle>

        <Link
          href="/vehicle"
          className="self-start sm:self-auto text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 shrink-0 whitespace-nowrap"
        >
          <span>مدیریت قطعات</span>
          <ArrowLeft className="h-4 w-4" />
        </Link>
      </CardHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
        {alertServices.map((service) => {
          const isOverdue = service.status === 'overdue';
          const remainingKm = service.nextServiceKm - currentKm;

          return (
            <div
              key={service.id || service.title}
              className={`rounded-xl p-3 border flex items-center justify-between gap-2 ${
                isOverdue
                  ? 'border-rose-500/40 bg-rose-950/20 text-rose-200'
                  : 'border-amber-500/40 bg-amber-950/20 text-amber-200'
              }`}
            >
              <div>
                <div className="text-xs sm:text-sm font-bold">{service.title}</div>
                <div className="text-[11px] opacity-80 mt-1">
                  {isOverdue ? (
                    <span className="text-rose-400 font-semibold">
                      {formatNumber(Math.abs(remainingKm))} کیلومتر گذشته است!
                    </span>
                  ) : (
                    <span className="text-amber-400">
                      {formatNumber(remainingKm)} کیلومتر تا سرویس
                    </span>
                  )}
                </div>
              </div>

              <Badge variant={isOverdue ? 'rose' : 'amber'}>
                {isOverdue ? 'انقضا گذشته' : 'موعد سرویس'}
              </Badge>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
