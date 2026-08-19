/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type PrayerId = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export enum PrayerStatus {
  NOT_LOGGED = 'not_logged', // Starts nowhere
  DONT_REMEMBER = 'dont_remember', // لا أتذكر
  NONE = 'none',          // Missed (X)
  ON_TIME = 'on_time',    // Performed on time (في وقتها)
  LATE = 'late',          // Performed late / Qada (متأخر/قضاء)
  CONGREGATION = 'jamaah' // Performed in congregation (جماعة)
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  prayers: Record<PrayerId, PrayerStatus>;
  extraprayers: {
    duha: boolean;
    qiyam: boolean;
    adhkarMorning: boolean;
    adhkarEvening: boolean;
    fajrNafl?: boolean;
    dhuhrNafl?: boolean;
    maghribNafl?: boolean;
    shaf?: boolean;
    witr?: boolean;
  };
  quranPages: number;
  notes: string;
}

export interface PrayerDefinition {
  id: PrayerId;
  arabicName: string;
  englishName: string;
  rakaat: number;
  icon: string;
  color: string;
}

export interface StreakStats {
  currentStreak: number;
  longestStreak: number;
  currentLoggingStreak: number;
  longestLoggingStreak: number;
  totalPrays: number;
  totalOnTime: number;
  totalJamaah: number;
  totalLate: number;
}

export interface UserLocation {
  country: string;
  city: string;
  arabicCountry?: string;
  arabicCity?: string;
  method?: number;
  latitude?: number;
  longitude?: number;
}

export interface DayPrayerTimes {
  date: {
    readable: string;
    timestamp: string;
    gregorian: {
      date: string;
      day: string;
      weekday: { en: string; ar?: string };
      month: { number: number; en: string; ar?: string };
      year: string;
    };
    hijri: {
      date: string;
      day: string;
      weekday: { en: string; ar: string };
      month: { number: number; en: string; ar: string };
      year: string;
    };
  };
  timings: {
    Fajr: string;
    Sunrise: string;
    Dhuhr: string;
    Asr: string;
    Sunset: string;
    Maghrib: string;
    Isha: string;
    Imsak: string;
    Midnight: string;
    Firstthird?: string;
    Lastthird?: string;
  };
}

export interface PrayerReminderSetting {
  prayerId: PrayerId;
  arabicName: string;
  enabled: boolean;
  time: string; // "HH:MM" in 24-hour format
  advanceMinutes: number; // 0 = at exact time, or 5, 10, 15 minutes before
  customMessage?: string;
}

export interface NotificationLogItem {
  id: string;
  prayerId: PrayerId;
  prayerName: string;
  timestamp: string;
  timeFormatted: string;
  title: string;
  body: string;
}

export interface DailyRemindersConfig {
  masterEnabled: boolean;
  soundEnabled: boolean;
  reminders: Record<PrayerId, PrayerReminderSetting>;
  lastTriggered: Record<string, string>; // key: "YYYY-MM-DD_prayerId" -> value: "HH:MM"
  history: NotificationLogItem[];
}

