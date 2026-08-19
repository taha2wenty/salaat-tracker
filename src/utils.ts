/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DailyLog, PrayerStatus, StreakStats, PrayerId } from './types';
import { ARABIC_DAYS, ARABIC_MONTHS } from './constants';

const LOCAL_STORAGE_KEY = 'salaat_tracker_logs_v1';

// Format Gregorian date in Arabic
export function getFormattedGregorianDate(dateStr: string): string {
  const d = new Date(dateStr);
  const dayName = ARABIC_DAYS[d.getDay()];
  const dayNum = d.getDate();
  const monthName = ARABIC_MONTHS[d.getMonth()];
  const year = d.getFullYear();
  return `${dayName}، ${dayNum} ${monthName} ${year}`;
}

// Format Hijri date natively in Arabic
export function getHijriDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(d) + ' هـ';
  } catch (e) {
    return '';
  }
}

// Convert Date to YYYY-MM-DD
export function getLocalDateString(date: Date = new Date()): string {
  const offset = date.getTimezoneOffset();
  const adjusted = new Date(date.getTime() - offset * 60 * 1000);
  return adjusted.toISOString().split('T')[0];
}

// Generate realistic mock data for 21 days prior
function generateMockData(): Record<string, DailyLog> {
  const mock: Record<string, DailyLog> = {};
  const today = new Date();
  
  for (let i = 21; i >= 1; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = getLocalDateString(d);
    
    // Add realistic prayer tracking records
    // Higher random chance of on-time or congregation for Maghrib/Isha/Fajr
    const getStatusForMock = (prayer: string): PrayerStatus => {
      const rand = Math.random();
      if (prayer === 'fajr') {
        if (rand < 0.15) return PrayerStatus.NONE;
        if (rand < 0.45) return PrayerStatus.LATE;
        return PrayerStatus.ON_TIME;
      }
      if (prayer === 'dhuhr' || prayer === 'asr') {
        if (rand < 0.10) return PrayerStatus.NONE;
        if (rand < 0.40) return PrayerStatus.CONGREGATION;
        if (rand < 0.70) return PrayerStatus.ON_TIME;
        return PrayerStatus.LATE;
      }
      // Maghrib & Isha
      if (rand < 0.05) return PrayerStatus.NONE;
      if (rand < 0.55) return PrayerStatus.CONGREGATION;
      if (rand < 0.85) return PrayerStatus.ON_TIME;
      return PrayerStatus.LATE;
    };

    mock[dateStr] = {
      date: dateStr,
      prayers: {
        fajr: getStatusForMock('fajr'),
        dhuhr: getStatusForMock('dhuhr'),
        asr: getStatusForMock('asr'),
        maghrib: getStatusForMock('maghrib'),
        isha: getStatusForMock('isha')
      },
      extraprayers: {
        duha: Math.random() > 0.4,
        qiyam: Math.random() > 0.6,
        adhkarMorning: Math.random() > 0.3,
        adhkarEvening: Math.random() > 0.3
      },
      quranPages: Math.floor(Math.random() * 5),
      notes: Math.random() > 0.85 ? 'الحمد لله على توفيق الصلاة اليوم في الجماعة' : ''
    };
  }
  return mock;
}

// Load logs from local storage or seed initial dummy data
export function loadAllLogs(): Record<string, DailyLog> {
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("Error parsing stored prayer logs", e);
    }
  }
  
  // Seed with simulated data if completely empty
  const mockData = generateMockData();
  saveAllLogs(mockData);
  return mockData;
}

// Save logs to local storage
export function saveAllLogs(logs: Record<string, DailyLog>): void {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(logs));
}

// Check if a day has all 5 prayers completed
export function isDayCompleted(log: DailyLog | undefined): boolean {
  if (!log) return false;
  return Object.values(log.prayers).every(status => 
    status !== PrayerStatus.NONE && 
    status !== PrayerStatus.DONT_REMEMBER && 
    status !== PrayerStatus.NOT_LOGGED
  );
}

// Check if a day has at least been logged (no prayer is in the NOT_LOGGED state)
export function isDayLogged(log: DailyLog | undefined): boolean {
  if (!log) return false;
  return Object.values(log.prayers).every(status => status !== PrayerStatus.NOT_LOGGED);
}

// Calculate streaks, totals, and percentages
export function calculateStats(logs: Record<string, DailyLog>, todayStr: string): StreakStats {
  const sortedDates = Object.keys(logs).sort();
  let maxStreak = 0;
  let currentStreak = 0;
  let runningStreak = 0;

  let maxLoggingStreak = 0;
  let currentLoggingStreak = 0;
  let runningLoggingStreak = 0;

  // Calculate streaks across all logs
  // Convert logs into consecutive checked days
  // We handle gap with today
  const completedSet = new Set<string>();
  const loggedSet = new Set<string>();
  let totalPrays = 0;
  let totalOnTime = 0;
  let totalJamaah = 0;
  let totalLate = 0;

  sortedDates.forEach(dateStr => {
    const log = logs[dateStr];
    
    // Add to completed set if all prayers are checked
    if (isDayCompleted(log)) {
      completedSet.add(dateStr);
    }

    // Add to logged set if all prayers are logged (not UNSET)
    if (isDayLogged(log)) {
      loggedSet.add(dateStr);
    }

    // Count categories of checked prayers
    Object.values(log.prayers).forEach(status => {
      if (status !== PrayerStatus.NONE && status !== PrayerStatus.DONT_REMEMBER && status !== PrayerStatus.NOT_LOGGED) {
        totalPrays++;
        if (status === PrayerStatus.ON_TIME) totalOnTime++;
        if (status === PrayerStatus.CONGREGATION) totalJamaah++;
        if (status === PrayerStatus.LATE) totalLate++;
      }
    });
  });

  // Iterate over date ranges to calculate praying streaks
  if (sortedDates.length > 0) {
    const firstDate = new Date(sortedDates[0]);
    const lastDate = new Date(todayStr); // check up to today
    
    let tempDate = new Date(firstDate);
    while (tempDate <= lastDate) {
      const dateKey = getLocalDateString(tempDate);
      if (completedSet.has(dateKey)) {
        runningStreak++;
        if (runningStreak > maxStreak) {
          maxStreak = runningStreak;
        }
      } else {
        // If it is today, we don't break the current running streak until the end of today
        // But if it's a past day, running streak resets to 0
        if (dateKey !== todayStr) {
          runningStreak = 0;
        }
      }
      tempDate.setDate(tempDate.getDate() + 1);
    }
  }

  // Iterate over date ranges to calculate logging streaks
  if (sortedDates.length > 0) {
    const firstDate = new Date(sortedDates[0]);
    const lastDate = new Date(todayStr); // check up to today
    
    let tempDate = new Date(firstDate);
    while (tempDate <= lastDate) {
      const dateKey = getLocalDateString(tempDate);
      if (loggedSet.has(dateKey)) {
        runningLoggingStreak++;
        if (runningLoggingStreak > maxLoggingStreak) {
          maxLoggingStreak = runningLoggingStreak;
        }
      } else {
        if (dateKey !== todayStr) {
          runningLoggingStreak = 0;
        }
      }
      tempDate.setDate(tempDate.getDate() + 1);
    }
  }

  // Calculate CURRENT Completed praying streak specifically
  let checkDate = new Date(todayStr);
  let todayCompleted = completedSet.has(todayStr);
  
  if (todayCompleted) {
    currentStreak = 0;
    while (completedSet.has(getLocalDateString(checkDate))) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
  } else {
    // If today is not completed, current streak could still be active from yesterday
    const yesterday = new Date(todayStr);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = getLocalDateString(yesterday);
    
    if (completedSet.has(yesterdayStr)) {
      currentStreak = 0;
      let checkYesterday = new Date(yesterday);
      while (completedSet.has(getLocalDateString(checkYesterday))) {
        currentStreak++;
        checkYesterday.setDate(checkYesterday.getDate() - 1);
      }
    } else {
      currentStreak = 0;
    }
  }

  // Calculate CURRENT logging streak specifically
  let checkLoggingDate = new Date(todayStr);
  let todayLogged = loggedSet.has(todayStr);
  
  if (todayLogged) {
    currentLoggingStreak = 0;
    while (loggedSet.has(getLocalDateString(checkLoggingDate))) {
      currentLoggingStreak++;
      checkLoggingDate.setDate(checkLoggingDate.getDate() - 1);
    }
  } else {
    const yesterday = new Date(todayStr);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = getLocalDateString(yesterday);
    
    if (loggedSet.has(yesterdayStr)) {
      currentLoggingStreak = 0;
      let checkYesterday = new Date(yesterday);
      while (loggedSet.has(getLocalDateString(checkYesterday))) {
        currentLoggingStreak++;
        checkYesterday.setDate(checkYesterday.getDate() - 1);
      }
    } else {
      currentLoggingStreak = 0;
    }
  }

  return {
    currentStreak,
    longestStreak: Math.max(maxStreak, currentStreak),
    currentLoggingStreak,
    longestLoggingStreak: Math.max(maxLoggingStreak, currentLoggingStreak),
    totalPrays,
    totalOnTime,
    totalJamaah,
    totalLate
  };
}

// Get completion rates by prayer id over the last N days
export interface PrayerCompletionRate {
  prayerId: PrayerId;
  arabicName: string;
  onTimeRate: number;
  jamaahRate: number;
  lateRate: number;
  missedRate: number;
}

export function calculatePrayerRates(
  logs: Record<string, DailyLog>,
  lastNDays: number,
  todayStr: string
): PrayerCompletionRate[] {
  const prayersToTrack: { id: PrayerId; name: string }[] = [
    { id: 'fajr', name: 'الفجر' },
    { id: 'dhuhr', name: 'الظهر' },
    { id: 'asr', name: 'العصر' },
    { id: 'maghrib', name: 'المغرب' },
    { id: 'isha', name: 'العشاء' }
  ];

  // Get active dates for range
  const datesInRange: string[] = [];
  const today = new Date(todayStr);
  for (let i = 0; i < lastNDays; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    datesInRange.push(getLocalDateString(d));
  }

  return prayersToTrack.map(({ id, name }) => {
    let noneCount = 0;
    let onTimeCount = 0;
    let jamaahCount = 0;
    let lateCount = 0;
    let daysWithRecords = 0;

    datesInRange.forEach(dateStr => {
      const log = logs[dateStr];
      daysWithRecords++;
      if (!log) {
        noneCount++;
      } else {
        const s = log.prayers[id] || PrayerStatus.NOT_LOGGED;
        if (s === PrayerStatus.NONE || s === PrayerStatus.DONT_REMEMBER || s === PrayerStatus.NOT_LOGGED) noneCount++;
        else if (s === PrayerStatus.ON_TIME) onTimeCount++;
        else if (s === PrayerStatus.CONGREGATION) jamaahCount++;
        else if (s === PrayerStatus.LATE) lateCount++;
      }
    });

    const total = daysWithRecords || 1;
    return {
      prayerId: id,
      arabicName: name,
      onTimeRate: Math.round((onTimeCount / total) * 100),
      jamaahRate: Math.round((jamaahCount / total) * 100),
      lateRate: Math.round((lateCount / total) * 100),
      missedRate: Math.round((noneCount / total) * 100)
    };
  });
}
