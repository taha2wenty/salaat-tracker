/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { DailyLog, PrayerStatus, DailyRemindersConfig } from './types';
import { HADITHS_AND_QUOTES } from './constants';
import { loadAllLogs, saveAllLogs, getLocalDateString } from './utils';
import { loadRemindersConfig, saveRemindersConfig, checkAndTriggerDueReminders } from './notificationService';
import DailyLogCard from './components/DailyLogCard';
import StatsDashboard from './components/StatsDashboard';
import SettingsCard from './components/SettingsCard';
import QuranTracker from './components/QuranTracker';
import NawafilTracker from './components/NawafilTracker';
import PrayerTimesTracker from './components/PrayerTimesTracker';
import PrayerRemindersCard from './components/PrayerRemindersCard';
import { BookOpen, Quote, Sparkles, RefreshCw, BarChart, Settings, ListTodo, Menu, X, ChevronRight, ChevronLeft, Heart, Trash2, Clock, Bell, Sun, Moon } from 'lucide-react';

type TabType = 'log' | 'stats' | 'settings' | 'quran' | 'nawafil' | 'prayerTimes' | 'reminders';

export default function App() {
  const [logs, setLogs] = useState<Record<string, DailyLog>>({});
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [quote, setQuote] = useState({ text: '', source: '' });
  const [showSeedNotice, setShowSeedNotice] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('log');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Left side/right side collapsible state
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [remindersConfig, setRemindersConfig] = useState<DailyRemindersConfig>(() => loadRemindersConfig());
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('salaat_tracker_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    // Check system preference
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  // Sync theme with html classList and localStorage
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('salaat_tracker_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // Initialize data on mount
  useEffect(() => {
    const todayStr = getLocalDateString(new Date());
    setSelectedDate(todayStr);

    // Load logs and check if newly seeded
    const loaded = loadAllLogs();
    setLogs(loaded);

    // If there were no logs at all and loading returned new mock records, show seed message
    if (!localStorage.getItem('salaat_tracker_logs_v1')) {
      setShowSeedNotice(true);
    }

    // Pick a random beautiful quote
    const randIndex = Math.floor(Math.random() * HADITHS_AND_QUOTES.length);
    setQuote(HADITHS_AND_QUOTES[randIndex]);
  }, []);

  // Background ticker for Browser Notification Reminders (checks every 15s)
  useEffect(() => {
    checkAndTriggerDueReminders(remindersConfig, setRemindersConfig);

    const interval = setInterval(() => {
      checkAndTriggerDueReminders(remindersConfig, setRemindersConfig);
    }, 15000);

    return () => clearInterval(interval);
  }, [remindersConfig]);

  // Sync to local storage on logs updates
  const handleUpdateLog = (updatedLog: DailyLog) => {
    const newLogs = {
      ...logs,
      [updatedLog.date]: updatedLog
    };
    setLogs(newLogs);
    saveAllLogs(newLogs);
  };

  // Get log for the active selectedDate, or initialize empty structure
  const getActiveLog = (): DailyLog => {
    const rawLog = logs[selectedDate];
    if (rawLog) {
      // Ensure empty sub-object fields are properly set even for older caches
      return {
        ...rawLog,
        extraprayers: {
          duha: false,
          qiyam: false,
          adhkarMorning: false,
          adhkarEvening: false,
          fajrNafl: false,
          dhuhrNafl: false,
          maghribNafl: false,
          shaf: false,
          witr: false,
          ...(rawLog.extraprayers || {})
        }
      };
    }
    // Return pristine empty record for this date
    return {
      date: selectedDate,
      prayers: {
        fajr: PrayerStatus.NOT_LOGGED,
        dhuhr: PrayerStatus.NOT_LOGGED,
        asr: PrayerStatus.NOT_LOGGED,
        maghrib: PrayerStatus.NOT_LOGGED,
        isha: PrayerStatus.NOT_LOGGED
      },
      extraprayers: {
        duha: false,
        qiyam: false,
        adhkarMorning: false,
        adhkarEvening: false,
        fajrNafl: false,
        dhuhrNafl: false,
        maghribNafl: false,
        shaf: false,
        witr: false
      },
      quranPages: 0,
      notes: ''
    };
  };

  // Navigate dates
  const handleNavigateDate = (days: number) => {
    const dateObj = new Date(selectedDate);
    dateObj.setDate(dateObj.getDate() + days);
    
    // Prevent navigating to the future beyond today's date
    const todayStr = getLocalDateString(new Date());
    const targetStr = getLocalDateString(dateObj);
    
    if (targetStr > todayStr && days > 0) {
      return; 
    }
    setSelectedDate(targetStr);
  };

  // Reset entire log tracking
  const handleClearAll = () => {
    const emptyLogs: Record<string, DailyLog> = {};
    const todayStr = getLocalDateString(new Date());
    
    // Create one fresh today log entry
    emptyLogs[todayStr] = {
      date: todayStr,
      prayers: {
        fajr: PrayerStatus.NOT_LOGGED,
        dhuhr: PrayerStatus.NOT_LOGGED,
        asr: PrayerStatus.NOT_LOGGED,
        maghrib: PrayerStatus.NOT_LOGGED,
        isha: PrayerStatus.NOT_LOGGED
      },
      extraprayers: {
        duha: false,
        qiyam: false,
        adhkarMorning: false,
        adhkarEvening: false,
        fajrNafl: false,
        dhuhrNafl: false,
        maghribNafl: false,
        shaf: false,
        witr: false
      },
      quranPages: 0,
      notes: ''
    };

    setLogs(emptyLogs);
    saveAllLogs(emptyLogs);
    setSelectedDate(todayStr);
    setShowSeedNotice(false);
  };

  // Restore imported file
  const handleImportLogs = (importedLogs: Record<string, DailyLog>) => {
    setLogs(importedLogs);
    saveAllLogs(importedLogs);
    
    // Focus on the newest date from imported log, or today if not found
    const keys = Object.keys(importedLogs).sort();
    if (keys.length > 0) {
      setSelectedDate(keys[keys.length - 1]);
    }
  };

  const handleRandomQuoteChange = () => {
    const currentIdx = HADITHS_AND_QUOTES.findIndex(q => q.text === quote.text);
    let nextIdx = Math.floor(Math.random() * HADITHS_AND_QUOTES.length);
    if (nextIdx === currentIdx) {
      nextIdx = (nextIdx + 1) % HADITHS_AND_QUOTES.length;
    }
    setQuote(HADITHS_AND_QUOTES[nextIdx]);
  };

  if (!selectedDate) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7] text-[#1A1A1A] font-sans">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-[#2D4F1E]" />
          <p className="font-semibold text-sm">جاري التجهيز والتحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark bg-[#0d120e] text-[#ece8df]' : 'bg-[#FDFBF7] text-[#1A1A1A]'} font-sans text-right relative overflow-x-hidden flex flex-col`} dir="rtl">
      
      {/* Top minimal control bar */}
      <nav className="border-b border-[#E5E2D9] px-4 md:px-8 py-3 bg-[#FDFBF7] flex justify-between items-center sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <span className="text-xl sm:text-2xl font-black text-[#2D4F1E] dark:text-[#4da638] font-serif">سِجِلّ الصلاة</span>
          <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 border border-[#2D4F1E]/30 text-[#2D4F1E] dark:text-[#4da638] font-bold">
            {theme === 'dark' ? 'الوضع الليلي 🌙' : 'الوضع النهاري ☀️'}
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Night Mode Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            id="theme-toggle-button"
            className="flex items-center gap-1.5 px-3 py-1.5 border border-[#E5E2D9] hover:border-[#2D4F1E] bg-white transition-all cursor-pointer font-bold text-xs shadow-xs active:scale-95"
            title={theme === 'dark' ? 'التبديل إلى الوضع النهاري (Light Mode)' : 'التبديل إلى الوضع الليلي (Night Mode)'}
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-[#dfbe5b]" />
                <span className="font-serif text-[#dfbe5b] hidden xs:inline">الوضع النهاري</span>
                <span className="xs:hidden">☀️</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-[#2D4F1E]" />
                <span className="font-serif text-[#2D4F1E] hidden xs:inline">الوضع الليلي</span>
                <span className="xs:hidden">🌙</span>
              </>
            )}
          </button>

          {/* Action button to slide the menu drawer */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="flex items-center gap-2 px-3 py-1.5 border border-[#2D4F1E] hover:bg-[#2D4F1E]/5 transition-all cursor-pointer font-bold text-xs bg-white text-[#1A1A1A]"
            id="toggle-sidebar-btn"
            title="افتح/أغلق القائمة الجانبية"
          >
            <Menu className="w-4 h-4 text-[#2D4F1E] dark:text-[#4da638]" />
            <span>{isSidebarOpen ? 'إغلاق القائمة' : 'عرض الخيارات والجدول'}</span>
          </button>
        </div>
      </nav>

      {/* Main Container */}
      <div className="flex-1 flex relative w-full overflow-hidden max-w-7xl mx-auto">
        
        {/* Main Content Area (Left when reading RTL, expands as sidebar collapses) */}
        <div className={`flex-1 p-4 md:p-8 transition-all duration-300 ${isSidebarOpen ? 'md:pl-4' : 'w-full'}`}>
          <div className="max-w-4xl mx-auto space-y-4">
            
            {/* 1. Hadith Box (Mandatory prominently at top) */}
            <div className="hadith-quote-box p-3 border border-[#2D4F1E] bg-white italic text-xs leading-relaxed font-serif text-center shadow-xs">
              <p className="text-center font-bold px-3 text-[#2D4F1E] text-xs sm:text-sm">
                "{quote.text}"
              </p>
              {quote.source && (
                <span className="block text-center text-[9px] text-gray-500 mt-1 font-sans not-italic font-semibold">
                  — {quote.source}
                </span>
              )}
            </div>

            {/* Render selected active panel */}
            <div className="min-h-[400px]">
              {activeTab === 'log' && (
                <div className="animate-fade-in">
                  <DailyLogCard
                    currentDate={selectedDate}
                    log={getActiveLog()}
                    onUpdateLog={handleUpdateLog}
                    onNavigateDate={handleNavigateDate}
                  />
                </div>
              )}

              {activeTab === 'stats' && (
                <div className="animate-fade-in">
                  <StatsDashboard
                    logs={logs}
                    todayStr={getLocalDateString(new Date())}
                  />
                </div>
              )}

              {activeTab === 'quran' && (
                <div className="animate-fade-in">
                  <QuranTracker
                    currentDate={selectedDate}
                    log={getActiveLog()}
                    onUpdateLog={handleUpdateLog}
                  />
                </div>
              )}

              {activeTab === 'nawafil' && (
                <div className="animate-fade-in">
                  <NawafilTracker
                    currentDate={selectedDate}
                    log={getActiveLog()}
                    onUpdateLog={handleUpdateLog}
                  />
                </div>
              )}

              {activeTab === 'prayerTimes' && (
                <div className="animate-fade-in">
                  <PrayerTimesTracker />
                </div>
              )}

              {activeTab === 'reminders' && (
                <div className="animate-fade-in">
                  <PrayerRemindersCard
                    config={remindersConfig}
                    onUpdateConfig={setRemindersConfig}
                  />
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="animate-fade-in">
                  <SettingsCard
                    onClearAll={handleClearAll}
                    onImportLogs={handleImportLogs}
                    logs={logs}
                  />
                </div>
              )}
            </div>

            {/* Simple alert notice */}
            {showSeedNotice && (
              <div className="bg-[#2D4F1E]/5 text-[#2D4F1E] text-xs font-bold p-3 border border-[#2D4F1E]/20 text-center flex items-center justify-between gap-2">
                <span>💡 تم تعبئة بعض البيانات التجريبية تلقائياً لتمكن من معاينة المخططات دون تعقيد.</span>
                <button onClick={() => setShowSeedNotice(false)} className="text-[#D4AF37] underline">إغلاق التنبيه</button>
              </div>
            )}

          </div>
        </div>

        {/* Collapsible Right Sidebar Menu (Positioned on the Right edge) */}
        <aside 
          className={`h-full border-[#E5E2D9] bg-white transition-all duration-300 flex flex-col z-30 shrink-0
            ${isSidebarOpen 
              ? 'w-full md:w-[300px] border-r md:border-r-0 md:border-l p-4' 
              : 'w-0 border-0 p-0 overflow-hidden'
            }
            md:relative absolute top-0 right-0 bottom-0 md:h-auto
          `}
        >
          {/* Close button for overlay sidebar on smaller touch layouts */}
          {isSidebarOpen && (
            <div className="flex md:hidden justify-between items-center border-b border-[#E5E2D9] pb-3 mb-3">
              <span className="font-bold font-serif text-[#2D4F1E]">القائمة الرئيسية</span>
              <button onClick={() => setIsSidebarOpen(false)} className="p-1 border border-gray-200">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {isSidebarOpen && (
            <div className="space-y-4 flex-1 flex flex-col justify-between">
              
              <div className="space-y-4">
                <nav className="flex flex-col gap-2">
                  {/* Option 1 */}
                  <button
                    onClick={() => { setActiveTab('log'); if(window.innerWidth < 768) setIsSidebarOpen(false); }}
                    className={`w-full p-4.5 text-right flex items-center justify-between transition-all cursor-pointer rounded-none border ${
                      activeTab === 'log'
                        ? 'bg-[#2D4F1E] text-white border-[#2D4F1E] font-bold shadow-xs'
                        : 'bg-[#FDFBF7] text-[#1A1A1A] hover:bg-gray-50 border-[#E5E2D9] hover:border-[#2D4F1E]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <ListTodo className="w-5 h-5" />
                      <span className="text-base font-bold font-serif">صلاتي</span>
                    </div>
                    <span className="text-xs opacity-60">صلواتي ✍️</span>
                  </button>

                  {/* Option 2 */}
                  <button
                    onClick={() => { setActiveTab('stats'); if(window.innerWidth < 768) setIsSidebarOpen(false); }}
                    className={`w-full p-4.5 text-right flex items-center justify-between transition-all cursor-pointer rounded-none border ${
                      activeTab === 'stats'
                        ? 'bg-[#2D4F1E] text-white border-[#2D4F1E] font-bold shadow-xs'
                        : 'bg-[#FDFBF7] text-[#1A1A1A] hover:bg-gray-50 border-[#E5E2D9] hover:border-[#2D4F1E]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <BarChart className="w-5 h-5" />
                      <span className="text-base font-bold font-serif">إحصائيات</span>
                    </div>
                    <span className="text-xs opacity-60">النتائج 📊</span>
                  </button>

                  {/* Option 3: Quran */}
                  <button
                    onClick={() => { setActiveTab('quran'); if(window.innerWidth < 768) setIsSidebarOpen(false); }}
                    className={`w-full p-4.5 text-right flex items-center justify-between transition-all cursor-pointer rounded-none border ${
                      activeTab === 'quran'
                        ? 'bg-[#2D4F1E] text-white border-[#2D4F1E] font-bold shadow-xs'
                        : 'bg-[#FDFBF7] text-[#1A1A1A] hover:bg-gray-50 border-[#E5E2D9] hover:border-[#2D4F1E]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <BookOpen className="w-5 h-5" />
                      <span className="text-base font-bold font-serif">القرآن الكريم</span>
                    </div>
                    <span className="text-xs opacity-60">تلاوة 📖</span>
                  </button>

                  {/* Option 4: Nawafil */}
                  <button
                    onClick={() => { setActiveTab('nawafil'); if(window.innerWidth < 768) setIsSidebarOpen(false); }}
                    className={`w-full p-4.5 text-right flex items-center justify-between transition-all cursor-pointer rounded-none border ${
                      activeTab === 'nawafil'
                        ? 'bg-[#2D4F1E] text-white border-[#2D4F1E] font-bold shadow-xs'
                        : 'bg-[#FDFBF7] text-[#1A1A1A] hover:bg-gray-50 border-[#E5E2D9] hover:border-[#2D4F1E]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-5 h-5" />
                      <span className="text-base font-bold font-serif">النوافل</span>
                    </div>
                    <span className="text-xs opacity-60">السنن ✨</span>
                  </button>

                  {/* Option 5: Prayer Times */}
                  <button
                    onClick={() => { setActiveTab('prayerTimes'); if(window.innerWidth < 768) setIsSidebarOpen(false); }}
                    className={`w-full p-4.5 text-right flex items-center justify-between transition-all cursor-pointer rounded-none border ${
                      activeTab === 'prayerTimes'
                        ? 'bg-[#2D4F1E] text-white border-[#2D4F1E] font-bold shadow-xs'
                        : 'bg-[#FDFBF7] text-[#1A1A1A] hover:bg-gray-50 border-[#E5E2D9] hover:border-[#2D4F1E]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5" />
                      <span className="text-base font-bold font-serif">أوقات الصلاة</span>
                    </div>
                    <span className="text-xs opacity-60">المواقيت ⏳</span>
                  </button>

                  {/* Option 6: Reminders / Notifications */}
                  <button
                    onClick={() => { setActiveTab('reminders'); if(window.innerWidth < 768) setIsSidebarOpen(false); }}
                    className={`w-full p-4.5 text-right flex items-center justify-between transition-all cursor-pointer rounded-none border ${
                      activeTab === 'reminders'
                        ? 'bg-[#2D4F1E] text-white border-[#2D4F1E] font-bold shadow-xs'
                        : 'bg-[#FDFBF7] text-[#1A1A1A] hover:bg-gray-50 border-[#E5E2D9] hover:border-[#2D4F1E]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5" />
                      <span className="text-base font-bold font-serif">المنبه والتذكيرات</span>
                    </div>
                    <span className="text-xs opacity-60">الإشعارات 🔔</span>
                  </button>
                </nav>



              </div>

              {/* Version & Private Notice to keep sidebar balanced */}
              <div className="pt-2 border-t border-[#E5E2D9] text-center text-[10px] uppercase opacity-40">
                <span>سِجِلّ الصلاة ٢.٠ — آمن ومحلي</span>
              </div>

            </div>
          )}
        </aside>

      </div>

      {/* Floating Reset Button in Bottom Left */}
      <div className="fixed bottom-4 left-4 z-40">
        <button
          onClick={() => setShowResetConfirm(true)}
          className="px-2.5 py-1.5 bg-[#FDFBF7] hover:bg-rose-50 text-rose-700 hover:text-rose-800 border border-rose-200 hover:border-rose-400 shadow-sm transition-all text-[11px] font-bold font-serif flex items-center gap-1.5 cursor-pointer"
          title="إعادة تعيين كافة البيانات"
        >
          <Trash2 className="w-3.5 h-3.5 text-rose-600" />
          <span>إعادة تعيين البيانات</span>
        </button>
      </div>

      {/* Modern, elegant Arabic Reset Confirmation Dialog */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4" dir="rtl">
          <div className="bg-white border border-[#E5E2D9] max-w-sm w-full p-6 text-right space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-rose-700 font-serif flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              <span>هل تود فعلاً إعادة تعيين كافة تقدمك وبياناتك؟</span>
            </h3>
            
            <p className="text-xs text-slate-500 font-sans leading-relaxed">
              هذا الإجراء سيقوم بحذف كافة سجلات أداء الصلوات، تتبع ورد تلاوة القرآن الكريم، ونسب السنن والنوافل بشكل نهائي ولا يمكن التراجع عنه.
            </p>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  // Absolute reset
                  localStorage.clear();
                  setLogs({});
                  
                  // Reset components
                  localStorage.removeItem('salaat_tracker_quran_rub_v1');
                  
                  const todayStr = getLocalDateString(new Date());
                  setSelectedDate(todayStr);
                  setActiveTab('log');
                  setShowSeedNotice(false);
                  setShowResetConfirm(false);
                }}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-none transition-all cursor-pointer text-center font-sans"
              >
                نعم، وموافق
              </button>
              
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2 border border-[#E5E2D9] hover:bg-gray-50 text-slate-700 font-bold text-xs rounded-none transition-all cursor-pointer text-center font-sans"
              >
                إلغاء الحذف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tiny clean footer */}
      <footer className="border-t border-[#E5E2D9] py-4 px-8 text-center text-[11px] uppercase tracking-wider opacity-40">
        <span>سِجِلّ الصلاة — مُنَسّق تَماماً لسهولة وسرعة التصفّح والاستخدام</span>
      </footer>

    </div>
  );
}
