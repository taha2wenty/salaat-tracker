/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { DailyLog } from '../types';
import { BookOpen, Sparkles, Trophy, RotateCcw, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface QuranTrackerProps {
  currentDate: string;
  log: DailyLog;
  onUpdateLog: (updatedLog: DailyLog) => void;
}

const FINISH_HADITHS = [
  {
    text: "يُقَالُ لِصَاحِبِ الْقُرْآنِ: اقْرَأْ وَارْتَقِ وَرَتِّلْ كَمَا كُنْتَ تُرَتِّلُ فِي الدُّنْيَا، فَإِنَّ مَنْزِلَتَكَ عِنْدَ آخِرِ آيَةٍ تَقْرَؤُهَا.",
    source: "صحيح الترمذي"
  },
  {
    text: "اقْرَؤُوا القُرْآنَ فإنَّه يَأْتي يَومَ القِيامَةِ شَفِيعًا لأَصْحابِهِ.",
    source: "صحيح مسلم"
  },
  {
    text: "مَنْ قَرَأَ حَرْفًا مِنْ كِتَابِ اللَّهِ فَلَهُ بِهِ حَسَنَةٌ، وَالحَسَنَةُ بِعَشْرِ أَمْثَالِهَا.",
    source: "سنن الترمذي"
  }
];

interface ConfettiParticle {
  id: string;
  color: string;
  emoji: string;
  size: number;
  duration: number;
  targetX: number;
  targetY: number;
  rotation: number;
}

export default function QuranTracker({ currentDate, log, onUpdateLog }: QuranTrackerProps) {
  // We parse current Rub' (page) index (0 to 239) from local storage to keep persistent progression
  const [currentIdx, setCurrentIdx] = useState<number>(() => {
    const saved = localStorage.getItem('salaat_tracker_quran_rub_v1');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [showCelebrate, setShowCelebrate] = useState(false);
  const [celebrateHadith, setCelebrateHadith] = useState(FINISH_HADITHS[0]);
  const [particles, setParticles] = useState<ConfettiParticle[]>([]);

  const triggerExplosion = () => {
    const newParticles: ConfettiParticle[] = [];
    const count = 55;
    const colors = ['#D4AF37', '#2D4F1E', '#EF4444', '#3B82F6', '#10B981', '#FFD700', '#FF69B4', '#A855F7'];
    const emojis = ['✨', '📖', '🎉', '🌟', '📚', '🕌', '🌸', '🕊️', '💎', '🤍'];
    const baseId = Math.random().toString(36).substring(2, 9);

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      // Explode outward with randomized distances for realistic thickness dispersion
      const distance = 40 + Math.random() * 190;
      const size = 12 + Math.random() * 18;
      const duration = 0.8 + Math.random() * 0.9; // 0.8s to 1.7s
      const targetX = Math.cos(angle) * distance;
      const targetY = Math.sin(angle) * distance;
      const rotation = Math.random() * 360 - 180;

      newParticles.push({
        id: `${baseId}-${i}`,
        color: colors[Math.floor(Math.random() * colors.length)],
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        size,
        duration,
        targetX,
        targetY,
        rotation,
      });
    }

    setParticles(prev => [...prev, ...newParticles]);

    // Clean up current explosion particles after they complete to prevent memory footprint
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !p.id.startsWith(baseId)));
    }, 2000);
  };

  useEffect(() => {
    if (showCelebrate) {
      // Explode instantly when the overlay acts
      triggerExplosion();

      // Explode periodically every 3 seconds (3000ms)
      const interval = setInterval(() => {
        triggerExplosion();
      }, 3000);

      return () => {
        clearInterval(interval);
      };
    } else {
      setParticles([]);
    }
  }, [showCelebrate]);

  useEffect(() => {
    localStorage.setItem('salaat_tracker_quran_rub_v1', currentIdx.toString());
  }, [currentIdx]);

  // Generate Rub (Quarter/Page) text
  const getPortionName = (idx: number) => {
    const hizb = Math.floor(idx / 4) + 1;
    const rub = (idx % 4) + 1;
    return `الحزب ${hizb}، الربع ${rub}`;
  };

  const handleNextPortion = () => {
    if (currentIdx === 239) {
      // Trigger completion celebration!
      const randHadith = FINISH_HADITHS[Math.floor(Math.random() * FINISH_HADITHS.length)];
      setCelebrateHadith(randHadith);
      setShowCelebrate(true);
      setCurrentIdx(0); // Reset the book
    } else {
      setCurrentIdx(prev => prev + 1);
      // Log progress on current date
      const updatedLog: DailyLog = {
        ...log,
        quranPages: (log.quranPages || 0) + 1
      };
      onUpdateLog(updatedLog);
    }
  };

  const handlePrevPortion = () => {
    if (currentIdx > 0) {
      setCurrentIdx(prev => prev - 1);
    }
  };

  const handleReset = () => {
    if (confirm('هل تود إعادة تعيين ختمة القرآن والبدء من الحزب الأول؟')) {
      setCurrentIdx(0);
    }
  };

  // Pre-generate helper metrics
  const totalRubs = 240;
  const currentPortion = getPortionName(currentIdx);
  const nextPortion = currentIdx < 239 ? getPortionName(currentIdx + 1) : "ختم المبارك بإذن الله";
  const progressPercent = Math.round((currentIdx / totalRubs) * 100);

  // Outward centered explosion confetti rendering
  const renderConfetti = () => {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-[45] flex items-center justify-center">
        <div className="relative w-0 h-0">
          {particles.map((p) => (
            <motion.div
              key={p.id}
              initial={{ x: 0, y: 0, scale: 0, opacity: 1, rotate: 0 }}
              animate={{ 
                x: p.targetX, 
                y: p.targetY, 
                scale: [0.2, 1.1, 1, 0.8, 0],
                opacity: [1, 1, 1, 0.7, 0],
                rotate: p.rotation
              }}
              transition={{
                duration: p.duration,
                ease: 'easeOut'
              }}
              style={{
                position: 'absolute',
                color: p.color,
                fontSize: `${p.size}px`,
                width: 'max-content',
                height: 'max-content',
                transform: 'translate(-50%, -50%)',
              }}
              className="select-none pointer-events-none font-serif leading-none"
            >
              {p.emoji}
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-none border border-[#E5E2D9] shadow-sm relative overflow-hidden text-[#1A1A1A]">
      {/* Celebration Overlay */}
      <AnimatePresence>
        {showCelebrate && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#2D4F1E]/95 z-50 p-6 flex flex-col items-center justify-center text-center text-white"
          >
            {renderConfetti()}
            <motion.div 
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8 }}
              className="max-w-md mx-auto space-y-6 z-10"
            >
              <div className="w-20 h-20 bg-white/10 mx-auto rounded-full flex items-center justify-center border-2 border-[#D4AF37] shadow-lg animate-pulse">
                <Trophy className="w-10 h-10 text-[#D4AF37]" />
              </div>
              
              <div className="space-y-2">
                <span className="text-[10px] uppercase tracking-widest font-bold text-[#D4AF37] block font-sans">
                  تهانينا القلبية ومبارك
                </span>
                <h3 className="text-xl sm:text-2xl font-black font-serif text-[#FDFBF7]">
                  الحمد لله الذي بنعمته تتم الصالحات
                </h3>
                <p className="text-xs sm:text-sm text-emerald-100 font-sans leading-relaxed">
                  لقد أتممت تلاوة وختام كتاب الله تعالى بالكامل (60 حزباً بقراءة الربع ربع). هنيئاً لك الأجر والثبات الروحاني العظيم.
                </p>
              </div>

              {/* Hadith Container */}
              <div className="p-4 bg-white/5 border border-white/10 italic text-xs leading-relaxed font-serif text-center relative mt-4">
                <p className="text-[#D4AF37] font-bold text-sm">
                  "{celebrateHadith.text}"
                </p>
                <span className="block text-[9px] text-emerald-300 mt-2 font-mono not-italic font-semibold">
                  — {celebrateHadith.source}
                </span>
              </div>

              {/* Celebration Controls */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mt-6 w-full">
                <button
                  type="button"
                  onClick={triggerExplosion}
                  className="w-full sm:flex-1 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs font-sans rounded-none transition-all active:scale-95 cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                  <span>انفجار احتفالي بهيج! 🎉</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowCelebrate(false)}
                  className="w-full sm:flex-1 px-5 py-2.5 bg-[#D4AF37] hover:bg-[#c4a132] text-white font-bold text-xs font-sans rounded-none transition-all active:scale-95 cursor-pointer shadow-md"
                >
                  البدء بختمة جديدة لزيادة الأجر والتلاوة
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute top-0 inset-x-0 h-1 bg-[#D4AF37]" />

      {/* Title */}
      <div className="p-5 border-b border-[#E5E2D9] text-center">
        <span className="text-[10px] uppercase font-bold text-[#D4AF37] font-sans tracking-widest">ورد التلاوة والتدبر</span>
        <h2 className="text-lg sm:text-xl font-bold text-[#2D4F1E] mt-1 font-serif flex items-center justify-center gap-1.5">
          القرآن الكريم
        </h2>
      </div>

      <div className="p-6 flex flex-col items-center justify-center space-y-6">
        
        {/* Book Design Graphic Section */}
        <div className="relative w-full max-w-lg aspect-[1.6/1] bg-[#FDFBF7] border border-[#E5E2D9] p-2 flex">
          
          {/* Cover spine ornament */}
          <div className="absolute left-1/2 top-4 bottom-4 w-[2px] bg-gradient-to-b from-[#D4AF37]/40 via-[#2D4F1E]/80 to-[#D4AF37]/40 transform -translate-x-1/2 z-10" />
          
          {/* Left Page (Previous / Active Portion) */}
          <div className="flex-1 border-r border-[#E5E2D9]/40 p-4 flex flex-col items-center justify-between relative bg-white shadow-xs">
            <span className="text-[9px] text-[#2D4F1E] font-bold font-sans">تلاوتك الفعّالة</span>
            <div className="flex flex-col items-center justify-center text-center my-auto space-y-2">
              <span className="text-[#D4AF37] text-xs font-serif">الصفحة النشطة</span>
              <p className="text-xs sm:text-sm font-bold text-gray-800 font-serif leading-tight">
                {currentPortion}
              </p>
              <div className="w-1.5 h-1.5 rounded-full bg-[#2D4F1E] mt-1" />
            </div>
            <span className="text-[10px] text-gray-400 font-mono font-bold">رقم {currentIdx + 1} / 240</span>
          </div>

          {/* Right Page (Next Up Portion) */}
          <div className="flex-1 p-4 flex flex-col items-center justify-between relative bg-white shadow-xs">
            <span className="text-[9px] text-[#2D4F1E] font-bold font-sans">الربع التالي</span>
            <div className="flex flex-col items-center justify-center text-center my-auto space-y-2">
              <span className="text-gray-400 text-xs font-serif">مقبل بالتلاوة</span>
              <p className="text-xs sm:text-sm font-medium text-gray-500 font-serif leading-tight">
                {nextPortion}
              </p>
              <div className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-1" />
            </div>
            <span className="text-[10px] text-gray-400 font-mono font-bold">المستهدف</span>
          </div>

          {/* Elegant traditional corner arabesque vectors inside the book corners */}
          <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-[#D4AF37]/30" />
          <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-[#D4AF37]/30" />
          <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-[#D4AF37]/30" />
          <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-[#D4AF37]/30" />
        </div>

        {/* Global Progress Indicators */}
        <div className="w-full max-w-lg space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-gray-600">
            <span className="font-serif text-[#2D4F1E]">{progressPercent}% من الختم الكريم</span>
            <span className="font-sans text-[#D4AF37]">{currentIdx} ربع مكتمل</span>
          </div>
          <div className="w-full bg-gray-100 h-2 border border-[#E5E2D9] overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#2D4F1E] to-[#D4AF37] transition-all duration-300" 
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Controls Layout */}
        <div className="w-full max-w-lg flex flex-col sm:flex-row gap-3">
          {/* Back portion */}
          <button
            onClick={handlePrevPortion}
            disabled={currentIdx === 0}
            className="flex-1 p-3 border border-[#E5E2D9] text-[#1A1A1A] hover:bg-gray-50 font-bold text-xs font-sans rounded-none transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:pointer-events-none"
          >
            <ChevronRight className="w-4 h-4" />
            <span>الربع السابق</span>
          </button>

          {/* Select Hizb Dropdown */}
          <div className="relative flex-1 min-w-[130px]">
            <select
              value={Math.floor(currentIdx / 4) + 1}
              onChange={(e) => {
                const hizbNum = parseInt(e.target.value, 10);
                if (!isNaN(hizbNum) && hizbNum >= 1 && hizbNum <= 60) {
                  setCurrentIdx((hizbNum - 1) * 4);
                }
              }}
              className="w-full h-full p-3 bg-white border border-[#E5E2D9] text-[#1A1A1A] hover:bg-[#FDFBF7] focus:border-[#2D4F1E] font-bold text-xs font-serif rounded-none transition-all cursor-pointer text-center appearance-none pr-8 pl-3"
              style={{ direction: 'rtl' }}
            >
              {Array.from({ length: 60 }).map((_, i) => (
                <option key={i + 1} value={i + 1} className="font-serif text-sm">
                  الحزب {i + 1}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#2D4F1E] font-bold text-[10px]">
              ▼
            </div>
          </div>

          {/* Core Green "Log Read Portion" Action */}
          <button
            onClick={handleNextPortion}
            className="flex-2 p-3 bg-[#2D4F1E] text-white hover:bg-emerald-900 border border-[#2D4F1E] font-bold text-xs font-sans rounded-none transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Check className="w-4 h-4 text-[#D4AF37]" />
            <span>سجل الربع كـمقروء {currentIdx === 239 && '👑'}</span>
          </button>

          {/* Reset progression */}
          <button
            onClick={handleReset}
            className="p-3 border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs font-sans rounded-none transition-all active:scale-95 flex items-center justify-center gap-1 cursor-pointer"
            title="إعادة ضبط الختمة للبداية"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Informative advice */}
        <div className="p-4 bg-[#FDFBF7] border border-[#E5E2D9] text-xs text-slate-600 text-right leading-relaxed font-sans w-full max-w-lg">
          <span className="inline-block bg-[#2D4F1E] text-white text-[9px] font-bold px-1.5 py-0.5 mb-1.5">أجر ورد التلاوة</span>
          <p className="font-bold text-[#2D4F1E] font-serif mb-1">طريقة المتابعة السهلة:</p>
          <p>
            كلما أتممت تلاوة রبع واحد من القرآن الكريم، اضغط على زر <strong className="text-[#2D4F1E]">"سجل الربع كـمقروء"</strong>، سيتم ترحيل قراءتك إلى ملفك التاريخي وإحصائياتك تلقائياً مع المحافظة على ربع التلاوة الحالي.
          </p>
        </div>

      </div>
    </div>
  );
}
