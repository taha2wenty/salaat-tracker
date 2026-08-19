/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { PrayerId, DailyRemindersConfig, PrayerReminderSetting, DayPrayerTimes } from '../types';
import { 
  getNotificationPermission, 
  requestNotificationPermission, 
  sendPrayerNotification, 
  playNotificationSound,
  saveRemindersConfig,
  formatTime12H,
  DEFAULT_PRAYER_MESSAGES,
  PRAYER_TITLES
} from '../notificationService';
import { 
  Bell, 
  BellRing, 
  BellOff, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Sparkles, 
  Sunrise, 
  Sun, 
  Sunset, 
  Moon, 
  RotateCcw, 
  Send, 
  Sliders, 
  History, 
  CalendarSync,
  HelpCircle,
  Check,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Trash2
} from 'lucide-react';

interface PrayerRemindersCardProps {
  config: DailyRemindersConfig;
  onUpdateConfig: (newConfig: DailyRemindersConfig) => void;
}

interface PrayerUiMeta {
  id: PrayerId;
  arabicName: string;
  englishName: string;
  icon: any;
  color: string;
  badgeBg: string;
}

const PRAYERS_META: PrayerUiMeta[] = [
  { id: 'fajr', arabicName: 'الفجر', englishName: 'Fajr', icon: Sunrise, color: 'text-sky-600 dark:text-sky-400', badgeBg: 'bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800/60' },
  { id: 'dhuhr', arabicName: 'الظهر', englishName: 'Dhuhr', icon: Sun, color: 'text-amber-600 dark:text-amber-400', badgeBg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60' },
  { id: 'asr', arabicName: 'العصر', englishName: 'Asr', icon: Sun, color: 'text-orange-600 dark:text-orange-400', badgeBg: 'bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800/60' },
  { id: 'maghrib', arabicName: 'المغرب', englishName: 'Maghrib', icon: Sunset, color: 'text-rose-600 dark:text-rose-400', badgeBg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60' },
  { id: 'isha', arabicName: 'العشاء', englishName: 'Isha', icon: Moon, color: 'text-indigo-600 dark:text-indigo-400', badgeBg: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/60' },
];

export default function PrayerRemindersCard({ config, onUpdateConfig }: PrayerRemindersCardProps) {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [testSentMsg, setTestSentMsg] = useState<string | null>(null);
  const [expandedPrayer, setExpandedPrayer] = useState<PrayerId | null>(null);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  // Check current permission on mount and when window regains focus
  useEffect(() => {
    setPermission(getNotificationPermission());
    const handleFocus = () => {
      setPermission(getNotificationPermission());
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // Request notification permission handler
  const handleRequestPermission = async () => {
    const perm = await requestNotificationPermission();
    setPermission(perm);
    if (perm === 'granted') {
      setTestSentMsg('تم تفعيل إذن الإشعارات بنجاح!');
      sendPrayerNotification('fajr', 'سِجِلّ الصلاة', 'أهلاً بك! تم تفعيل إشعارات وتنبيهات مواقيت الصلاة بنجاح 🔔', true);
      if (config.soundEnabled) playNotificationSound();
      setTimeout(() => setTestSentMsg(null), 5000);
    }
  };

  // Send a test notification
  const handleSendTestNotification = (prayerId: PrayerId = 'fajr') => {
    if (permission !== 'granted') {
      handleRequestPermission();
      return;
    }

    const prayer = config.reminders[prayerId];
    sendPrayerNotification(
      prayerId,
      prayer.arabicName,
      prayer.customMessage || DEFAULT_PRAYER_MESSAGES[prayerId],
      true
    );

    if (config.soundEnabled) {
      playNotificationSound();
    }

    setTestSentMsg(`تم إرسال إشعار تجريبي لـ (${prayer.arabicName}) إلى جهازك`);
    setTimeout(() => setTestSentMsg(null), 4500);
  };

  // Master switch toggle
  const handleToggleMaster = () => {
    const updated = {
      ...config,
      masterEnabled: !config.masterEnabled
    };
    onUpdateConfig(updated);
    saveRemindersConfig(updated);
  };

  // Sound toggle
  const handleToggleSound = () => {
    const updated = {
      ...config,
      soundEnabled: !config.soundEnabled
    };
    onUpdateConfig(updated);
    saveRemindersConfig(updated);
    if (!config.soundEnabled) {
      playNotificationSound();
    }
  };

  // Update specific prayer reminder setting
  const handleUpdateReminder = (prayerId: PrayerId, updates: Partial<PrayerReminderSetting>) => {
    const updated: DailyRemindersConfig = {
      ...config,
      reminders: {
        ...config.reminders,
        [prayerId]: {
          ...config.reminders[prayerId],
          ...updates
        }
      }
    };
    onUpdateConfig(updated);
    saveRemindersConfig(updated);
  };

  // Sync reminder times from cached Prayer Times table if available
  const handleSyncWithPrayerTimes = () => {
    try {
      // Find prayer times cache in localStorage
      let foundTimings: Record<string, string> | null = null;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('salaat_timings_')) {
          const raw = localStorage.getItem(key);
          if (raw) {
            const data = JSON.parse(raw);
            if (Array.isArray(data) && data.length > 0) {
              const todayDay = new Date().getDate() - 1;
              const dayItem = data[Math.min(todayDay, data.length - 1)];
              if (dayItem && dayItem.timings) {
                foundTimings = dayItem.timings;
                break;
              }
            }
          }
        }
      }

      if (foundTimings) {
        const cleanTime = (t: string) => (t ? t.split(' ')[0].substring(0, 5) : '12:00');
        const updated: DailyRemindersConfig = {
          ...config,
          reminders: {
            fajr: { ...config.reminders.fajr, time: cleanTime(foundTimings.Fajr) },
            dhuhr: { ...config.reminders.dhuhr, time: cleanTime(foundTimings.Dhuhr) },
            asr: { ...config.reminders.asr, time: cleanTime(foundTimings.Asr) },
            maghrib: { ...config.reminders.maghrib, time: cleanTime(foundTimings.Maghrib) },
            isha: { ...config.reminders.isha, time: cleanTime(foundTimings.Isha) }
          }
        };
        onUpdateConfig(updated);
        saveRemindersConfig(updated);
        setSyncStatusMsg('تمت مزامنة جميع أوقات التذكيرات بنجاح مع جدول مواقيت اليوم!');
      } else {
        setSyncStatusMsg('لم يتم العثور على أوقات صلاة محفوظة. يمكنك الدخول لتبويب "أوقات الصلاة" لتحديد مدينتك أو ضبط الأوقات يدوياً.');
      }
      setTimeout(() => setSyncStatusMsg(null), 5000);
    } catch (e) {
      console.error(e);
      setSyncStatusMsg('حدث خطأ أثناء مزامنة الأوقات');
      setTimeout(() => setSyncStatusMsg(null), 4000);
    }
  };

  // Clear notification history
  const handleClearHistory = () => {
    const updated: DailyRemindersConfig = {
      ...config,
      history: []
    };
    onUpdateConfig(updated);
    saveRemindersConfig(updated);
  };

  // Reset to default reminder times
  const handleResetDefaults = () => {
    const updated: DailyRemindersConfig = {
      ...config,
      reminders: {
        fajr: { ...config.reminders.fajr, time: '05:00', enabled: true, advanceMinutes: 0 },
        dhuhr: { ...config.reminders.dhuhr, time: '12:45', enabled: true, advanceMinutes: 0 },
        asr: { ...config.reminders.asr, time: '16:00', enabled: true, advanceMinutes: 0 },
        maghrib: { ...config.reminders.maghrib, time: '19:00', enabled: true, advanceMinutes: 0 },
        isha: { ...config.reminders.isha, time: '20:30', enabled: true, advanceMinutes: 0 },
      }
    };
    onUpdateConfig(updated);
    saveRemindersConfig(updated);
    setSyncStatusMsg('تمت استعادة الأوقات الافتراضية لجميع التنبيهات.');
    setTimeout(() => setSyncStatusMsg(null), 4000);
  };

  return (
    <div className="space-y-5 animate-fade-in text-[#1A1A1A]">
      
      {/* 1. Header Card */}
      <div className="bg-white border border-[#E5E2D9] p-5 md:p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E2D9] pb-4">
          <div>
            <div className="flex items-center gap-2 text-[#2D4F1E]">
              <BellRing className="w-5 h-5" />
              <h2 className="text-base sm:text-lg font-bold font-serif">منبه وتذكيرات الصلوات الخمس اليومية</h2>
            </div>
            <p className="text-xs text-gray-500 font-sans mt-1 leading-relaxed">
              تنبيهات تلقائية عبر واجهة المتصفح (Notification API) تذكرك بأوقات الفجر، الظهر، العصر، المغرب، والعشاء في الموعد المحدد.
            </p>
          </div>

          {/* Master Switch */}
          <div className="flex items-center gap-3 bg-[#FDFBF7] p-2.5 border border-[#E5E2D9] self-start sm:self-center">
            <span className="text-xs font-bold font-serif text-[#2D4F1E]">
              {config.masterEnabled ? 'التنبيهات مفعلة' : 'التنبيهات معطلة'}
            </span>
            <button
              type="button"
              onClick={handleToggleMaster}
              id="master-notification-toggle"
              className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                config.masterEnabled ? 'bg-[#2D4F1E]' : 'bg-gray-300'
              }`}
              title="تشغيل أو إيقاف كافة التنبيهات"
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  config.masterEnabled ? '-translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* 2. Browser Permission Status Bar */}
        <div className="mt-4 space-y-3">
          {permission === 'granted' ? (
            <div className="p-3.5 bg-[#2D4F1E]/5 border border-[#2D4F1E]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-[#2D4F1E] shrink-0" />
                <div>
                  <div className="text-xs font-bold font-serif text-[#2D4F1E]">
                    إذن إشعارات المتصفح مفعّل وجاهز (Notification API)
                  </div>
                  <div className="text-[11px] text-gray-600 font-sans">
                    سيرسل التطبيق إشعاراً مرئياً وصوتياً عند حلول موعد أي صلاة مفعلة.
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => handleSendTestNotification('fajr')}
                  className="flex-1 sm:flex-initial px-3 py-1.5 bg-[#2D4F1E] hover:bg-[#233f17] text-white text-xs font-bold font-serif flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                  id="send-test-notification-btn"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>إرسال إشعار تجريبي</span>
                </button>

                <button
                  type="button"
                  onClick={playNotificationSound}
                  className="px-3 py-1.5 bg-white border border-[#2D4F1E] hover:bg-[#2D4F1E]/5 text-[#2D4F1E] text-xs font-bold font-serif flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  title="سماع نغمة التنبيه"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>تجربة الصوت</span>
                </button>
              </div>
            </div>
          ) : permission === 'denied' ? (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-3 text-xs font-serif">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">إشعارات المتصفح محظورة حالياً:</span>
                <span className="text-[11px] font-sans text-rose-700 block mt-0.5">
                  يرجى النقر على أيقونة القفل أو إعدادات الموقع بجانب شريط العنوان في متصفحك والسماح بالإشعارات (Notifications: Allow) لتتمكن من تلقي تذكيرات الصلاة.
                </span>
              </div>
            </div>
          ) : (
            <div className="p-3.5 bg-amber-50 border border-amber-200 text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Bell className="w-5 h-5 text-amber-700 shrink-0" />
                <div>
                  <div className="text-xs font-bold font-serif text-amber-900">
                    يرجى تفعيل إذن الإشعارات لاستقبال تنبيهات الصلاة
                  </div>
                  <div className="text-[11px] text-amber-700 font-sans">
                    يتطلب نظام المنبه موافقتك على إشعارات المتصفح ليعمل بدقة.
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRequestPermission}
                className="w-full sm:w-auto px-4 py-2 bg-[#2D4F1E] hover:bg-[#233f17] text-white text-xs font-bold font-serif flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                id="request-notification-permission-btn"
              >
                <BellRing className="w-4 h-4" />
                <span>تفعيل إذن الإشعارات الآن</span>
              </button>
            </div>
          )}

          {/* Feedback messages */}
          {testSentMsg && (
            <div className="p-2.5 bg-[#2D4F1E]/10 border border-[#2D4F1E]/30 text-[#2D4F1E] text-xs font-serif font-bold text-center animate-fade-in flex items-center justify-center gap-2">
              <Check className="w-4 h-4" />
              <span>{testSentMsg}</span>
            </div>
          )}

          {syncStatusMsg && (
            <div className="p-2.5 bg-blue-50 border border-blue-200 text-blue-900 text-xs font-serif font-bold text-center animate-fade-in flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>{syncStatusMsg}</span>
            </div>
          )}
        </div>

        {/* Global Toolbar Controls */}
        <div className="mt-4 pt-3 border-t border-[#E5E2D9] flex flex-wrap items-center justify-between gap-2 text-xs">
          
          {/* Sound Toggle */}
          <button
            type="button"
            onClick={handleToggleSound}
            className={`px-3 py-1.5 border transition-all cursor-pointer font-serif flex items-center gap-1.5 ${
              config.soundEnabled
                ? 'bg-[#2D4F1E]/5 border-[#2D4F1E]/40 text-[#2D4F1E] font-bold'
                : 'bg-gray-50 border-gray-200 text-gray-500'
            }`}
            title="تشغيل/كتم صوت التنبيه الهادئ"
          >
            {config.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span>{config.soundEnabled ? 'صوت التنبيه: مفعّل' : 'صوت التنبيه: مكتوم'}</span>
          </button>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSyncWithPrayerTimes}
              className="px-3 py-1.5 bg-[#FDFBF7] hover:bg-[#2D4F1E]/5 border border-[#E5E2D9] hover:border-[#2D4F1E] text-[#2D4F1E] font-bold font-serif flex items-center gap-1.5 transition-all cursor-pointer"
              title="تعبئة الأوقات تلقائياً من تقويم الصلاة المحسوب"
            >
              <CalendarSync className="w-3.5 h-3.5 text-[#2D4F1E]" />
              <span>مزامنة مع مواقيت اليوم</span>
            </button>

            <button
              type="button"
              onClick={handleResetDefaults}
              className="px-3 py-1.5 bg-[#FDFBF7] hover:bg-gray-100 border border-[#E5E2D9] text-gray-600 font-serif flex items-center gap-1 transition-all cursor-pointer"
              title="إعادة ضبط الأوقات الافتراضية"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>الافتراضي</span>
            </button>
          </div>

        </div>

      </div>

      {/* 3. The 5 Daily Prayers Reminders Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold font-serif text-[#2D4F1E] flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>ضبط أوقات التنبيه لكل صلاة:</span>
          </h3>
          <span className="text-[11px] text-gray-500 font-sans">
            يمكنك تحديد الوقت الدقيق واختيار التنبيه المسبق
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {PRAYERS_META.map((p) => {
            const reminder = config.reminders[p.id];
            const Icon = p.icon;
            const isExpanded = expandedPrayer === p.id;
            const time12 = formatTime12H(reminder.time);

            return (
              <div 
                key={p.id}
                className={`bg-white border transition-all duration-200 ${
                  reminder.enabled && config.masterEnabled 
                    ? 'border-[#E5E2D9] shadow-xs' 
                    : 'border-gray-200 opacity-75 bg-gray-50/50'
                }`}
              >
                {/* Main Prayer Row */}
                <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  
                  {/* Left: Prayer Name & Icon & Status */}
                  <div className="flex items-center gap-3">
                    {/* Toggle Button */}
                    <button
                      type="button"
                      onClick={() => handleUpdateReminder(p.id, { enabled: !reminder.enabled })}
                      className={`w-9 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors shrink-0 ${
                        reminder.enabled && config.masterEnabled ? 'bg-[#2D4F1E]' : 'bg-gray-300'
                      }`}
                      title={reminder.enabled ? `إيقاف منبه صلاة ${p.arabicName}` : `تفعيل منبه صلاة ${p.arabicName}`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                          reminder.enabled && config.masterEnabled ? '-translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>

                    {/* Icon */}
                    <div className={`w-9 h-9 rounded-none border flex items-center justify-center shrink-0 ${p.badgeBg}`}>
                      <Icon className={`w-5 h-5 ${p.color}`} />
                    </div>

                    {/* Title */}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold font-serif text-[#1A1A1A]">
                          صلاة {p.arabicName}
                        </span>
                        <span className="text-[10px] text-gray-400 font-sans uppercase">
                          ({p.englishName})
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-500 font-sans mt-0.5 flex items-center gap-1.5">
                        <span>وقت التنبيه: <strong className="text-[#2D4F1E] font-bold">{reminder.time} ({time12})</strong></span>
                        {reminder.advanceMinutes > 0 && (
                          <span className="text-amber-700 bg-amber-50 px-1.5 py-0.2 text-[10px] border border-amber-200">
                            (قبل الموعد بـ {reminder.advanceMinutes} د)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Time Input & Action buttons */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    
                    {/* Time Input */}
                    <div className="flex items-center gap-1 bg-[#FDFBF7] border border-[#E5E2D9] px-2 py-1 focus-within:border-[#2D4F1E]">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      <input
                        type="time"
                        value={reminder.time}
                        onChange={(e) => handleUpdateReminder(p.id, { time: e.target.value })}
                        disabled={!reminder.enabled || !config.masterEnabled}
                        className="bg-transparent text-xs font-bold text-[#1A1A1A] focus:outline-none cursor-pointer disabled:opacity-50"
                        title={`تعديل وقت منبه صلاة ${p.arabicName}`}
                      />
                    </div>

                    {/* Test Button for this prayer */}
                    <button
                      type="button"
                      onClick={() => handleSendTestNotification(p.id)}
                      disabled={!reminder.enabled || !config.masterEnabled}
                      className="px-2.5 py-1.5 bg-white border border-[#E5E2D9] hover:border-[#2D4F1E] hover:bg-[#2D4F1E]/5 text-[#2D4F1E] text-xs font-serif font-bold transition-all cursor-pointer disabled:opacity-40"
                      title={`تجربة إشعار صلاة ${p.arabicName}`}
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>

                    {/* Expand/Settings Accordion */}
                    <button
                      type="button"
                      onClick={() => setExpandedPrayer(isExpanded ? null : p.id)}
                      className={`p-1.5 border transition-all cursor-pointer ${
                        isExpanded ? 'bg-[#2D4F1E] text-white border-[#2D4F1E]' : 'bg-white border-[#E5E2D9] text-gray-600 hover:border-gray-400'
                      }`}
                      title="خيارات التنبيه المسبق والرسالة"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                  </div>

                </div>

                {/* Expanded Settings: Advance Minutes & Custom Message */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-2 border-t border-[#E5E2D9] bg-[#FDFBF7] space-y-3 animate-fade-in">
                    
                    {/* Advance Notification Selection */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold font-serif text-[#2D4F1E]">
                        توقيت إطلاق التنبيه:
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { val: 0, label: 'في الموعد بالضبط (0 دقيقة)' },
                          { val: 5, label: 'قبل الأذان بـ 5 دقائق' },
                          { val: 10, label: 'قبل الأذان بـ 10 دقائق' },
                          { val: 15, label: 'قبل الأذان بـ 15 دقيقة' },
                          { val: 20, label: 'قبل الأذان بـ 20 دقيقة' }
                        ].map((opt) => (
                          <button
                            key={opt.val}
                            type="button"
                            onClick={() => handleUpdateReminder(p.id, { advanceMinutes: opt.val })}
                            className={`px-2.5 py-1 text-xs font-serif transition-all cursor-pointer border ${
                              reminder.advanceMinutes === opt.val
                                ? 'bg-[#2D4F1E] text-white border-[#2D4F1E] font-bold'
                                : 'bg-white text-gray-700 border-[#E5E2D9] hover:border-gray-400'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Custom Message Field */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold font-serif text-[#2D4F1E]">
                        نص رسالة التذكير:
                      </label>
                      <input
                        type="text"
                        value={reminder.customMessage || ''}
                        onChange={(e) => handleUpdateReminder(p.id, { customMessage: e.target.value })}
                        placeholder={DEFAULT_PRAYER_MESSAGES[p.id]}
                        className="w-full p-2 text-xs bg-white border border-[#E5E2D9] focus:border-[#2D4F1E] focus:outline-none font-sans"
                      />
                      <div className="text-[10px] text-gray-500 font-sans flex justify-between">
                        <span>هذا النص سيظهر في بطاقة إشعار المتصفح ونظام التشغيل.</span>
                        <button
                          type="button"
                          onClick={() => handleUpdateReminder(p.id, { customMessage: DEFAULT_PRAYER_MESSAGES[p.id] })}
                          className="text-[#2D4F1E] hover:underline"
                        >
                          استعادة النص الافتراضي
                        </button>
                      </div>
                    </div>

                  </div>
                )}

              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Notification History / Log Drawer */}
      <div className="bg-white border border-[#E5E2D9] p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 text-xs font-bold font-serif text-[#2D4F1E] cursor-pointer hover:underline"
          >
            <History className="w-4 h-4" />
            <span>سجل التنبيهات الصادرة مؤخراً ({config.history?.length || 0})</span>
            {showHistory ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {config.history && config.history.length > 0 && showHistory && (
            <button
              type="button"
              onClick={handleClearHistory}
              className="text-[11px] text-rose-600 hover:text-rose-800 font-serif flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              <span>مسح السجل</span>
            </button>
          )}
        </div>

        {showHistory && (
          <div className="mt-3 pt-3 border-t border-[#E5E2D9] animate-fade-in space-y-2">
            {!config.history || config.history.length === 0 ? (
              <p className="text-xs text-gray-400 font-serif text-center py-3">
                لم يتم إطلاق أي تنبيهات حتى الآن. سيتم تسجيل التنبيهات الصادرة تلقائياً هنا.
              </p>
            ) : (
              <div className="divide-y divide-gray-100 max-h-48 overflow-y-auto">
                {config.history.map((item) => (
                  <div key={item.id} className="py-2 flex items-center justify-between text-xs font-sans">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#2D4F1E]" />
                      <span className="font-bold text-[#1A1A1A] font-serif">{item.title}</span>
                      <span className="text-gray-500 text-[11px]">— {item.body}</span>
                    </div>
                    <span className="text-[10px] text-gray-400 shrink-0 font-mono">
                      {item.timeFormatted}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 5. Browser Tips & Info */}
      <div className="p-4 bg-[#2D4F1E]/5 border border-[#2D4F1E]/20 text-xs font-sans space-y-2 leading-relaxed">
        <div className="flex items-center gap-1.5 text-[#2D4F1E] font-bold font-serif">
          <HelpCircle className="w-4 h-4" />
          <span>كيف يعمل نظام التنبيهات في المتصفح؟</span>
        </div>
        <ul className="list-disc list-inside space-y-1 text-gray-600 text-[11px]">
          <li>يتم فحص التوقيت تلقائياً كل دقيقة ومقارنته بالأوقات المحددة للصلوات الخمس.</li>
          <li>عند حلول الموعد المحدد، يظهر إشعار نظام التشغيل / المتصفح فوراً مع صوت تنبيه هادئ.</li>
          <li>احرص على إبقاء علامة تبويب التطبيق مفتوحة في الخلفية لضمان وصول الإشعارات في وقتها بدقة.</li>
        </ul>
      </div>

    </div>
  );
}
