/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { DailyLog, PrayerStatus, PrayerId } from '../types';
import { PRAYERS } from '../constants';
import { getFormattedGregorianDate, getHijriDate } from '../utils';
import { 
  ChevronRight, 
  ChevronLeft,
  Clock, 
  CheckCircle2, 
  Users, 
  X
} from 'lucide-react';

interface DailyLogCardProps {
  currentDate: string;
  log: DailyLog;
  onUpdateLog: (log: DailyLog) => void;
  onNavigateDate: (days: number) => void;
}

export default function DailyLogCard({
  currentDate,
  log,
  onUpdateLog,
  onNavigateDate
}: DailyLogCardProps) {
  
  const updatePrayerStatus = (prayerId: PrayerId, status: PrayerStatus) => {
    const updatedLog: DailyLog = {
      ...log,
      prayers: {
        ...log.prayers,
        [prayerId]: status
      }
    };
    onUpdateLog(updatedLog);
  };

  return (
    <div className="bg-white rounded-none border border-[#E5E2D9] shadow-sm relative overflow-hidden text-[#1A1A1A]">
      {/* Decorative Traditional Forest Green Top Line */}
      <div className="absolute top-0 inset-x-0 h-1 bg-[#2D4F1E]" />
      
      {/* Date Header Section */}
      <div className="p-3 border-b border-[#E5E2D9] flex justify-center">
        <div className="flex items-center gap-2 w-full justify-between sm:justify-center sm:gap-4">
          {/* Navigate Backwards */}
          <button
            onClick={() => onNavigateDate(-1)}
            id="prev-day-btn"
            className="p-1.5 rounded-none border border-[#E5E2D9] bg-white hover:bg-[#FDFBF7] text-[#1A1A1A] hover:border-[#2D4F1E] transition-all active:scale-95 cursor-pointer"
            title="اليوم السابق"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          
          <div className="text-center">
            <h2 className="text-sm sm:text-lg font-bold text-[#1A1A1A] flex items-center justify-center gap-2 font-serif">
              <span>{getFormattedGregorianDate(currentDate)}</span>
            </h2>
            <p className="text-[10px] sm:text-xs font-bold text-[#D4AF37] tracking-wide mt-0.5 font-serif">
              {getHijriDate(currentDate)}
            </p>
          </div>

          {/* Navigate Forwards */}
          <button
            onClick={() => onNavigateDate(1)}
            id="next-day-btn"
            className="p-1.5 rounded-none border border-[#E5E2D9] bg-white hover:bg-[#FDFBF7] text-[#1A1A1A] hover:border-[#2D4F1E] transition-all active:scale-95 cursor-pointer"
            title="اليوم التالي"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Logging Core */}
      <div className="p-3.5 space-y-3">
        {/* Five Daily Prayers Checklist */}
        <div className="space-y-2.5">
          {PRAYERS.map((prayer) => {
            const currentStatus = log.prayers[prayer.id] || PrayerStatus.NOT_LOGGED;
            
            return (
              <div 
                key={prayer.id}
                className={`py-2 px-3 rounded-none border transition-all duration-300 ${
                  currentStatus === PrayerStatus.CONGREGATION 
                    ? 'bg-[#2D4F1E]/5 border-[#2D4F1E]/30' 
                    : currentStatus === PrayerStatus.ON_TIME
                    ? 'bg-[#2D4F1E]/3 border-[#2D4F1E]/10'
                    : currentStatus === PrayerStatus.LATE
                    ? 'bg-[#D4AF37]/5 border-[#D4AF37]/30'
                    : currentStatus === PrayerStatus.NONE
                    ? 'bg-rose-50/25 border-rose-200'
                    : currentStatus === PrayerStatus.DONT_REMEMBER
                    ? 'bg-amber-50/10 border-amber-200/60'
                    : 'bg-[#FDFBF7] border-[#E5E2D9] hover:bg-[#FDFBF7]/80'
                }`}
              >
                {/* Prayer Label Row */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-[#1A1A1A] font-serif flex items-center gap-1">
                        {prayer.arabicName}
                        <span className="text-[9px] sm:text-xs font-normal text-gray-500 font-sans">({prayer.rakaat} ركعات)</span>
                      </h3>
                    </div>
                  </div>
                  
                  {/* Selected Status Tag (Arabic) */}
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 border ${
                    currentStatus === PrayerStatus.CONGREGATION
                      ? 'bg-[#2D4F1E] text-white border-[#2D4F1E]'
                      : currentStatus === PrayerStatus.ON_TIME
                      ? 'bg-transparent text-[#2D4F1E] border-[#2D4F1E]'
                      : currentStatus === PrayerStatus.LATE
                      ? 'bg-transparent text-[#D4AF37] border-[#D4AF37]'
                      : currentStatus === PrayerStatus.NONE
                      ? 'bg-transparent text-rose-600 border-rose-600 font-serif'
                      : currentStatus === PrayerStatus.DONT_REMEMBER
                      ? 'bg-transparent text-amber-750 border-amber-300 font-serif'
                      : 'bg-[#FDFBF7] text-gray-400 border-[#E5E2D9]'
                  }`}>
                    {currentStatus === PrayerStatus.CONGREGATION && 'جماعة بالمسجد'}
                    {currentStatus === PrayerStatus.ON_TIME && 'في وقتها'}
                    {currentStatus === PrayerStatus.LATE && 'قضاء / متأخر'}
                    {currentStatus === PrayerStatus.NONE && 'غير مؤداة'}
                    {currentStatus === PrayerStatus.DONT_REMEMBER && '—'}
                    {currentStatus === PrayerStatus.NOT_LOGGED && 'غير مسجلة'}
                  </span>
                </div>

                {/* Custom Segmented Buttons for status logging using square styling */}
                <div className="grid grid-cols-5 gap-1">
                  <button
                    onClick={() => updatePrayerStatus(prayer.id, PrayerStatus.DONT_REMEMBER)}
                    id={`${prayer.id}-status-dontremember`}
                    className={`flex flex-col items-center justify-center py-1 px-1 rounded-none text-sm font-extrabold cursor-pointer border transition-all ${
                      currentStatus === PrayerStatus.DONT_REMEMBER
                        ? 'bg-amber-100/70 border-amber-350 text-amber-800'
                        : 'bg-white border-[#E5E2D9] hover:border-amber-300 text-amber-600 hover:bg-amber-50/20'
                    }`}
                  >
                    <span className="text-sm font-black">—</span>
                  </button>

                  <button
                    onClick={() => updatePrayerStatus(prayer.id, PrayerStatus.NONE)}
                    id={`${prayer.id}-status-none`}
                    className={`flex flex-col items-center justify-center py-1 px-1 rounded-none text-[10px] font-bold cursor-pointer border transition-all ${
                      currentStatus === PrayerStatus.NONE
                        ? 'bg-rose-600 border-rose-600 text-white'
                        : 'bg-white border-[#E5E2D9] hover:border-rose-450 text-rose-600 hover:bg-rose-50/50'
                    }`}
                  >
                    <X className={`w-4 h-4 ${currentStatus === PrayerStatus.NONE ? 'text-white' : 'text-rose-600'}`} />
                  </button>

                  <button
                    onClick={() => updatePrayerStatus(prayer.id, PrayerStatus.LATE)}
                    id={`${prayer.id}-status-late`}
                    className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-none text-[10px] font-bold cursor-pointer border transition-all ${
                      currentStatus === PrayerStatus.LATE
                        ? 'bg-[#D4AF37] border-[#D4AF37] text-white'
                        : 'bg-white border-[#E5E2D9] hover:border-[#D4AF37] text-gray-600 hover:text-[#D4AF37]'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5 mb-0.5" />
                    <span>متأخر</span>
                  </button>

                  <button
                    onClick={() => updatePrayerStatus(prayer.id, PrayerStatus.ON_TIME)}
                    id={`${prayer.id}-status-ontime`}
                    className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-none text-[10px] font-bold cursor-pointer border transition-all ${
                      currentStatus === PrayerStatus.ON_TIME
                        ? 'bg-[#2D4F1E] border-[#2D4F1E] text-white'
                        : 'bg-white border-[#E5E2D9] hover:border-[#2D4F1E] text-gray-600 hover:text-[#2D4F1E]'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mb-0.5" />
                    <span>في وقتها</span>
                  </button>

                  <button
                    onClick={() => updatePrayerStatus(prayer.id, PrayerStatus.CONGREGATION)}
                    id={`${prayer.id}-status-jamaah`}
                    className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-none text-[10px] font-bold cursor-pointer border transition-all ${
                      currentStatus === PrayerStatus.CONGREGATION
                        ? 'bg-[#2D4F1E] ring-2 ring-emerald-950/20 border-[#2D4F1E] text-white font-extrabold'
                        : 'bg-white border-[#E5E2D9] hover:border-[#2D4F1E] text-gray-600 hover:text-[#2D4F1E]'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5 mb-0.5" />
                    <span>جماعة</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
