/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { DailyLog } from '../types';
import { Sparkles, Check, Info } from 'lucide-react';
import { motion } from 'motion/react';

interface NawafilTrackerProps {
  currentDate: string;
  log: DailyLog;
  onUpdateLog: (updatedLog: DailyLog) => void;
}

interface NawafilDefinition {
  key: 'fajrNafl' | 'dhuhrNafl' | 'maghribNafl' | 'shaf' | 'witr';
  title: string;
  subtitle: string;
  rakaat: number;
}

const NAWAFIL_LIST: NawafilDefinition[] = [
  { key: 'fajrNafl', title: 'نافلة الفجر', subtitle: 'سنة الفجر ركعتان مؤكدة قبل الفريضة', rakaat: 2 },
  { key: 'dhuhrNafl', title: 'نوافل الظهر', subtitle: 'أربع ركعات قبليّة وركعتان بعديّة', rakaat: 6 },
  { key: 'maghribNafl', title: 'نافلة المغرب', subtitle: 'ركعتان مؤكدتان بعد فريضة المغرب', rakaat: 2 },
  { key: 'shaf', title: 'الشفع', subtitle: 'ركعتان قبل صلاة الوتر بعد نماز العشاء', rakaat: 2 },
  { key: 'witr', title: 'الوتر', subtitle: 'ركعة أو ثلاث ركعات ختاماً لصلاتك', rakaat: 1 }
];

export default function NawafilTracker({ currentDate, log, onUpdateLog }: NawafilTrackerProps) {
  
  const handleToggleNawafil = (key: 'fajrNafl' | 'dhuhrNafl' | 'maghribNafl' | 'shaf' | 'witr') => {
    // Keep backwards compatibility
    const updatedExtra = {
      ...log.extraprayers,
      [key]: !log.extraprayers[key]
    };

    const updatedLog: DailyLog = {
      ...log,
      extraprayers: updatedExtra
    };
    onUpdateLog(updatedLog);
  };

  const getCompletedCount = () => {
    return NAWAFIL_LIST.filter(item => log.extraprayers[item.key]).length;
  };

  const totalCompleted = getCompletedCount();

  return (
    <div className="bg-white rounded-none border border-[#E5E2D9] shadow-sm relative overflow-hidden text-[#1A1A1A]">
      <div className="absolute top-0 inset-x-0 h-1 bg-[#2D4F1E]" />

      {/* Title Header */}
      <div className="p-5 border-b border-[#E5E2D9] text-center">
        <span className="text-[10px] uppercase font-bold text-[#D4AF37] font-sans tracking-widest">المستحبات والسنن المؤكدة</span>
        <h2 className="text-lg sm:text-xl font-bold text-[#2D4F1E] mt-1 font-serif flex items-center justify-center gap-1.5">
          النوافل والرواتب والوتر
        </h2>
      </div>

      <div className="p-6 flex flex-col items-center">
        
        {/* Core Layout: Grid dividing the Prayer Mat from the Toggles */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-center">
          
          {/* Visual Prayer Mat Graphic Container (4 cols on lg) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 bg-gray-50/50 border border-[#E5E2D9] rounded-none">
            <span className="text-xs font-bold text-[#2D4F1E] font-serif mb-3">سجادة النوافل المباركة</span>
            
            {/* Beautiful customized SVG Prayer Mat */}
            <div className="relative w-44 sm:w-48 aspect-[1/1.8] bg-emerald-950 border-4 border-[#D4AF37] shadow-md flex flex-col justify-between overflow-hidden p-2 rounded-t-xl">
              {/* Top fringes */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent flex justify-center gap-0.5 pointer-events-none">
                {Array.from({ length: 15 }).map((_, idx) => (
                  <div key={idx} className="w-[1.5px] h-2 bg-[#D4AF37]/50" />
                ))}
              </div>

              {/* Mihrab (Niche) Design */}
              <div className="border border-[#D4AF37]/40 flex-1 my-3 flex flex-col items-center pt-4 relative">
                {/* Visual Mihrab arch */}
                <div className="absolute top-0 inset-x-2 h-16 border-t-2 border-x-2 border-[#D4AF37]/60 rounded-t-full" />
                <div className="z-10 mt-6 text-center space-y-1">
                  <span className="text-[10px] text-[#D4AF37] font-bold tracking-widest block font-sans">السنن والقيام</span>
                  <div className="text-3xl font-serif text-[#D4AF37] animate-pulse">✨</div>
                </div>

                {/* Center Pattern on mat */}
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-10 h-10 border-2 border-[#D4AF37]/30 rotate-45 flex items-center justify-center">
                  <div className="w-5 h-5 border border-[#D4AF37]/45 rotate-12 bg-emerald-900" />
                </div>
              </div>

              {/* Bottom fringes */}
              <div className="absolute bottom-0 left-0 right-0 h-1 flex justify-center gap-0.5 pointer-events-none">
                {Array.from({ length: 15 }).map((_, idx) => (
                  <div key={idx} className="w-[1.5px] h-2 bg-[#D4AF37]/50" />
                ))}
              </div>

              {/* Completed indicators overlaid on the mat */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center text-xs text-[#D4AF37] font-serif bg-emerald-950/90 py-1 px-3 border border-[#D4AF37]/20 rounded-md">
                تم: {totalCompleted} من ٥
              </div>
            </div>
            
            <p className="text-[10px] text-gray-400 mt-3 text-center leading-relaxed">
              تتلألأ سجادة نوافلك كلما زاد التزامك اليوم بالرواتب
            </p>
          </div>

          {/* Interactive Toggle Buttons Container (7 cols on lg) */}
          <div className="lg:col-span-7 space-y-3 w-full">
            {NAWAFIL_LIST.map((nafl) => {
              const isActive = !!log.extraprayers[nafl.key];
              
              return (
                <button
                  key={nafl.key}
                  onClick={() => handleToggleNawafil(nafl.key)}
                  className={`w-full p-3.5 text-right flex items-center justify-between transition-all rounded-none border group cursor-pointer ${
                    isActive
                      ? 'bg-[#2D4F1E]/5 border-[#2D4F1E] text-[#2D4F1E] font-bold shadow-xs'
                      : 'bg-white border-[#E5E2D9] hover:bg-gray-50 text-[#1A1A1A] hover:border-[#2D4F1E]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Visual custom checkbox */}
                    <div className={`w-5 h-5 flex items-center justify-center rounded-none border transition-all ${
                      isActive 
                        ? 'bg-[#2D4F1E] border-[#2D4F1E] text-white' 
                        : 'border-[#E5E2D9] group-hover:border-[#2D4F1E]'
                    }`}>
                      {isActive && <Check className="w-3.5 h-3.5" />}
                    </div>
                    
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold font-serif flex items-center gap-1.5">
                        {nafl.title}
                        <span className="text-[10px] text-[#D4AF37] font-sans font-normal border border-[#D4AF37]/30 px-1.5 py-0.5">
                          {nafl.rakaat} ركعات
                        </span>
                      </h4>
                      <p className="text-[10px] text-gray-400 font-medium font-sans mt-0.5">
                        {nafl.subtitle}
                      </p>
                    </div>
                  </div>

                  <span className={`text-[9px] font-sans px-2 py-0.5 rounded-none font-bold ${
                    isActive ? 'bg-[#2D4F1E] text-white' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {isActive ? 'مُؤدى' : 'سجل الأداء'}
                  </span>
                </button>
              );
            })}
          </div>

        </div>

        {/* Additional information on Nawafil benefits */}
        <div className="p-4 bg-[#FDFBF7] border border-[#E5E2D9] text-xs text-slate-600 text-right leading-relaxed font-sans w-full mt-6">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-[#2D4F1E] font-serif mb-1">السنن والرواتب اليومية:</p>
              <p>
                عن أم حبيبة رضي الله عنها زوج النبي صلى الله عليه وسلم أنها قالت: سمعت رسول الله صلى الله عليه وسلم يقول: «مَا مِنْ عَبْدٍ مُسْلِمٍ يُصَلِّي لِلَّهِ كُلَّ يَوْمٍ ثِنْتَيْ عَشْرَةَ رَكْعَةً تَطَوُّعًا غَيْرَ فَرِيضَةٍ، إِلَّا بَنَى اللَّهُ لَهُ بَيْتًا فِي الْجَنَّةِ». (رواه مسلم)
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
