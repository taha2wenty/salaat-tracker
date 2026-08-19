/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PrayerDefinition, PrayerId } from './types';

export const PRAYERS: PrayerDefinition[] = [
  {
    id: 'fajr',
    arabicName: 'الفجر',
    englishName: 'Fajr',
    rakaat: 2,
    icon: '🌅',
    color: 'from-blue-600 to-sky-400'
  },
  {
    id: 'dhuhr',
    arabicName: 'الظهر',
    englishName: 'Dhuhr',
    rakaat: 4,
    icon: '☀️',
    color: 'from-amber-500 to-yellow-400'
  },
  {
    id: 'asr',
    arabicName: 'العصر',
    englishName: 'Asr',
    rakaat: 4,
    icon: '🌤️',
    color: 'from-orange-500 to-amber-500'
  },
  {
    id: 'maghrib',
    arabicName: 'المغرب',
    englishName: 'Maghrib',
    rakaat: 3,
    icon: '🌇',
    color: 'from-indigo-600 to-rose-400'
  },
  {
    id: 'isha',
    arabicName: 'العشاء',
    englishName: 'Isha',
    rakaat: 4,
    icon: '🌙',
    color: 'from-slate-800 to-indigo-900'
  }
];

export interface SpiritualQuote {
  text: string;
  source: string;
}

export const HADITHS_AND_QUOTES: SpiritualQuote[] = [
  {
    text: "إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَوْقُوتًا",
    source: "سورة النساء، الآية 103"
  },
  {
    text: "أَقْرَبُ مَا يَكُونُ الْعَبْدُ مِنْ رَبِّهِ وَهُوَ سَاجِدٌ، فَأَكْثِرُوا الدُّعَاءَ",
    source: "حديث شريف - رواه مسلم"
  },
  {
    text: "يَا بِلَالُ، أَقِمِ الصَّلَاةَ، أَرِحْنَا بِهَا",
    source: "حديث شريف - رواه أبو داود"
  },
  {
    text: "وَاسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ ۚ وَإِنَّهَا لَكَبِيرَةٌ إِلَّا عَلَى الْخَاشِعِينَ",
    source: "سورة البقرة، الآية 45"
  },
  {
    text: "عَلَيْكَ بِكَثْرَةِ السُّجُودِ لِلَّهِ، فَإِنَّكَ لَا تَسْجُدُ لِلَّهِ سَجْدَةً إِلَّا رَفَعَكَ اللَّهُ بِهَا دَرَجَةً",
    source: "حديث شريف - رواه مسلم"
  }
];

export const ARABIC_DAYS = [
  'الأحد',
  'الإثنين',
  'الثلاثاء',
  'الأربعاء',
  'الخميس',
  'الجمعة',
  'السبت'
];

export const ARABIC_MONTHS = [
  'يناير / كانون الثاني',
  'فبراير / شباط',
  'مارس / آذار',
  'أبريل / نيسان',
  'مايو / أيار',
  'يونيو / حزيران',
  'يوليو / تموز',
  'أغسطس / آب',
  'سبتمبر / أيلول',
  'أكتوبر / تشرين الأول',
  'نوفمبر / تشرين الثاني',
  'ديسمبر / كانون الأول'
];
