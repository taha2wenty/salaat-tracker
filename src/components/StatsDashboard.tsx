/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DailyLog, StreakStats, PrayerStatus, PrayerId } from '../types';
import { calculateStats, calculatePrayerRates, getLocalDateString } from '../utils';
import { Flame, Trophy, Percent, Sparkles, CheckSquare, BarChart, CalendarRange, Heart } from 'lucide-react';

interface StatsDashboardProps {
  logs: Record<string, DailyLog>;
  todayStr: string;
}

export default function StatsDashboard({ logs, todayStr }: StatsDashboardProps) {
  const [timeframe, setTimeframe] = useState<7 | 14 | 30>(7);
  
  const stats = calculateStats(logs, todayStr);
  const prayerRates = calculatePrayerRates(logs, timeframe, todayStr);

  // Total pages of Quran read in this log history
  const totalQuranPages = Object.values(logs).reduce((sum, log) => sum + (log.quranPages || 0), 0);
  
  // Extra habit completion rates
  const calculateExtraRate = (key: keyof DailyLog['extraprayers']) => {
    const totalLogs = Object.keys(logs).length || 1;
    const completed = Object.values(logs).filter(log => log.extraprayers?.[key]).length;
    return Math.round((completed / totalLogs) * 100);
  };

  const duhaRate = calculateExtraRate('duha');
  const qiyamRate = calculateExtraRate('qiyam');
  const morningAdhkarRate = calculateExtraRate('adhkarMorning');
  const eveningAdhkarRate = calculateExtraRate('adhkarEvening');
  
  // New Nawafil Rates
  const fajrNaflRate = calculateExtraRate('fajrNafl');
  const dhuhrNaflRate = calculateExtraRate('dhuhrNafl');
  const maghribNaflRate = calculateExtraRate('maghribNafl');
  const shafRate = calculateExtraRate('shaf');
  const witrRate = calculateExtraRate('witr');

  // Heatmap Grid: past 28 days (4 weeks)
  const renderHeatmapGrid = () => {
    const gridCells = [];
    const today = new Date(todayStr);

    // Generate past 28 days
    for (let i = 27; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = getLocalDateString(d);
      const log = logs[dateStr];
      
      let count = 0;
      let isFullyUnprayed = false;
      if (log) {
        count = Object.values(log.prayers).filter(s => 
          s === PrayerStatus.ON_TIME || 
          s === PrayerStatus.LATE || 
          s === PrayerStatus.CONGREGATION
        ).length;

        const hasPerformed = Object.values(log.prayers).some(s =>
          s === PrayerStatus.ON_TIME ||
          s === PrayerStatus.LATE ||
          s === PrayerStatus.CONGREGATION
        );
        const hasMissed = Object.values(log.prayers).some(s => s === PrayerStatus.NONE);
        isFullyUnprayed = !hasPerformed && hasMissed;
      }

      // Determine color intensity based on prayer count - Editorial Aesthetic
      let colorClass = 'bg-[#FDFBF7] text-gray-500 border-[#E5E2D9] hover:bg-gray-100';
      if (isFullyUnprayed) {
        colorClass = 'bg-rose-600 border-rose-600 text-white hover:bg-rose-700 font-bold';
      } else if (count === 1 || count === 2) {
        colorClass = 'bg-[#2D4F1E]/10 border-[#2D4F1E]/20 text-[#2D4F1E] hover:bg-[#2D4F1E]/20';
      } else if (count === 3 || count === 4) {
        colorClass = 'bg-[#2D4F1E]/40 border-[#2D4F1E]/50 text-[#FDFBF7] hover:bg-[#2D4F1E]/50';
      } else if (count === 5) {
        colorClass = 'bg-[#2D4F1E] border-[#2D4F1E] text-white hover:bg-[#2D4F1E]/90 font-bold';
      }

      gridCells.push({
        dateStr,
        count,
        colorClass,
        dayOfMonth: d.getDate(),
        dayOfWeek: d.getDay()
      });
    }

    return (
      <div className="grid grid-cols-7 gap-2">
        {gridCells.map((cell, idx) => (
          <div
            key={idx}
            className={`aspect-square rounded-none border flex flex-col items-center justify-center text-[10px] sm:text-xs font-semibold select-none cursor-help relative transition-all duration-300 ${cell.colorClass}`}
            title={`${cell.dateStr}: صُلّيت ${cell.count} من ٥`}
          >
            <span className="opacity-90">{cell.dayOfMonth}</span>
            {cell.count === 5 && (
              <span className="absolute bottom-1 text-[8px] text-white">★</span>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Streaks & High-Level Numbers */}
      <div className="grid grid-cols-2 gap-4">
        {/* Current Active Streak */}
        <div className="bg-[#2D4F1E] text-white p-5 rounded-none border border-[#2D4F1E] relative overflow-hidden flex flex-col justify-between">
          <div>
            <p className="text-xs text-emerald-100/90 font-medium font-sans flex items-center gap-1.5 justify-end">
              الالتزام المتواصل
              <Flame className="w-4 h-4 text-white fill-white" />
            </p>
          </div>
          <div className="mt-3 space-y-2 text-right">
            <div className="flex justify-between items-center border-b border-emerald-850/40 pb-1.5">
              <span className="text-[11px] text-emerald-200">صلاة ٥ مرات يومياً</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-extrabold font-mono text-white">
                  {stats.currentStreak}
                </span>
                <span className="text-[10px] text-emerald-200">يوم</span>
              </div>
            </div>
            <div className="flex justify-between items-center pt-0.5">
              <span className="text-[11px] text-emerald-200">تسجيل الصلوات</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-extrabold font-mono text-white">
                  {stats.currentLoggingStreak}
                </span>
                <span className="text-[10px] text-emerald-200">يوم</span>
              </div>
            </div>
          </div>
          <p className="text-[10px] text-emerald-200/85 mt-2 text-right">
            استمرّ للمحافظة على همّتك ونشاطك الروحاني
          </p>
        </div>

        {/* Longest Achieved Streak */}
        <div className="bg-white text-[#1A1A1A] p-5 rounded-none border border-[#E5E2D9] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="p-2 border border-[#E5E2D9] text-[#2D4F1E] rounded-none">
              <Trophy className="w-4 h-4" />
            </div>
            <p className="text-xs text-gray-400 font-bold font-sans">الرقم القياسي</p>
          </div>
          <div className="mt-3 space-y-2 text-right">
            <div className="flex justify-between items-center border-b border-gray-100 pb-1.5">
              <span className="text-[11px] text-gray-400 font-sans">صلاة ٥ مرات يومياً</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-[#2D4F1E] font-serif">
                  {stats.longestStreak}
                </span>
                <span className="text-[10px] text-gray-400">يوم</span>
              </div>
            </div>
            <div className="flex justify-between items-center pt-1">
              <span className="text-[11px] text-gray-400 font-sans">تسجيل الصلوات</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-[#2D4F1E] font-serif">
                  {stats.longestLoggingStreak}
                </span>
                <span className="text-[10px] text-gray-400">يوم</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Heatmap Contribution Section */}
      <div className="bg-white rounded-none border border-[#E5E2D9] p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <span className="text-[10px] text-gray-400 font-sans flex items-center gap-1">
            <span className="inline-block w-2.5 h-2.5 rounded-none bg-[#2D4F1E]" /> ٥ صلوات كاملة
            <span className="inline-block w-2.5 h-2.5 rounded-none bg-[#2D4F1E]/40 ml-1" /> ٣-٤ صلوات
            <span className="inline-block w-2.5 h-2.5 rounded-none bg-[#2D4F1E]/10 ml-1" /> ١-٢ صلوات
          </span>
          <h3 className="text-sm font-bold text-[#2D4F1E] flex items-center gap-1.5 font-serif self-end sm:self-auto">
            <CalendarRange className="w-4 h-4 text-[#2D4F1E]" />
            مخطط الالتزام (آخر ٢٨ يوماً)
          </h3>
        </div>
        
        {renderHeatmapGrid()}
        
        <p className="text-[10px] text-gray-400 text-center mt-3 font-sans leading-relaxed">
          انقر فوق أي مربع لتوضح لك السجلات، المربعات الداكنة ذات النجم الذهبي ★ تعني تكميل الصلاة الخمس بالكامل.
        </p>
      </div>

      {/* Prayer-by-Prayer Breakdown & Timeframe Selector */}
      <div className="bg-white rounded-none border border-[#E5E2D9] p-5 shadow-sm space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#E5E2D9] pb-4">
          {/* Timeframe Buttons */}
          <div className="flex gap-1 bg-gray-50 p-1 rounded-none self-start border border-[#E5E2D9]">
            <button
              onClick={() => setTimeframe(30)}
              id="timeframe-30-btn"
              className={`px-3 py-1 text-xs font-bold transition-all cursor-pointer rounded-none ${
                timeframe === 30
                  ? 'bg-[#2D4F1E] text-white'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              آخر ٣٠ يوم
            </button>
            <button
              onClick={() => setTimeframe(14)}
              id="timeframe-14-btn"
              className={`px-3 py-1 text-xs font-bold transition-all cursor-pointer rounded-none ${
                timeframe === 14
                  ? 'bg-[#2D4F1E] text-white'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              آخر ١٤ يوم
            </button>
            <button
              onClick={() => setTimeframe(7)}
              id="timeframe-7-btn"
              className={`px-3 py-1 text-xs font-bold transition-all cursor-pointer rounded-none ${
                timeframe === 7
                  ? 'bg-[#2D4F1E] text-white'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              آخر ٧ أيام
            </button>
          </div>
          
          <h3 className="text-sm font-bold text-[#2D4F1E] flex items-center justify-end gap-1.5 font-serif">
            <BarChart className="w-4 h-4 text-[#2D4F1E]" />
            تحليل نسب أداء الفروض
          </h3>
        </div>

        {/* Legend */}
        <div className="flex flex-row-reverse gap-4 justify-start items-center text-[10px] sm:text-xs">
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-none bg-teal-700 inline-block" />
            <span className="text-gray-500 font-sans">في جماعة</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-none bg-emerald-500 inline-block" />
            <span className="text-gray-500 font-sans">في وقتها فردياً</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-none bg-amber-500 inline-block" />
            <span className="text-gray-500 font-sans">متأخر / قضاء</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-none bg-[#E5E2D9] inline-block" />
            <span className="text-gray-500 font-sans">غير مؤداة</span>
          </div>
        </div>

        {/* Stacked Bars for each prayer */}
        <div className="space-y-4">
          {prayerRates.map((rate) => {
            const sumOfStates = rate.jamaahRate + rate.onTimeRate + rate.lateRate;
            const missedStateRate = Math.max(0, 100 - sumOfStates);

            return (
              <div key={rate.prayerId} className="space-y-1.5 text-right">
                <div className="flex flex-row-reverse justify-between items-center text-xs font-bold text-gray-800">
                  <span className="font-serif text-[#1A1A1A]">{rate.arabicName}</span>
                  <span className="text-[#2D4F1E] text-[11px] font-mono">
                    مجموع المؤدى: {sumOfStates}%
                  </span>
                </div>
                
                {/* Visual Stacked bar */}
                <div className="h-4 w-full bg-[#FDFBF7] rounded-none overflow-hidden flex flex-row-reverse shadow-none border border-[#E5E2D9]">
                  {/* Congregation (Teal) */}
                  {rate.jamaahRate > 0 && (
                    <div
                      style={{ width: `${rate.jamaahRate}%` }}
                      className="bg-teal-700 h-full flex items-center justify-center text-[9px] text-white font-bold font-mono"
                      title={`جماعة: ${rate.jamaahRate}%`}
                    >
                      {rate.jamaahRate >= 10 && `${rate.jamaahRate}%`}
                    </div>
                  )}

                  {/* On Time (Emerald) */}
                  {rate.onTimeRate > 0 && (
                    <div
                      style={{ width: `${rate.onTimeRate}%` }}
                      className="bg-emerald-500 h-full flex items-center justify-center text-[9px] text-white font-bold font-mono"
                      title={`في وقتها: ${rate.onTimeRate}%`}
                    >
                      {rate.onTimeRate >= 10 && `${rate.onTimeRate}%`}
                    </div>
                  )}

                  {/* Late (Amber) */}
                  {rate.lateRate > 0 && (
                    <div
                      style={{ width: `${rate.lateRate}%` }}
                      className="bg-[#D4AF37] h-full flex items-center justify-center text-[9px] text-white font-bold font-mono"
                      title={`متأخر: ${rate.lateRate}%`}
                    >
                      {rate.lateRate >= 10 && `${rate.lateRate}%`}
                    </div>
                  )}

                  {/* Missed (Gray) */}
                  {missedStateRate > 0 && (
                    <div
                      style={{ width: `${missedStateRate}%` }}
                      className="bg-gray-100 h-full flex items-center justify-center text-[9px] text-gray-400 font-bold font-mono"
                      title={`فائتة: ${missedStateRate}%`}
                    >
                      {missedStateRate >= 10 && `${missedStateRate}%`}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Supplemental Habit Statistics */}
      <div className="bg-white rounded-none border border-[#E5E2D9] p-5 shadow-sm">
        <h3 className="text-sm font-bold text-[#2D4F1E] flex items-center justify-end gap-1.5 mb-5 font-serif">
          <Sparkles className="w-4 h-4 text-[#D4AF37]" />
          إحصائيات السنن وقراءة القرآن النفلية
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Column 1: Quran totals and general focus habits (5 cols) */}
          <div className="md:col-span-4 space-y-4">
            <div className="p-4 bg-[#FDFBF7] rounded-none border border-[#E5E2D9] flex flex-col justify-between">
              <span className="text-xs text-gray-500 text-right font-sans font-bold">إجمالي ما قرأت من القرآن</span>
              <div className="mt-2 text-right">
                <span className="text-3xl font-bold text-[#2D4F1E] font-serif">{totalQuranPages}</span>
                <span className="text-xs text-[#2D4F1E] font-sans mr-1 font-bold"> ربع مقروء 📖</span>
              </div>
              <p className="text-[10px] text-[#2D4F1E] font-sans mt-2 text-right">
                جزى الله تلاوتك خيراً وضاعف ثوابك بالختم
              </p>
            </div>

            <div className="space-y-2.5 p-3.5 bg-gray-50/50 border border-[#E5E2D9]">
              <span className="text-[10px] font-bold text-[#2D4F1E] uppercase tracking-wide block font-serif">أذكار اليوم والنوافل العامة</span>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#D4AF37] font-mono">{duhaRate}%</span>
                  <span className="text-gray-600 font-sans">صلاة الضحى</span>
                </div>
                <div className="w-full bg-[#FDFBF7] h-1 border border-[#E5E2D9] overflow-hidden">
                  <div className="bg-[#D4AF37] h-full" style={{ width: `${duhaRate}%` }} />
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#2D4F1E] font-mono">{qiyamRate}%</span>
                  <span className="text-gray-600 font-sans">قيام الليل</span>
                </div>
                <div className="w-full bg-[#FDFBF7] h-1 border border-[#E5E2D9] overflow-hidden">
                  <div className="bg-[#2D4F1E] h-full" style={{ width: `${qiyamRate}%` }} />
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#2D4F1E] font-mono">{morningAdhkarRate}%</span>
                  <span className="text-gray-600 font-sans">أذكار الصباح</span>
                </div>
                <div className="w-full bg-[#FDFBF7] h-1 border border-[#E5E2D9] overflow-hidden">
                  <div className="bg-[#2D4F1E]/60 h-full" style={{ width: `${morningAdhkarRate}%` }} />
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-600 font-mono">{eveningAdhkarRate}%</span>
                  <span className="text-gray-600 font-sans">أذكار المساء</span>
                </div>
                <div className="w-full bg-[#FDFBF7] h-1 border border-[#E5E2D9] overflow-hidden">
                  <div className="bg-slate-500 h-full" style={{ width: `${eveningAdhkarRate}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: New Nawafil metrics (8 cols) */}
          <div className="md:col-span-8 flex flex-col justify-between p-4 bg-white border border-[#E5E2D9]">
            <span className="text-xs font-bold text-[#2D4F1E] border-b border-[#E5E2D9] pb-2 mb-3 block font-serif">
              نسب التزامك بالسنن الرواتب والشفع والوتر اليومية
            </span>

            <div className="space-y-4">
              {/* نافلة الفجر */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-[#2D4F1E] font-mono">{fajrNaflRate}%</span>
                  <span className="text-gray-700 font-semibold font-serif">نافلة الفجر (قبلية)</span>
                </div>
                <div className="w-full bg-gray-50 h-2 border border-[#E5E2D9] overflow-hidden">
                  <div className="bg-emerald-700 h-full transition-all duration-300" style={{ width: `${fajrNaflRate}%` }} />
                </div>
              </div>

              {/* نوافل الظهر */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-[#2D4F1E] font-mono">{dhuhrNaflRate}%</span>
                  <span className="text-gray-700 font-semibold font-serif">نوافل الظهر (قبلية وبعدية)</span>
                </div>
                <div className="w-full bg-gray-50 h-2 border border-[#E5E2D9] overflow-hidden">
                  <div className="bg-emerald-600 h-full transition-all duration-300" style={{ width: `${dhuhrNaflRate}%` }} />
                </div>
              </div>

              {/* نافلة المغرب */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-[#2D4F1E] font-mono">{maghribNaflRate}%</span>
                  <span className="text-gray-700 font-semibold font-serif">نافلة المغرب (بعدية)</span>
                </div>
                <div className="w-full bg-gray-50 h-2 border border-[#E5E2D9] overflow-hidden">
                  <div className="bg-teal-600 h-full transition-all duration-300" style={{ width: `${maghribNaflRate}%` }} />
                </div>
              </div>

              {/* الشفع */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-[#D4AF37] font-mono">{shafRate}%</span>
                  <span className="text-gray-700 font-semibold font-serif">الشفع (ركعتان)</span>
                </div>
                <div className="w-full bg-gray-50 h-2 border border-[#E5E2D9] overflow-hidden">
                  <div className="bg-[#D4AF37] h-full transition-all duration-300" style={{ width: `${shafRate}%` }} />
                </div>
              </div>

              {/* الوتر */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-[#D4AF37] font-mono">{witrRate}%</span>
                  <span className="text-gray-700 font-semibold font-serif">الوتر (ختام الصلاة)</span>
                </div>
                <div className="w-full bg-gray-50 h-2 border border-[#E5E2D9] overflow-hidden">
                  <div className="bg-[#D4AF37]/80 h-full transition-all duration-300" style={{ width: `${witrRate}%` }} />
                </div>
              </div>
            </div>

            <p className="text-[10px] text-gray-400 mt-4 leading-relaxed font-sans">
              يتم رصد هذه السنن باستمرار من خلال قسم النوافل وقسم صلاتي وتحديثها هنا في الزمن الحقيقي لتتبع تقدمك الروحاني.
            </p>
          </div>
        </div>
      </div>
      
    </div>
  );
}
