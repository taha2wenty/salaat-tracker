/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PrayerId, DailyRemindersConfig, NotificationLogItem, PrayerReminderSetting } from './types';

const REMINDERS_STORAGE_KEY = 'salaat_daily_reminders_v1';

export const PRAYER_TITLES: Record<PrayerId, string> = {
  fajr: 'صلاة الفجر',
  dhuhr: 'صلاة الظهر',
  asr: 'صلاة العصر',
  maghrib: 'صلاة المغرب',
  isha: 'صلاة العشاء'
};

export const DEFAULT_PRAYER_MESSAGES: Record<PrayerId, string> = {
  fajr: 'حان الآن موعد صلاة الفجر — الصلاة خير من النوم 🌅',
  dhuhr: 'حان الآن موعد صلاة الظهر — أرحنا بها يا بلال ☀️',
  asr: 'حان الآن موعد صلاة العصر — حافظوا على الصلوات والصلاة الوسطى 🌤️',
  maghrib: 'حان الآن موعد صلاة المغرب — تقبل الله منا ومنكم 🌇',
  isha: 'حان الآن موعد صلاة العشاء — نور وهداية وسكينة 🌙'
};

export const DEFAULT_REMINDERS_CONFIG: DailyRemindersConfig = {
  masterEnabled: true,
  soundEnabled: true,
  reminders: {
    fajr: {
      prayerId: 'fajr',
      arabicName: 'الفجر',
      enabled: true,
      time: '05:00',
      advanceMinutes: 0,
      customMessage: 'حان الآن موعد صلاة الفجر — الصلاة خير من النوم'
    },
    dhuhr: {
      prayerId: 'dhuhr',
      arabicName: 'الظهر',
      enabled: true,
      time: '12:45',
      advanceMinutes: 0,
      customMessage: 'حان الآن موعد صلاة الظهر — أرحنا بها يا بلال'
    },
    asr: {
      prayerId: 'asr',
      arabicName: 'العصر',
      enabled: true,
      time: '16:00',
      advanceMinutes: 0,
      customMessage: 'حافظوا على الصلوات والصلاة الوسطى'
    },
    maghrib: {
      prayerId: 'maghrib',
      arabicName: 'المغرب',
      enabled: true,
      time: '19:00',
      advanceMinutes: 0,
      customMessage: 'حان الآن موعد صلاة المغرب — تقبل الله طاعاتكم'
    },
    isha: {
      prayerId: 'isha',
      arabicName: 'العشاء',
      enabled: true,
      time: '20:30',
      advanceMinutes: 0,
      customMessage: 'حان الآن موعد صلاة العشاء والوتر'
    }
  },
  lastTriggered: {},
  history: []
};

// Check if Notification API is supported by the current browser
export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

// Get the current permission status
export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) {
    return 'denied';
  }
  return Notification.permission;
}

// Request Notification Permission from user
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) {
    return 'denied';
  }
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return Notification.permission;
  }
}

// Play gentle Islamic chime tone using Web Audio API (Synthesizer, offline-ready)
export function playNotificationSound(): void {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;
    
    // Serene melodic notes (A4, C#5, E5, A5) chord progression
    const notes = [
      { freq: 440.0, time: 0, dur: 0.8 },     // A4
      { freq: 554.37, time: 0.15, dur: 0.9 }, // C#5
      { freq: 659.25, time: 0.35, dur: 1.1 }, // E5
      { freq: 880.0, time: 0.55, dur: 1.6 }   // A5
    ];

    notes.forEach(note => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(note.freq, now + note.time);

      gain.gain.setValueAtTime(0.0001, now + note.time);
      gain.gain.exponentialRampToValueAtTime(0.2, now + note.time + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + note.time + note.dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + note.time);
      osc.stop(now + note.time + note.dur);
    });
  } catch (err) {
    console.warn('Audio playback error:', err);
  }
}

// Load reminder configurations from local storage
export function loadRemindersConfig(): DailyRemindersConfig {
  try {
    const saved = localStorage.getItem(REMINDERS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...DEFAULT_REMINDERS_CONFIG,
        ...parsed,
        reminders: {
          ...DEFAULT_REMINDERS_CONFIG.reminders,
          ...(parsed.reminders || {})
        },
        lastTriggered: parsed.lastTriggered || {},
        history: parsed.history || []
      };
    }
  } catch (e) {
    console.error('Error loading reminders config', e);
  }
  return DEFAULT_REMINDERS_CONFIG;
}

// Save reminder configurations to local storage
export function saveRemindersConfig(config: DailyRemindersConfig): void {
  try {
    localStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Error saving reminders config', e);
  }
}

// Send browser notification
export function sendPrayerNotification(
  prayerId: PrayerId,
  arabicName: string,
  message?: string,
  isTest: boolean = false
): Notification | null {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return null;
  }

  const title = isTest
    ? `🔔 إشعار تجريبي — سِجِلّ الصلاة (${arabicName})`
    : `🕋 حان موعد ${PRAYER_TITLES[prayerId] || arabicName}`;

  const body = message || DEFAULT_PRAYER_MESSAGES[prayerId] || `تذكير بأداء صلاة ${arabicName}`;

  try {
    const options: any = {
      body,
      icon: '/icon.png',
      tag: `salaat_prayer_${prayerId}_${Date.now()}`,
      renotify: true,
      requireInteraction: false,
      dir: 'rtl',
      lang: 'ar'
    };
    const notification = new Notification(title, options);

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    return notification;
  } catch (err) {
    console.error('Error sending Notification:', err);
    return null;
  }
}

// Format 24h time to 12h Arabic string
export function formatTime12H(time24: string): string {
  if (!time24 || !time24.includes(':')) return time24;
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr, 10);
  const m = mStr;
  const period = h >= 12 ? 'م' : 'ص';
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${m} ${period}`;
}

// Calculate target time with advanceMinutes subtraction
export function getAdjustedReminderTime(exactTime: string, advanceMinutes: number): string {
  if (!exactTime || advanceMinutes <= 0) return exactTime;
  const [hStr, mStr] = exactTime.split(':');
  let totalMinutes = parseInt(hStr, 10) * 60 + parseInt(mStr, 10) - advanceMinutes;
  if (totalMinutes < 0) totalMinutes += 24 * 60; // wrap around midnight if needed

  const h = Math.floor(totalMinutes / 60) % 24;
  const m = totalMinutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

// Check and trigger due reminders
export function checkAndTriggerDueReminders(
  config: DailyRemindersConfig,
  updateConfigCallback: (newConfig: DailyRemindersConfig) => void
): boolean {
  if (!config.masterEnabled) return false;
  if (!isNotificationSupported() || Notification.permission !== 'granted') return false;

  const now = new Date();
  const todayDateStr = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
  const currentHours = now.getHours().toString().padStart(2, '0');
  const currentMinutes = now.getMinutes().toString().padStart(2, '0');
  const currentTimeStr = `${currentHours}:${currentMinutes}`;

  const prayers: PrayerId[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
  let anyTriggered = false;
  const newLastTriggered = { ...config.lastTriggered };
  const newHistory = [...(config.history || [])];

  prayers.forEach((prayerId) => {
    const reminder = config.reminders[prayerId];
    if (!reminder || !reminder.enabled || !reminder.time) return;

    // Calculate effective trigger time (taking advanceMinutes into account)
    const triggerTime = getAdjustedReminderTime(reminder.time, reminder.advanceMinutes || 0);

    const triggerKey = `${todayDateStr}_${prayerId}`;

    // If matches current time and not already triggered today
    if (triggerTime === currentTimeStr && newLastTriggered[triggerKey] !== currentTimeStr) {
      // Trigger Notification
      let bodyText = reminder.customMessage || DEFAULT_PRAYER_MESSAGES[prayerId];
      if (reminder.advanceMinutes && reminder.advanceMinutes > 0) {
        bodyText = `تذكير: يتبقى ${reminder.advanceMinutes} دقائق على موعد ${reminder.arabicName} (${formatTime12H(reminder.time)})`;
      }

      sendPrayerNotification(prayerId, reminder.arabicName, bodyText, false);

      if (config.soundEnabled) {
        playNotificationSound();
      }

      newLastTriggered[triggerKey] = currentTimeStr;
      anyTriggered = true;

      // Add to log
      const logItem: NotificationLogItem = {
        id: `log-${Date.now()}-${prayerId}`,
        prayerId,
        prayerName: reminder.arabicName,
        timestamp: new Date().toISOString(),
        timeFormatted: `${currentTimeStr} (${formatTime12H(currentTimeStr)})`,
        title: `تنبيه ${PRAYER_TITLES[prayerId]}`,
        body: bodyText
      };

      newHistory.unshift(logItem);
    }
  });

  if (anyTriggered) {
    // Keep last 30 history items
    const updatedConfig: DailyRemindersConfig = {
      ...config,
      lastTriggered: newLastTriggered,
      history: newHistory.slice(0, 30)
    };
    saveRemindersConfig(updatedConfig);
    updateConfigCallback(updatedConfig);
    return true;
  }

  return false;
}
