/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { UserLocation, DayPrayerTimes } from '../types';
import { 
  MapPin, 
  Clock, 
  Download, 
  Calendar, 
  RefreshCw, 
  Search, 
  ChevronRight, 
  ChevronLeft, 
  Plus, 
  Check, 
  Printer, 
  FileSpreadsheet, 
  Compass, 
  Moon, 
  Sun, 
  Sunrise, 
  Sunset, 
  Sparkles, 
  AlertCircle,
  Building2,
  Globe,
  Trash2,
  X,
  CheckCircle2,
  Layers,
  ArrowRight,
  Bookmark,
  ShieldCheck,
  Star,
  SlidersHorizontal
} from 'lucide-react';

// Official Calculation Authorities & Methods for all Muslim countries and world regions
export interface CalculationSource {
  id: number;
  name: string;
  shortName: string;
  description: string;
  country: string;
  region: 'north_africa' | 'gulf' | 'levant' | 'europe_americas' | 'asia' | 'global' | 'custom';
  regionLabel: string;
  keywords: string[];
  fajrAngle?: number | string;
  ishaAngle?: number | string;
}

export const CALCULATION_SOURCES: CalculationSource[] = [
  // 1. Morocco
  { 
    id: 21, 
    name: 'وزارة الأوقاف والشؤون الإسلامية بالمملكة المغربية (Habous)', 
    shortName: 'أوقاف المغرب (Habous)', 
    description: 'الحساب الرسمي المعتمد في مساجد المملكة المغربية وفق تقويم وزارة الأوقاف (الفجر 19°، العشاء 17°)',
    country: 'المغرب',
    region: 'north_africa',
    regionLabel: 'شمال إفريقيا',
    keywords: ['المغرب', 'morocco', 'maroc', 'habous', 'حبوس', 'أوقاف', 'الرباط', 'الدار البيضاء', 'فاس', 'مراكش', 'طنجة', 'وجدة', 'أكادير', 'مكناس'],
    fajrAngle: 19,
    ishaAngle: 17
  },
  // 2. Algeria
  { 
    id: 19, 
    name: 'وزارة الشؤون الدينية والأوقاف بالجمهورية الجزائرية', 
    shortName: 'الشؤون الدينية (الجزائر)', 
    description: 'الحساب المعتمد رسمياً في مساجد الجزائر والتقويم الديني الجزائري (الفجر 18°، العشاء 17°)',
    country: 'الجزائر',
    region: 'north_africa',
    regionLabel: 'شمال إفريقيا',
    keywords: ['الجزائر', 'algeria', 'algerie', 'الأوقاف', 'وهران', 'قسنطينة', 'عنابة'],
    fajrAngle: 18,
    ishaAngle: 17
  },
  // 3. Tunisia
  { 
    id: 18, 
    name: 'ديوان الإفتاء ووزارة الشؤون الدينية بالجمهورية التونسية', 
    shortName: 'الشؤون الدينية (تونس)', 
    description: 'التقويم المعتمد رسمياً في تونس وجامع الزيتونة المعمور (الفجر 18°، العشاء 18°)',
    country: 'تونس',
    region: 'north_africa',
    regionLabel: 'شمال إفريقيا',
    keywords: ['تونس', 'tunisia', 'tunisie', 'الزيتونة', 'الإفتاء', 'صفاقس', 'سوسة'],
    fajrAngle: 18,
    ishaAngle: 18
  },
  // 4. Egypt & Sudan
  { 
    id: 5, 
    name: 'الهيئة المصرية العامة للمساحة', 
    shortName: 'المساحة المصرية (مصر)', 
    description: 'المعتمد رسمياً في جمهورية مصر العربية، السودان، وأجزاء من بلاد الشام (الفجر 19.5°، العشاء 17.5°)',
    country: 'مصر',
    region: 'north_africa',
    regionLabel: 'شمال إفريقيا',
    keywords: ['مصر', 'egypt', 'القاهرة', 'الإسكندرية', 'المساحة', 'السودان', 'الخرطوم'],
    fajrAngle: 19.5,
    ishaAngle: 17.5
  },
  // 5. Saudi Arabia
  { 
    id: 4, 
    name: 'جامعة أم القرى - مكة المكرمة', 
    shortName: 'أم القرى (السعودية)', 
    description: 'المعتمد رسمياً في المملكة العربية السعودية ودول الخليج (الفجر 18.5°، العشاء 90 دقيقة بعد المغرب)',
    country: 'السعودية',
    region: 'gulf',
    regionLabel: 'الخليج العربي',
    keywords: ['السعودية', 'saudi', 'ksa', 'مكة', 'المدينة', 'الرياض', 'جدة', 'أم القرى'],
    fajrAngle: 18.5,
    ishaAngle: '90 min'
  },
  // 6. UAE (Dubai & Awqaf)
  { 
    id: 16, 
    name: 'الهيئة العامة للشؤون الإسلامية والأوقاف بالإمارات / دائرة دبي (IACAD)', 
    shortName: 'أوقاف الإمارات / دبي', 
    description: 'التقويم الهجري المعتمد رسمياً في دولة الإمارات العربية المتحدة (الفجر 18.2°، العشاء 18.2°)',
    country: 'الإمارات',
    region: 'gulf',
    regionLabel: 'الخليج العربي',
    keywords: ['الإمارات', 'uae', 'emirates', 'دبي', 'أبوظبي', 'الشارقة', 'dubai', 'iacad', 'awqaf'],
    fajrAngle: 18.2,
    ishaAngle: 18.2
  },
  // 7. Kuwait
  { 
    id: 9, 
    name: 'وزارة الأوقاف والشؤون الإسلامية بدولة الكويت', 
    shortName: 'أوقاف الكويت', 
    description: 'التقويم الرسمي المعتمد في دولة الكويت وحساب العجيري (الفجر 18°، العشاء 17.5°)',
    country: 'الكويت',
    region: 'gulf',
    regionLabel: 'الخليج العربي',
    keywords: ['الكويت', 'kuwait', 'العجيري', 'أوقاف الكويت'],
    fajrAngle: 18,
    ishaAngle: 17.5
  },
  // 8. Qatar
  { 
    id: 10, 
    name: 'وزارة الأوقاف والشؤون الإسلامية بدولة قطر', 
    shortName: 'أوقاف قطر', 
    description: 'التقويم القطري المعتمد رسمياً في دولة قطر والدوحة (الفجر 18°، العشاء 90 دقيقة)',
    country: 'قطر',
    region: 'gulf',
    regionLabel: 'الخليج العربي',
    keywords: ['قطر', 'qatar', 'الدوحة', 'أوقاف قطر'],
    fajrAngle: 18,
    ishaAngle: '90 min'
  },
  // 9. Jordan
  { 
    id: 23, 
    name: 'وزارة الأوقاف والشؤون والمقدسات الإسلامية بالمملكة الأردنية الهاشمية', 
    shortName: 'أوقاف الأردن', 
    description: 'التقويم الرسمي المعتمد في الأردن ومساجد المملكة (الفجر 18°، العشاء 18°)',
    country: 'الأردن',
    region: 'levant',
    regionLabel: 'بلاد الشام',
    keywords: ['الأردن', 'jordan', 'عمان', 'إربد', 'الزرقاء', 'أوقاف الأردن'],
    fajrAngle: 18,
    ishaAngle: 18
  },
  // 10. Palestine
  { 
    id: 5, 
    name: 'وزارة الأوقاف والشؤون الدينية بدولة فلسطين (المسجد الأقصى)', 
    shortName: 'أوقاف فلسطين / القدس', 
    description: 'المعتمد في المسجد الأقصى المبارك وعموم محافظات فلسطين والقدس الشريف (الفجر 19.5°، العشاء 17.5°)',
    country: 'فلسطين',
    region: 'levant',
    regionLabel: 'بلاد الشام',
    keywords: ['فلسطين', 'palestine', 'القدس', 'غزة', 'رام الله', 'الأقصى', 'نابلس', 'الخليل'],
    fajrAngle: 19.5,
    ishaAngle: 17.5
  },
  // 11. Iraq
  { 
    id: 8, 
    name: 'ديوان الوقف السني بجمهورية العراق', 
    shortName: 'الوقف السني (العراق)', 
    description: 'المعتمد رسمياً لدى مساجد ومحافظات العراق (الفجر 18°، العشاء 17°)',
    country: 'العراق',
    region: 'levant',
    regionLabel: 'الشرق الأوسط',
    keywords: ['العراق', 'iraq', 'بغداد', 'الموصل', 'البصرة', 'أربيل', 'الوقف السني'],
    fajrAngle: 18,
    ishaAngle: 17
  },
  // 12. Turkey
  { 
    id: 13, 
    name: 'رئاسة الشؤون الدينية التركية (Diyanet İşleri Başkanlığı)', 
    shortName: 'ديانت التركية (Diyanet)', 
    description: 'الهيئة الرسمية لحساب المواقيت في تركيا ودول البلقان وأوروبا الشرقية (الفجر 18°، العشاء 17°)',
    country: 'تركيا',
    region: 'europe_americas',
    regionLabel: 'تركيا وأوروبا',
    keywords: ['تركيا', 'turkey', 'turkiye', 'diyanet', 'ديانت', 'إسطنبول', 'أنقرة', 'إزمير', 'بورصة'],
    fajrAngle: 18,
    ishaAngle: 17
  },
  // 13. Muslim World League
  { 
    id: 3, 
    name: 'رابطة العالم الإسلامي (Muslim World League - MWL)', 
    shortName: 'رابطة العالم الإسلامي (عالمي)', 
    description: 'المعيار الفلكي الدولي المعتمد لدى المراكز الإسلامية في أوروبا وآسيا وأغلب دول العالم (الفجر 18°، العشاء 17°)',
    country: 'عالمي',
    region: 'global',
    regionLabel: 'دولي / عالمي',
    keywords: ['رابطة العالم الإسلامي', 'mwl', 'league', 'عالمي', 'international', 'مكة'],
    fajrAngle: 18,
    ishaAngle: 17
  },
  // 14. France & Europe (UOIF)
  { 
    id: 12, 
    name: 'اتحاد المنظمات الإسلامية بفرنسا (Union des Organisations Islamiques de France)', 
    shortName: 'فرنسا (UOIF)', 
    description: 'المعتمد لدى مسلمي فرنسا ودول غرب أوروبا مع معايير خطوط العرض العليا (الفجر 12°، العشاء 12°)',
    country: 'فرنسا',
    region: 'europe_americas',
    regionLabel: 'أوروبا وأمريكا',
    keywords: ['فرنسا', 'france', 'uoif', 'paris', 'باريس', 'مارسيليا', 'ليون', 'europe'],
    fajrAngle: 12,
    ishaAngle: 12
  },
  // 15. North America (ISNA)
  { 
    id: 2, 
    name: 'الجمعية الإسلامية لأمريكا الشمالية (ISNA - Islamic Society of North America)', 
    shortName: 'ISNA (أمريكا وكندا)', 
    description: 'المعتمد رسمياً لدى المراكز الإسلامية في الولايات المتحدة الأمريكية وكندا (الفجر 15°، العشاء 15°)',
    country: 'أمريكا',
    region: 'europe_americas',
    regionLabel: 'أوروبا وأمريكا',
    keywords: ['أمريكا', 'usa', 'america', 'كندا', 'canada', 'isna', 'نيويورك', 'شيكاغو', 'تورونتو'],
    fajrAngle: 15,
    ishaAngle: 15
  },
  // 16. Pakistan / India / Subcontinent (Karachi)
  { 
    id: 1, 
    name: 'جامعة العلوم الإسلامية بكراتشي (University of Islamic Sciences, Karachi)', 
    shortName: 'كراتشي (باكستان والهند)', 
    description: 'المعتمد في باكستان والهند وبنغلاديش وأفغانستان والمذهب الحنفي (الفجر 18°، العشاء 18°)',
    country: 'باكستان',
    region: 'asia',
    regionLabel: 'آسيا',
    keywords: ['باكستان', 'pakistan', 'india', 'الهند', 'karachi', 'كراتشي', 'lahore', 'bangladesh', 'بنغلاديش'],
    fajrAngle: 18,
    ishaAngle: 18
  },
  // 17. Malaysia (JAKIM)
  { 
    id: 17, 
    name: 'دائرة التنمية الإسلامية بماليزيا (Jabatan Kemajuan Islam Malaysia - JAKIM)', 
    shortName: 'JAKIM (ماليزيا)', 
    description: 'الهيئة الرسمية الحكومية لحساب المواقيت في ماليزيا (الفجر 20°، العشاء 18°)',
    country: 'ماليزيا',
    region: 'asia',
    regionLabel: 'آسيا',
    keywords: ['ماليزيا', 'malaysia', 'jakim', 'كوالالمبور', 'kuala lumpur'],
    fajrAngle: 20,
    ishaAngle: 18
  },
  // 18. Indonesia (Kemenag)
  { 
    id: 20, 
    name: 'وزارة الشؤون الدينية الإندونيسية (Kementerian Agama RI - KEMENAG)', 
    shortName: 'كيميناغ (إندونيسيا)', 
    description: 'المعتمد رسمياً في جميع أقاليم جمهورية إندونيسيا (الفجر 20°، العشاء 18°)',
    country: 'إندونيسيا',
    region: 'asia',
    regionLabel: 'آسيا',
    keywords: ['إندونيسيا', 'indonesia', 'kemenag', 'جاكرتا', 'jakarta', 'surabaya'],
    fajrAngle: 20,
    ishaAngle: 18
  },
  // 19. Singapore (MUIS)
  { 
    id: 11, 
    name: 'مجلس الشؤون الإسلامية بسنغافورة (Majlis Ugama Islam Singapura - MUIS)', 
    shortName: 'MUIS (سنغافورة)', 
    description: 'الهيئة الدينية الرسمية المعتمدة في سنغافورة (الفجر 20°، العشاء 18°)',
    country: 'سنغافورة',
    region: 'asia',
    regionLabel: 'آسيا',
    keywords: ['سنغافورة', 'singapore', 'muis'],
    fajrAngle: 20,
    ishaAngle: 18
  },
  // 20. Russia (DUM RF)
  { 
    id: 14, 
    name: 'الإدارة الدينية لمسلمي روسيا الاتحادية (DUM RF)', 
    shortName: 'الإدارة الدينية (روسيا)', 
    description: 'المعتمد لدى مساجد موسكو والقوقاز وعموم روسيا الاتحادية (الفجر 16°، العشاء 15°)',
    country: 'روسيا',
    region: 'europe_americas',
    regionLabel: 'روسيا وآسيا الوسطى',
    keywords: ['روسيا', 'russia', 'moscow', 'موسكو', 'dum rf', 'كازان', 'تتارستان'],
    fajrAngle: 16,
    ishaAngle: 15
  },
  // 21. Moonsighting Committee Worldwide
  { 
    id: 15, 
    name: 'لجنة تحري الهلال العالمية (Moonsighting Committee Worldwide)', 
    shortName: 'تحري الهلال العالمية', 
    description: 'تعتمد الرؤية الفلكية المعتدلة للصلوات وتغير الفصول (الفجر 18°، العشاء 18°)',
    country: 'عالمي',
    region: 'global',
    regionLabel: 'دولي / عالمي',
    keywords: ['تحري الهلال', 'moonsighting', 'رؤية الهلال', 'فلكي'],
    fajrAngle: 18,
    ishaAngle: 18
  },
  // 22. Portugal & Spain (Lisbon)
  { 
    id: 22, 
    name: 'المركز الإسلامي بلشبونة وشبه الجزيرة الإيبيرية (Comunidade Islâmica de Lisboa)', 
    shortName: 'لشبونة (البرتغال وإسبانيا)', 
    description: 'المعتمد في البرتغال وإسبانيا (الفجر 18°، العشاء 18°)',
    country: 'البرتغال',
    region: 'europe_americas',
    regionLabel: 'أوروبا وأمريكا',
    keywords: ['البرتغال', 'portugal', 'lisbon', 'لشبونة', 'إسبانيا', 'spain', 'مدريد'],
    fajrAngle: 18,
    ishaAngle: 18
  },
  // 23. Iran & Tehran
  { 
    id: 7, 
    name: 'معهد الجيوفيزياء بجامعة طهران', 
    shortName: 'جامعة طهران', 
    description: 'المعتمد في إيران وبعض دول آسيا الوسطى (الفجر 17.7°، العشاء 14°)',
    country: 'إيران',
    region: 'asia',
    regionLabel: 'آسيا',
    keywords: ['إيران', 'iran', 'طهران', 'tehran'],
    fajrAngle: 17.7,
    ishaAngle: 14
  }
];

interface SearchResultItem {
  id: string | number;
  city: string;
  country: string;
  state?: string;
  latitude: number;
  longitude: number;
  displayName: string;
}

export default function PrayerTimesTracker() {
  const [currentLocation, setCurrentLocation] = useState<UserLocation | null>(() => {
    const saved = localStorage.getItem('salaat_prayer_location_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [savedLocations, setSavedLocations] = useState<UserLocation[]>(() => {
    const saved = localStorage.getItem('salaat_saved_locations_v1');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  // Modal / location change states
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  
  // Location Search query & results
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Staged location during selection flow (before confirming calculation source)
  const [stagedLocation, setStagedLocation] = useState<SearchResultItem | null>(null);
  const [selectedSourceId, setSelectedSourceId] = useState<number>(4); // Default Umm Al Qura

  // Online Association / Calculation Source Search Query & Filter
  const [associationSearchQuery, setAssociationSearchQuery] = useState('');
  const [selectedRegionFilter, setSelectedRegionFilter] = useState<string>('all');

  // GPS / Auto-detect states
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  // Prayer times data state
  const [monthData, setMonthData] = useState<DayPrayerTimes[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Active view: 'today' or 'month'
  const [viewMode, setViewMode] = useState<'today' | 'month'>('today');

  // Selected date / month for navigation
  const [selectedYear, setSelectedYear] = useState<number>(() => new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(() => new Date().getMonth() + 1); // 1-12
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(() => new Date().getDate() - 1);

  // Time format: 12h or 24h
  const [is12Hour, setIs12Hour] = useState(true);

  // Current time for live countdown
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // Download menu toggle
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Save location updates
  useEffect(() => {
    if (currentLocation) {
      localStorage.setItem('salaat_prayer_location_v1', JSON.stringify(currentLocation));
      
      // Also ensure it is present in savedLocations
      setSavedLocations(prev => {
        const exists = prev.some(
          l => (l.city.toLowerCase() === currentLocation.city.toLowerCase() && 
               l.country.toLowerCase() === currentLocation.country.toLowerCase()) ||
               (l.latitude === currentLocation.latitude && l.longitude === currentLocation.longitude)
        );
        if (!exists) {
          const updated = [currentLocation, ...prev.slice(0, 9)];
          localStorage.setItem('salaat_saved_locations_v1', JSON.stringify(updated));
          return updated;
        }
        return prev;
      });
    }
  }, [currentLocation]);

  // When a staged location is set (e.g. Morocco, Algeria, Egypt, Turkey, etc.),
  // automatically suggest the matching national association!
  useEffect(() => {
    if (stagedLocation) {
      const locCountry = (stagedLocation.country || '').toLowerCase();
      const locCity = (stagedLocation.city || '').toLowerCase();
      const locDisplay = (stagedLocation.displayName || '').toLowerCase();

      // Find best matching source
      const matchedSource = CALCULATION_SOURCES.find(source => {
        return source.keywords.some(kw => 
          locCountry.includes(kw.toLowerCase()) || 
          locCity.includes(kw.toLowerCase()) ||
          locDisplay.includes(kw.toLowerCase())
        );
      });

      if (matchedSource) {
        setSelectedSourceId(matchedSource.id);
      }
    }
  }, [stagedLocation]);

  // Fetch Prayer Times for given location, month, year
  const fetchPrayerTimes = async (location: UserLocation, year: number, month: number) => {
    setIsLoading(true);
    setFetchError(null);

    const method = location.method || 4;
    const cacheKey = `salaat_timings_${location.country}_${location.city}_${location.latitude || ''}_${location.longitude || ''}_${year}_${month}_m${method}`;
    const cached = localStorage.getItem(cacheKey);

    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMonthData(parsed);
          setIsLoading(false);
          return;
        }
      } catch (e) {
        console.warn('Corrupt cache, refetching...', e);
      }
    }

    try {
      let url = '';
      if (location.latitude && location.longitude) {
        url = `https://api.aladhan.com/v1/calendar/${year}/${month}?latitude=${location.latitude}&longitude=${location.longitude}&method=${method}`;
      } else {
        url = `https://api.aladhan.com/v1/calendarByCity/${year}/${month}?city=${encodeURIComponent(location.city)}&country=${encodeURIComponent(location.country)}&method=${method}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`تعذر استرجاع الأوقات (رمز الاستجابة: ${response.status})`);
      }

      const resJson = await response.json();
      if (resJson.code === 200 && Array.isArray(resJson.data) && resJson.data.length > 0) {
        setMonthData(resJson.data);
        // Cache locally for instant offline usage
        localStorage.setItem(cacheKey, JSON.stringify(resJson.data));
      } else {
        throw new Error('لم يتم العثور على أوقات دقيقة لهذه المدينة. يرجى اختيار الموقع مرة أخرى.');
      }
    } catch (err: any) {
      console.error('Fetch error:', err);
      setFetchError(err.message || 'حدث خطأ في الاتصال بالشبكة لتحميل مواقيت الصلاة');
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger fetch when location or month/year changes
  useEffect(() => {
    if (currentLocation) {
      fetchPrayerTimes(currentLocation, selectedYear, selectedMonth);
    }
  }, [currentLocation, selectedYear, selectedMonth]);

  // Online Geocoding Search: Searches cities around the world via Open-Meteo
  const handleSearchLocations = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim();
    if (!query || query.length < 2) {
      setSearchError('يرجى كتابة حرفين على الأقل للبحث عن المدينة أو الدولة');
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    setSearchResults([]);

    try {
      // 1. Primary: Open-Meteo Worldwide Geocoding API
      const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=12&language=ar&format=json`);
      if (!res.ok) {
        throw new Error('تعذر البحث عن المدينة');
      }

      const data = await res.json();
      if (data.results && Array.isArray(data.results) && data.results.length > 0) {
        const items: SearchResultItem[] = data.results.map((r: any) => {
          const parts = [r.name];
          if (r.admin1 && r.admin1 !== r.name) parts.push(r.admin1);
          if (r.country) parts.push(r.country);

          return {
            id: r.id,
            city: r.name,
            country: r.country || '',
            state: r.admin1,
            latitude: r.latitude,
            longitude: r.longitude,
            displayName: parts.join(' - ')
          };
        });
        setSearchResults(items);
      } else {
        // Fallback search with English
        const fallbackRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=12&language=en&format=json`);
        const fallbackData = await fallbackRes.json();
        if (fallbackData.results && Array.isArray(fallbackData.results) && fallbackData.results.length > 0) {
          const items: SearchResultItem[] = fallbackData.results.map((r: any) => ({
            id: r.id,
            city: r.name,
            country: r.country || '',
            state: r.admin1,
            latitude: r.latitude,
            longitude: r.longitude,
            displayName: `${r.name}, ${r.admin1 ? r.admin1 + ', ' : ''}${r.country || ''}`
          }));
          setSearchResults(items);
        } else {
          setSearchError(`لم يتم العثور على نتائج مطابقة لـ "${query}". يرجى تجربة اسم مدينة أخرى أو كتابتها بالإنجليزية.`);
        }
      }
    } catch (err: any) {
      console.error('Search error:', err);
      setSearchError('حدث خطأ أثناء البحث عن الموقع عبر الإنترنت. تحقق من الاتصال وحاول مجدداً.');
    } finally {
      setIsSearching(false);
    }
  };

  // Robust GPS / Geolocation / IP Detection
  const handleDetectLocation = () => {
    setGeoLoading(true);
    setGeoError(null);
    setSearchError(null);

    const resolveWithCoords = async (lat: number, lng: number, fallbackCity = 'موقعي الحالي') => {
      try {
        const geoRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=ar`);
        const geoData = await geoRes.json();
        
        const cityName = geoData.city || geoData.locality || geoData.principalSubdivision || fallbackCity;
        const countryName = geoData.countryName || 'الموقع الحالي';
        const stateName = geoData.principalSubdivision;

        const staged: SearchResultItem = {
          id: `gps-${lat}-${lng}`,
          city: cityName,
          country: countryName,
          state: stateName,
          latitude: lat,
          longitude: lng,
          displayName: `${cityName} - ${countryName}`
        };

        setStagedLocation(staged);
        setGeoLoading(false);
      } catch (err) {
        // Fallback directly with coords
        const staged: SearchResultItem = {
          id: `gps-${lat}-${lng}`,
          city: fallbackCity,
          country: 'إحداثيات GPS',
          latitude: lat,
          longitude: lng,
          displayName: `${fallbackCity} (${lat.toFixed(2)}, ${lng.toFixed(2)})`
        };
        setStagedLocation(staged);
        setGeoLoading(false);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolveWithCoords(pos.coords.latitude, pos.coords.longitude);
        },
        async (error) => {
          console.warn('Browser GPS error, trying IP lookup...', error);
          try {
            const ipRes = await fetch('https://ipapi.co/json/');
            if (ipRes.ok) {
              const ipData = await ipRes.json();
              if (ipData.latitude && ipData.longitude) {
                resolveWithCoords(ipData.latitude, ipData.longitude, ipData.city || 'موقعي');
                return;
              }
            }
            throw new Error('IP lookup failed');
          } catch (ipErr) {
            setGeoLoading(false);
            setGeoError('تعذر تحديد الموقع تلقائياً. يمكنك كتابة اسم مدينتك في حقل البحث.');
          }
        },
        { timeout: 8000, enableHighAccuracy: true }
      );
    } else {
      fetch('https://ipapi.co/json/')
        .then(res => res.json())
        .then(ipData => {
          if (ipData.latitude && ipData.longitude) {
            resolveWithCoords(ipData.latitude, ipData.longitude, ipData.city || 'موقعي');
          } else {
            throw new Error('No coords');
          }
        })
        .catch(() => {
          setGeoLoading(false);
          setGeoError('المتصفح لا يدعم تحديد الموقع. يُرجى البحث عن اسم مدينتك يدوياً.');
        });
    }
  };

  // When a user selects a search result item -> advance to Source selection
  const handlePickSearchResult = (item: SearchResultItem) => {
    setStagedLocation(item);
  };

  // Filter calculation sources by search query and region filter
  const filteredSources = useMemo(() => {
    let list = [...CALCULATION_SOURCES];

    // Check if there is a recommended source for the staged location
    let recommendedId: number | null = null;
    if (stagedLocation) {
      const locCountry = (stagedLocation.country || '').toLowerCase();
      const locCity = (stagedLocation.city || '').toLowerCase();
      const locDisplay = (stagedLocation.displayName || '').toLowerCase();

      const matched = list.find(s => 
        s.keywords.some(kw => 
          locCountry.includes(kw.toLowerCase()) || 
          locCity.includes(kw.toLowerCase()) ||
          locDisplay.includes(kw.toLowerCase())
        )
      );
      if (matched) {
        recommendedId = matched.id;
      }
    }

    // Filter by region if chosen
    if (selectedRegionFilter !== 'all') {
      list = list.filter(s => s.region === selectedRegionFilter);
    }

    // Filter by online association search query
    const q = associationSearchQuery.toLowerCase().trim();
    if (q) {
      list = list.filter(s => 
        s.name.toLowerCase().includes(q) ||
        s.shortName.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.country.toLowerCase().includes(q) ||
        s.regionLabel.toLowerCase().includes(q) ||
        s.keywords.some(kw => kw.toLowerCase().includes(q))
      );
    }

    // Sort: Recommended first if exists
    if (recommendedId !== null) {
      list.sort((a, b) => {
        if (a.id === recommendedId) return -1;
        if (b.id === recommendedId) return 1;
        return 0;
      });
    }

    return list;
  }, [associationSearchQuery, selectedRegionFilter, stagedLocation]);

  // Recommended source for active staged location
  const recommendedSource = useMemo(() => {
    if (!stagedLocation) return null;
    const locCountry = (stagedLocation.country || '').toLowerCase();
    const locCity = (stagedLocation.city || '').toLowerCase();
    const locDisplay = (stagedLocation.displayName || '').toLowerCase();

    return CALCULATION_SOURCES.find(s => 
      s.keywords.some(kw => 
        locCountry.includes(kw.toLowerCase()) || 
        locCity.includes(kw.toLowerCase()) ||
        locDisplay.includes(kw.toLowerCase())
      )
    ) || null;
  }, [stagedLocation]);

  // Confirm final location and calculation source
  const handleConfirmLocationAndSource = (sourceId?: number) => {
    if (!stagedLocation) return;
    const finalSourceId = sourceId !== undefined ? sourceId : selectedSourceId;

    const newLoc: UserLocation = {
      city: stagedLocation.city,
      country: stagedLocation.country,
      arabicCity: stagedLocation.city,
      arabicCountry: stagedLocation.country,
      latitude: stagedLocation.latitude,
      longitude: stagedLocation.longitude,
      method: finalSourceId
    };

    setCurrentLocation(newLoc);
    setIsLocationModalOpen(false);
    setStagedLocation(null);
    setSearchResults([]);
    setSearchQuery('');
    setAssociationSearchQuery('');
  };

  // Clean time string (removes timezone text like "(EST)" or seconds)
  const cleanTimeString = (raw: string | undefined): string => {
    if (!raw) return '--:--';
    return raw.split(' ')[0].substring(0, 5);
  };

  // Format time according to 12h or 24h
  const formatTime = (timeStr: string | undefined): string => {
    const cleaned = cleanTimeString(timeStr);
    if (cleaned === '--:--') return cleaned;
    
    if (!is12Hour) return cleaned;

    const [hoursStr, minutesStr] = cleaned.split(':');
    let h = parseInt(hoursStr, 10);
    const m = minutesStr;
    const period = h >= 12 ? 'م' : 'ص';
    
    h = h % 12;
    if (h === 0) h = 12;

    return `${h}:${m} ${period}`;
  };

  // Get active day data
  const currentDayData = useMemo(() => {
    if (!monthData || monthData.length === 0) return null;
    const safeIdx = Math.min(Math.max(0, selectedDayIndex), monthData.length - 1);
    return monthData[safeIdx] || null;
  }, [monthData, selectedDayIndex]);

  // Calculate countdown to next prayer
  const nextPrayerInfo = useMemo(() => {
    if (!currentDayData) return null;

    const timings = currentDayData.timings;
    const prayerOrder: { key: keyof typeof timings; name: string; icon: any }[] = [
      { key: 'Fajr', name: 'الفجر', icon: Sunrise },
      { key: 'Sunrise', name: 'الشروق', icon: Sun },
      { key: 'Dhuhr', name: 'الظهر', icon: Sun },
      { key: 'Asr', name: 'العصر', icon: Sun },
      { key: 'Maghrib', name: 'المغرب', icon: Sunset },
      { key: 'Isha', name: 'العشاء', icon: Moon },
    ];

    const now = currentTime;
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const currentSeconds = now.getSeconds();

    for (let i = 0; i < prayerOrder.length; i++) {
      const p = prayerOrder[i];
      const raw = timings[p.key];
      const timeClean = cleanTimeString(raw);
      if (timeClean === '--:--') continue;

      const [h, m] = timeClean.split(':').map(Number);
      const prayerMinutes = h * 60 + m;

      if (prayerMinutes > currentMinutes || (prayerMinutes === currentMinutes && currentSeconds === 0)) {
        const diffMinutes = prayerMinutes - currentMinutes;
        const totalSecondsLeft = diffMinutes * 60 - currentSeconds;
        const hoursLeft = Math.floor(totalSecondsLeft / 3600);
        const minsLeft = Math.floor((totalSecondsLeft % 3600) / 60);
        const secsLeft = totalSecondsLeft % 60;

        return {
          prayer: p.name,
          time: formatTime(raw),
          hoursLeft,
          minsLeft,
          secsLeft,
          isNext: true,
          key: p.key
        };
      }
    }

    // If passed Isha, next is Fajr tomorrow
    const fajrRaw = timings['Fajr'];
    return {
      prayer: 'فجر الغد',
      time: formatTime(fajrRaw),
      hoursLeft: 0,
      minsLeft: 0,
      secsLeft: 0,
      isNext: false,
      key: 'Fajr'
    };
  }, [currentDayData, currentTime, is12Hour]);

  // Handle month navigation
  const handleNavigateMonth = (direction: number) => {
    let nextMonth = selectedMonth + direction;
    let nextYear = selectedYear;

    if (nextMonth > 12) {
      nextMonth = 1;
      nextYear += 1;
    } else if (nextMonth < 1) {
      nextMonth = 12;
      nextYear -= 1;
    }

    setSelectedMonth(nextMonth);
    setSelectedYear(nextYear);
    setSelectedDayIndex(0);
  };

  // Export & Download Sheet Functionality
  const handleDownloadSheet = (format: 'print' | 'csv' | 'json') => {
    setShowDownloadMenu(false);
    if (!monthData || monthData.length === 0 || !currentLocation) return;

    const cityName = currentLocation.arabicCity || currentLocation.city;
    const countryName = currentLocation.arabicCountry || currentLocation.country;
    const hijriMonthName = monthData[0]?.date?.hijri?.month?.ar || '';
    const hijriYear = monthData[0]?.date?.hijri?.year || '';

    if (format === 'csv') {
      const headers = ['اليوم', 'التاريخ الميلادي', 'التاريخ الهجري', 'الفجر', 'الشروق', 'الظهر', 'العصر', 'المغرب', 'العشاء'];
      const rows = monthData.map(day => {
        const weekday = day.date.hijri.weekday.ar || day.date.gregorian.weekday.en;
        const gregDate = day.date.gregorian.date;
        const hijriDate = day.date.hijri.date;
        return [
          `"${weekday}"`,
          `"${gregDate}"`,
          `"${hijriDate}"`,
          `"${cleanTimeString(day.timings.Fajr)}"`,
          `"${cleanTimeString(day.timings.Sunrise)}"`,
          `"${cleanTimeString(day.timings.Dhuhr)}"`,
          `"${cleanTimeString(day.timings.Asr)}"`,
          `"${cleanTimeString(day.timings.Maghrib)}"`,
          `"${cleanTimeString(day.timings.Isha)}"`
        ].join(',');
      });

      const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `جدول_مواقيت_الصلاة_${cityName}_${selectedYear}_${selectedMonth}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (format === 'json') {
      const jsonContent = JSON.stringify({
        location: currentLocation,
        year: selectedYear,
        month: selectedMonth,
        data: monthData
      }, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `بيانات_مواقيت_الصلاة_${cityName}_${selectedYear}_${selectedMonth}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (format === 'print') {
      // Print formatted styled table
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;

      const rowsHtml = monthData.map((d, i) => `
        <tr style="background-color: ${i % 2 === 0 ? '#ffffff' : '#f9f8f4'}; text-align: center; border-bottom: 1px solid #e5e2d9;">
          <td style="padding: 6px 8px; font-weight: bold; border: 1px solid #e5e2d9;">${d.date.hijri.day} ${d.date.hijri.weekday.ar || ''}</td>
          <td style="padding: 6px 8px; border: 1px solid #e5e2d9;">${d.date.gregorian.date}</td>
          <td style="padding: 6px 8px; font-weight: bold; color: #2D4F1E; border: 1px solid #e5e2d9;">${cleanTimeString(d.timings.Fajr)}</td>
          <td style="padding: 6px 8px; color: #666; border: 1px solid #e5e2d9;">${cleanTimeString(d.timings.Sunrise)}</td>
          <td style="padding: 6px 8px; font-weight: bold; color: #2D4F1E; border: 1px solid #e5e2d9;">${cleanTimeString(d.timings.Dhuhr)}</td>
          <td style="padding: 6px 8px; font-weight: bold; color: #2D4F1E; border: 1px solid #e5e2d9;">${cleanTimeString(d.timings.Asr)}</td>
          <td style="padding: 6px 8px; font-weight: bold; color: #2D4F1E; border: 1px solid #e5e2d9;">${cleanTimeString(d.timings.Maghrib)}</td>
          <td style="padding: 6px 8px; font-weight: bold; color: #2D4F1E; border: 1px solid #e5e2d9;">${cleanTimeString(d.timings.Isha)}</td>
        </tr>
      `).join('');

      printWindow.document.write(`
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="utf-8">
          <title>إمساكية ومواقيت الصلاة - ${cityName}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap');
            body {
              font-family: 'Amiri', serif, sans-serif;
              margin: 20px;
              color: #1a1a1a;
              background-color: #ffffff;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #2D4F1E;
              padding-bottom: 12px;
              margin-bottom: 20px;
            }
            h1 { margin: 0 0 5px 0; color: #2D4F1E; font-size: 24px; }
            p { margin: 3px 0; font-size: 14px; color: #4a4a4a; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 10px; }
            th { background-color: #2D4F1E; color: #ffffff; padding: 8px; font-size: 13px; border: 1px solid #2D4F1E; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>سِجِلّ الصلاة — إمساكية ومواقيت الصلاة</h1>
            <p><strong>المدينة:</strong> ${cityName} - ${countryName} | <strong>شهر:</strong> ${hijriMonthName} ${hijriYear} هـ (${selectedMonth}/${selectedYear} م)</p>
            <p style="font-size: 11px; color: #777;">تم الاستخراج بواسطة تطبيق سِجِلّ الصلاة</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>اليوم الهجري</th>
                <th>التاريخ الميلادي</th>
                <th>الفجر</th>
                <th>الشروق</th>
                <th>الظهر</th>
                <th>العصر</th>
                <th>المغرب</th>
                <th>العشاء</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  // Reusable Location Search & Association Selection Interface
  const renderLocationSetupFlow = () => {
    return (
      <div className="space-y-5">
        
        {/* STEP 1: If no staged location, show Search & GPS Detection */}
        {!stagedLocation ? (
          <div className="space-y-4">
            
            {/* Online Live Location Search Form */}
            <form onSubmit={handleSearchLocations} className="space-y-2">
              <label className="block text-xs font-bold font-serif text-[#2D4F1E]">
                ابحث عن المدينة أو الدولة عبر الإنترنت:
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="اكتب اسم مدينتك أو دولتك (مثال: الرباط، مكة، الرياض، الدار البيضاء، القاهرة، تونس، باريس)..."
                    className="w-full py-2.5 pr-9 pl-3 text-xs bg-[#FDFBF7] border border-[#E5E2D9] focus:border-[#2D4F1E] focus:outline-none font-sans"
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSearching || !searchQuery.trim()}
                  className="px-4 py-2.5 bg-[#2D4F1E] hover:bg-[#233f17] disabled:opacity-50 text-white font-bold text-xs font-serif flex items-center gap-1.5 transition-all cursor-pointer shadow-xs shrink-0"
                >
                  {isSearching ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                  <span>بحث عن المدينة</span>
                </button>
              </div>
            </form>

            {/* GPS Auto-Detect Button */}
            <div>
              <button
                type="button"
                onClick={handleDetectLocation}
                disabled={geoLoading}
                className="w-full py-2.5 px-4 bg-[#2D4F1E]/5 hover:bg-[#2D4F1E]/10 border border-[#2D4F1E]/30 text-[#2D4F1E] font-bold text-xs font-serif flex items-center justify-center gap-2 transition-all cursor-pointer"
                id="gps-detect-button"
              >
                {geoLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-[#2D4F1E]" />
                ) : (
                  <Compass className="w-4 h-4 text-[#2D4F1E]" />
                )}
                <span>{geoLoading ? 'جاري تحديد موقعك الجغرافي...' : 'تحديد الموقع تلقائياً عبر GPS'}</span>
              </button>
              {geoError && (
                <p className="text-[11px] text-rose-600 mt-1.5 text-center font-sans">{geoError}</p>
              )}
            </div>

            {/* Search Loading Indicator */}
            {isSearching && (
              <div className="py-6 text-center space-y-2">
                <RefreshCw className="w-5 h-5 animate-spin text-[#2D4F1E] mx-auto" />
                <p className="text-xs text-gray-500 font-serif">جاري البحث في خريطة العالم وقواعد البيانات الجغرافية...</p>
              </div>
            )}

            {/* Search Error Message */}
            {searchError && (
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 text-xs font-serif flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{searchError}</span>
              </div>
            )}

            {/* Search Results Display */}
            {searchResults.length > 0 && (
              <div className="space-y-2 animate-fade-in">
                <div className="text-xs font-bold font-serif text-[#2D4F1E] flex items-center justify-between">
                  <span>نتائج البحث الجغرافي ({searchResults.length} مدينة):</span>
                  <span className="text-[11px] font-normal text-gray-500">اختر مدينتك للمتابعة واختيار الهيئة</span>
                </div>
                <div className="border border-[#E5E2D9] divide-y divide-[#E5E2D9] max-h-60 overflow-y-auto bg-white">
                  {searchResults.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handlePickSearchResult(item)}
                      className="w-full p-3 text-right hover:bg-[#2D4F1E]/5 flex items-center justify-between transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5">
                        <MapPin className="w-4 h-4 text-gray-400 group-hover:text-[#2D4F1E] shrink-0" />
                        <div>
                          <div className="font-bold text-xs font-serif text-[#1A1A1A] group-hover:text-[#2D4F1E]">
                            {item.city}
                          </div>
                          <div className="text-[11px] text-gray-500 font-sans">
                            {item.displayName}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-[#2D4F1E] text-xs font-serif font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                        <span>اختيار</span>
                        <ChevronLeft className="w-4 h-4" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>
        ) : (
          /* STEP 2: SEARCH & SELECT ASSOCIATION / CALCULATION METHOD */
          <div className="space-y-4 animate-fade-in">
            
            {/* Selected Location Banner & Option to re-select */}
            <div className="p-3.5 bg-[#2D4F1E]/5 border border-[#2D4F1E]/30 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#2D4F1E] text-white flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 font-serif">المدينة المحددة:</div>
                  <div className="text-xs font-bold font-serif text-[#2D4F1E]">
                    {stagedLocation.city} — {stagedLocation.country}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setStagedLocation(null);
                  setAssociationSearchQuery('');
                }}
                className="px-2.5 py-1 text-[11px] font-serif font-bold text-[#2D4F1E] hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>تغيير المدينة</span>
                <ChevronLeft className="w-3 h-3" />
              </button>
            </div>

            {/* Association Search & Filter Controls */}
            <div className="space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <h4 className="text-sm font-bold font-serif text-[#2D4F1E] flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  <span>ابحث واختر الهيئة / الوزارة المعتمدة لحساب المواقيت:</span>
                </h4>
                <span className="text-[11px] text-gray-500 font-sans">
                  {filteredSources.length} هيئة وجمعية متاحة
                </span>
              </div>

              {/* Online Association Search Input */}
              <div className="relative">
                <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={associationSearchQuery}
                  onChange={(e) => setAssociationSearchQuery(e.target.value)}
                  placeholder="ابحث عن الجمعية أو الدولة (مثال: وزارة الأوقاف المغربية، Habous، ديانت، المساحة المصرية، فرنسا، أمريكا)..."
                  className="w-full py-2 pr-9 pl-8 text-xs bg-[#FDFBF7] border border-[#E5E2D9] focus:border-[#2D4F1E] focus:outline-none font-sans"
                />
                {associationSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setAssociationSearchQuery('')}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Regional Category Filters */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] font-serif">
                {[
                  { id: 'all', label: 'جميع الهيئات' },
                  { id: 'north_africa', label: 'شمال إفريقيا (المغرب، الجزائر، تونس، مصر)' },
                  { id: 'gulf', label: 'الخليج العربي' },
                  { id: 'levant', label: 'بلاد الشام والعراق' },
                  { id: 'europe_americas', label: 'أوروبا وأمريكا' },
                  { id: 'asia', label: 'آسيا وشبه القارة' },
                  { id: 'global', label: 'عالمي / دولي' },
                ].map(filter => (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => setSelectedRegionFilter(filter.id)}
                    className={`px-2.5 py-1 shrink-0 border transition-all cursor-pointer ${
                      selectedRegionFilter === filter.id
                        ? 'bg-[#2D4F1E] text-white border-[#2D4F1E] font-bold'
                        : 'bg-[#FDFBF7] text-gray-700 border-[#E5E2D9] hover:bg-gray-100'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {/* List of Filtered Associations */}
            <div className="space-y-2 max-h-72 overflow-y-auto p-1 border border-[#E5E2D9] bg-[#FDFBF7]">
              {filteredSources.length === 0 ? (
                <div className="p-6 text-center space-y-2 bg-white">
                  <AlertCircle className="w-6 h-6 text-amber-500 mx-auto" />
                  <p className="text-xs font-serif text-gray-600">
                    لم يتم العثور على جمعية تطابق بحثك "{associationSearchQuery}".
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setAssociationSearchQuery('');
                      setSelectedRegionFilter('all');
                    }}
                    className="text-xs text-[#2D4F1E] font-serif font-bold hover:underline cursor-pointer"
                  >
                    عرض جميع الهيئات والجمعيات
                  </button>
                </div>
              ) : (
                filteredSources.map((source) => {
                  const isSelected = selectedSourceId === source.id;
                  const isRecommended = recommendedSource?.id === source.id;

                  return (
                    <button
                      key={source.id}
                      type="button"
                      onClick={() => setSelectedSourceId(source.id)}
                      className={`w-full p-3 text-right border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                        isSelected
                          ? 'bg-white border-[#2D4F1E] ring-2 ring-[#2D4F1E]/20 shadow-xs'
                          : isRecommended
                          ? 'bg-amber-50/40 border-amber-300 hover:border-[#2D4F1E]'
                          : 'bg-white border-[#E5E2D9] hover:border-[#2D4F1E]/50'
                      }`}
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="font-bold text-xs font-serif text-[#1A1A1A]">
                            {source.name}
                          </span>
                          
                          {isRecommended && (
                            <span className="text-[10px] px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 font-serif font-bold rounded-xs flex items-center gap-1">
                              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                              <span>الموصى به لبلدك ({stagedLocation.country})</span>
                            </span>
                          )}

                          <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 font-sans rounded-xs">
                            {source.regionLabel}
                          </span>
                        </div>

                        <p className="text-[11px] text-gray-500 font-sans leading-relaxed">
                          {source.description}
                        </p>

                        {(source.fajrAngle || source.ishaAngle) && (
                          <div className="text-[10px] text-gray-400 font-sans flex items-center gap-3 pt-0.5">
                            {source.fajrAngle && <span>زاوية الفجر: {source.fajrAngle}°</span>}
                            {source.ishaAngle && <span>العشاء: {typeof source.ishaAngle === 'number' ? `${source.ishaAngle}°` : source.ishaAngle}</span>}
                          </div>
                        )}
                      </div>

                      <div className="shrink-0 pt-1">
                        {isSelected ? (
                          <div className="w-5 h-5 rounded-full bg-[#2D4F1E] text-white flex items-center justify-center">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full border border-gray-300"></div>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Final Confirmation Button */}
            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => handleConfirmLocationAndSource()}
                className="flex-1 py-3 bg-[#2D4F1E] hover:bg-[#233f17] text-white font-bold text-xs font-serif flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>اعتماد الموقع والجمعية وحساب المواقيت</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setStagedLocation(null);
                  setAssociationSearchQuery('');
                }}
                className="px-4 py-3 border border-[#E5E2D9] hover:bg-gray-50 text-gray-700 text-xs font-serif cursor-pointer"
              >
                رجوع
              </button>
            </div>

          </div>
        )}

      </div>
    );
  };

  // If NO location set yet (First time opening), show clean onboarding prompt card
  if (!currentLocation) {
    return (
      <div className="bg-white border border-[#E5E2D9] p-6 md:p-8 space-y-6 shadow-xs animate-fade-in" id="prayer-times-first-setup">
        <div className="text-center space-y-3 max-w-xl mx-auto">
          <div className="w-14 h-14 mx-auto bg-[#2D4F1E]/10 rounded-full flex items-center justify-center border border-[#2D4F1E]/20 text-[#2D4F1E]">
            <Clock className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold font-serif text-[#2D4F1E]">
            أوقات ومواقيت الصلاة
          </h2>
          <p className="text-sm text-[#555] font-sans leading-relaxed">
            ابحث عن مدينتك أو حدد موقعك، ثم ابحث واختر الوزارة أو الهيئة الإسلامية المعتمدة لحساب مواقيت الصلاة في بلدك (مثل وزارة الأوقاف المغربية، ديانت، المساحة المصرية، أم القرى، وغيرها).
          </p>
        </div>

        <div className="max-w-xl mx-auto border-t border-[#E5E2D9] pt-5">
          {renderLocationSetupFlow()}
        </div>
      </div>
    );
  }

  const cityName = currentLocation.arabicCity || currentLocation.city;
  const countryName = currentLocation.arabicCountry || currentLocation.country;
  const activeSource = CALCULATION_SOURCES.find(m => m.id === (currentLocation.method || 4)) || CALCULATION_SOURCES[0];

  return (
    <div className="space-y-4" id="prayer-times-dashboard">
      
      {/* 1. Top Header Bar: Location, Controls & Top-Right Change Location button */}
      <div className="bg-white border border-[#E5E2D9] p-4 md:p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xs">
        
        {/* Left info: Location name, date & calculation authority */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
            <h2 className="text-xl font-bold font-serif text-[#2D4F1E] flex items-center gap-2">
              <span>مواقيت الصلاة في {cityName}</span>
              <span className="text-xs font-normal text-gray-500 font-sans">({countryName})</span>
            </h2>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 font-serif">
            <span className="flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-[#2D4F1E]" />
              <span>الهيئة / الجمعية المعتمدة:</span>
              <strong className="text-gray-800 font-bold">{activeSource.shortName}</strong>
            </span>
            <span>•</span>
            {currentDayData && (
              <span>
                {currentDayData.date.hijri.day} {currentDayData.date.hijri.month.ar} {currentDayData.date.hijri.year} هـ
                ({currentDayData.date.gregorian.date} م)
              </span>
            )}
          </div>
        </div>

        {/* Right Action buttons: Change/Add Location & Download Sheet */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          
          {/* 12h / 24h Toggle */}
          <button
            type="button"
            onClick={() => setIs12Hour(!is12Hour)}
            className="px-2.5 py-1.5 border border-[#E5E2D9] bg-[#FDFBF7] hover:bg-gray-100 text-[11px] font-serif font-bold text-gray-700 transition-all cursor-pointer"
            title="تبديل صيغة الوقت (12 ساعة / 24 ساعة)"
          >
            {is12Hour ? 'نظام 12 ساعة' : 'نظام 24 ساعة'}
          </button>

          {/* Download Sheet Menu Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowDownloadMenu(!showDownloadMenu)}
              className="px-3 py-1.5 bg-[#2D4F1E]/10 hover:bg-[#2D4F1E]/20 text-[#2D4F1E] border border-[#2D4F1E]/30 text-xs font-bold font-serif flex items-center gap-1.5 transition-all cursor-pointer"
              id="download-sheet-btn"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تنزيل الجدول / الإمساكية</span>
            </button>

            {showDownloadMenu && (
              <div className="absolute left-0 sm:right-0 mt-1 w-56 bg-white border border-[#E5E2D9] shadow-lg z-50 py-1 text-right animate-fade-in font-serif">
                <button
                  type="button"
                  onClick={() => handleDownloadSheet('print')}
                  className="w-full px-3 py-2 text-xs text-gray-700 hover:bg-[#FDFBF7] flex items-center gap-2 text-right cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-[#2D4F1E]" />
                  <span>طباعة / حفظ الإمساكية كـ PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadSheet('csv')}
                  className="w-full px-3 py-2 text-xs text-gray-700 hover:bg-[#FDFBF7] flex items-center gap-2 text-right cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>تنزيل كجدول إكسل (ملف CSV)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDownloadSheet('json')}
                  className="w-full px-3 py-2 text-xs text-gray-700 hover:bg-[#FDFBF7] flex items-center gap-2 text-right cursor-pointer"
                >
                  <Globe className="w-4 h-4 text-blue-600" />
                  <span>تنزيل بيانات الأوقات (JSON)</span>
                </button>
              </div>
            )}
          </div>

          {/* TOP RIGHT: Change / Add Location Button */}
          <button
            type="button"
            onClick={() => {
              setStagedLocation(null);
              setSearchResults([]);
              setSearchQuery('');
              setAssociationSearchQuery('');
              setIsLocationModalOpen(true);
            }}
            className="px-3 py-1.5 bg-[#2D4F1E] hover:bg-[#233f17] text-white text-xs font-bold font-serif flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            id="change-location-btn"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>تغيير / إضافة موقع</span>
          </button>

        </div>

      </div>

      {/* 2. Loading and Error States */}
      {isLoading && (
        <div className="bg-white border border-[#E5E2D9] p-8 text-center space-y-2">
          <RefreshCw className="w-6 h-6 animate-spin text-[#2D4F1E] mx-auto" />
          <p className="text-xs font-bold font-serif text-[#2D4F1E]">جاري استرجاع مواقيت الصلاة وفق حساب {activeSource.shortName}...</p>
        </div>
      )}

      {fetchError && (
        <div className="bg-rose-50 border border-rose-200 p-4 text-rose-800 text-xs font-serif flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{fetchError}</span>
          </div>
          <button
            type="button"
            onClick={() => currentLocation && fetchPrayerTimes(currentLocation, selectedYear, selectedMonth)}
            className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer"
          >
            إعادة المحاولة
          </button>
        </div>
      )}

      {/* 3. Main Timings Display */}
      {!isLoading && currentDayData && (
        <div className="space-y-4">
          
          {/* Active Next Prayer Countdown Banner */}
          {nextPrayerInfo && (
            <div className="bg-linear-to-r from-[#2D4F1E] to-[#1e3614] text-white p-4 border border-[#2D4F1E] flex flex-col sm:flex-row justify-between items-center gap-3 shadow-xs">
              <div className="flex items-center gap-3 text-center sm:text-right">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                  <Clock className="w-5 h-5 text-amber-300 animate-pulse" />
                </div>
                <div>
                  <div className="text-xs opacity-80 font-serif">الصلاة القادمة بإذن الله:</div>
                  <div className="text-lg font-bold font-serif text-amber-300">
                    صلاة {nextPrayerInfo.prayer} ({nextPrayerInfo.time})
                  </div>
                </div>
              </div>

              {nextPrayerInfo.isNext && (
                <div className="bg-white/10 px-4 py-2 border border-white/20 text-center">
                  <div className="text-[10px] uppercase tracking-wider opacity-80 font-sans">الوقت المتبقي للأذان</div>
                  <div className="text-base font-black font-serif text-white tracking-widest" dir="ltr">
                    {String(nextPrayerInfo.hoursLeft).padStart(2, '0')}:
                    {String(nextPrayerInfo.minsLeft).padStart(2, '0')}:
                    {String(nextPrayerInfo.secsLeft).padStart(2, '0')}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* View Mode Toggle: Today's Cards vs Full Month Table */}
          <div className="flex justify-between items-center border-b border-[#E5E2D9] pb-2">
            <div className="flex gap-2 font-serif text-xs">
              <button
                type="button"
                onClick={() => setViewMode('today')}
                className={`px-3 py-1.5 font-bold transition-all cursor-pointer border ${
                  viewMode === 'today'
                    ? 'bg-[#2D4F1E] text-white border-[#2D4F1E]'
                    : 'bg-white text-gray-700 border-[#E5E2D9] hover:bg-gray-50'
                }`}
              >
                مواقيت اليوم بالتفصيل
              </button>
              
              <button
                type="button"
                onClick={() => setViewMode('month')}
                className={`px-3 py-1.5 font-bold transition-all cursor-pointer border ${
                  viewMode === 'month'
                    ? 'bg-[#2D4F1E] text-white border-[#2D4F1E]'
                    : 'bg-white text-gray-700 border-[#E5E2D9] hover:bg-gray-50'
                }`}
              >
                جدول الشهر كاملاً (الإمساكية)
              </button>
            </div>

            {/* Month & Year Navigator */}
            <div className="flex items-center gap-1 font-serif text-xs">
              <button
                type="button"
                onClick={() => handleNavigateMonth(-1)}
                className="p-1.5 border border-[#E5E2D9] bg-white hover:bg-gray-100 cursor-pointer"
                title="الشهر السابق"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <span className="px-2 font-bold text-gray-800">
                {selectedMonth} / {selectedYear}
              </span>
              <button
                type="button"
                onClick={() => handleNavigateMonth(1)}
                className="p-1.5 border border-[#E5E2D9] bg-white hover:bg-gray-100 cursor-pointer"
                title="الشهر القادم"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* VIEW 1: TODAY'S DETAILED PRAYER CARDS */}
          {viewMode === 'today' && (
            <div className="space-y-4">
              
              {/* Day Selector Ribbon within the month */}
              <div className="flex items-center gap-1 overflow-x-auto pb-2 border-b border-[#E5E2D9]">
                {monthData.map((day, idx) => {
                  const isSelected = idx === selectedDayIndex;
                  const isToday = new Date().getDate() === parseInt(day.date.gregorian.day, 10) && 
                                  (new Date().getMonth() + 1) === selectedMonth && 
                                  new Date().getFullYear() === selectedYear;

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedDayIndex(idx)}
                      className={`px-3 py-1.5 shrink-0 text-center font-serif text-xs border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#2D4F1E] text-white border-[#2D4F1E] font-bold shadow-xs'
                          : isToday
                          ? 'bg-amber-50 text-amber-900 border-amber-300 font-bold'
                          : 'bg-white text-gray-700 border-[#E5E2D9] hover:bg-gray-50'
                      }`}
                    >
                      <div className="text-[10px] opacity-80">{day.date.hijri.weekday.ar || day.date.gregorian.weekday.en}</div>
                      <div className="text-xs font-bold">{day.date.hijri.day} {day.date.hijri.month.ar}</div>
                    </button>
                  );
                })}
              </div>

              {/* Five Obligatory Prayers Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                
                {/* 1. Fajr */}
                <div className={`p-4 bg-white border text-center transition-all ${
                  nextPrayerInfo?.key === 'Fajr' ? 'border-[#2D4F1E] ring-2 ring-[#2D4F1E]/20 bg-[#2D4F1E]/5' : 'border-[#E5E2D9]'
                }`}>
                  <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500 font-serif mb-1">
                    <Sunrise className="w-4 h-4 text-emerald-700" />
                    <span>صلاة الفجر</span>
                  </div>
                  <div className="text-2xl font-black font-serif text-[#2D4F1E] my-1">
                    {formatTime(currentDayData.timings.Fajr)}
                  </div>
                  <div className="text-[10px] text-gray-400 font-sans">الأذان الأول: {formatTime(currentDayData.timings.Imsak)}</div>
                </div>

                {/* 2. Dhuhr */}
                <div className={`p-4 bg-white border text-center transition-all ${
                  nextPrayerInfo?.key === 'Dhuhr' ? 'border-[#2D4F1E] ring-2 ring-[#2D4F1E]/20 bg-[#2D4F1E]/5' : 'border-[#E5E2D9]'
                }`}>
                  <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500 font-serif mb-1">
                    <Sun className="w-4 h-4 text-amber-500" />
                    <span>صلاة الظهر</span>
                  </div>
                  <div className="text-2xl font-black font-serif text-[#2D4F1E] my-1">
                    {formatTime(currentDayData.timings.Dhuhr)}
                  </div>
                  <div className="text-[10px] text-gray-400 font-sans">زوال الشمس</div>
                </div>

                {/* 3. Asr */}
                <div className={`p-4 bg-white border text-center transition-all ${
                  nextPrayerInfo?.key === 'Asr' ? 'border-[#2D4F1E] ring-2 ring-[#2D4F1E]/20 bg-[#2D4F1E]/5' : 'border-[#E5E2D9]'
                }`}>
                  <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500 font-serif mb-1">
                    <Sun className="w-4 h-4 text-orange-500" />
                    <span>صلاة العصر</span>
                  </div>
                  <div className="text-2xl font-black font-serif text-[#2D4F1E] my-1">
                    {formatTime(currentDayData.timings.Asr)}
                  </div>
                  <div className="text-[10px] text-gray-400 font-sans">ظل الشيء مثليه/مثله</div>
                </div>

                {/* 4. Maghrib */}
                <div className={`p-4 bg-white border text-center transition-all ${
                  nextPrayerInfo?.key === 'Maghrib' ? 'border-[#2D4F1E] ring-2 ring-[#2D4F1E]/20 bg-[#2D4F1E]/5' : 'border-[#E5E2D9]'
                }`}>
                  <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500 font-serif mb-1">
                    <Sunset className="w-4 h-4 text-rose-600" />
                    <span>صلاة المغرب</span>
                  </div>
                  <div className="text-2xl font-black font-serif text-[#2D4F1E] my-1">
                    {formatTime(currentDayData.timings.Maghrib)}
                  </div>
                  <div className="text-[10px] text-gray-400 font-sans">وقت الإفطار</div>
                </div>

                {/* 5. Isha */}
                <div className={`p-4 bg-white border text-center transition-all ${
                  nextPrayerInfo?.key === 'Isha' ? 'border-[#2D4F1E] ring-2 ring-[#2D4F1E]/20 bg-[#2D4F1E]/5' : 'border-[#E5E2D9]'
                }`}>
                  <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500 font-serif mb-1">
                    <Moon className="w-4 h-4 text-indigo-700" />
                    <span>صلاة العشاء</span>
                  </div>
                  <div className="text-2xl font-black font-serif text-[#2D4F1E] my-1">
                    {formatTime(currentDayData.timings.Isha)}
                  </div>
                  <div className="text-[10px] text-gray-400 font-sans">مغيب الشفق الأحمر</div>
                </div>

              </div>

              {/* Extra Astronomical Timings: Sunrise, Midnight, Last Third */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                <div className="p-2.5 bg-[#FDFBF7] border border-[#E5E2D9] text-center">
                  <div className="text-[11px] text-gray-500 font-serif">شروق الشمس</div>
                  <div className="text-sm font-bold text-[#1A1A1A] font-serif">{formatTime(currentDayData.timings.Sunrise)}</div>
                </div>

                <div className="p-2.5 bg-[#FDFBF7] border border-[#E5E2D9] text-center">
                  <div className="text-[11px] text-gray-500 font-serif">الإمساك</div>
                  <div className="text-sm font-bold text-[#1A1A1A] font-serif">{formatTime(currentDayData.timings.Imsak)}</div>
                </div>

                <div className="p-2.5 bg-[#FDFBF7] border border-[#E5E2D9] text-center">
                  <div className="text-[11px] text-gray-500 font-serif">منتصف الليل الشرعي</div>
                  <div className="text-sm font-bold text-[#1A1A1A] font-serif">{formatTime(currentDayData.timings.Midnight)}</div>
                </div>

                <div className="p-2.5 bg-[#FDFBF7] border border-[#E5E2D9] text-center">
                  <div className="text-[11px] text-gray-500 font-serif">الثلث الأخير (قيام الليل)</div>
                  <div className="text-sm font-bold text-[#1A1A1A] font-serif">
                    {currentDayData.timings.Lastthird ? formatTime(currentDayData.timings.Lastthird) : '—'}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* VIEW 2: FULL MONTHLY SCHEDULE / الإمساكية TABLE */}
          {viewMode === 'month' && (
            <div className="bg-white border border-[#E5E2D9] shadow-xs overflow-hidden">
              <div className="p-3 bg-[#FDFBF7] border-b border-[#E5E2D9] flex justify-between items-center">
                <div className="font-bold font-serif text-xs text-[#2D4F1E]">
                  إمساكية وجدول مواقيت الصلاة لشهر {selectedMonth} / {selectedYear}
                </div>
                <button
                  type="button"
                  onClick={() => handleDownloadSheet('print')}
                  className="px-2.5 py-1 bg-[#2D4F1E] text-white text-[11px] font-bold font-serif flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>طباعة الإمساكية</span>
                </button>
              </div>

              <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                <table className="w-full text-right border-collapse text-xs font-serif">
                  <thead className="bg-[#2D4F1E] text-white sticky top-0 z-10">
                    <tr>
                      <th className="p-2.5 border-b border-[#2D4F1E] text-center">اليوم الهجري</th>
                      <th className="p-2.5 border-b border-[#2D4F1E] text-center">الميلادي</th>
                      <th className="p-2.5 border-b border-[#2D4F1E] text-center">الفجر</th>
                      <th className="p-2.5 border-b border-[#2D4F1E] text-center">الشروق</th>
                      <th className="p-2.5 border-b border-[#2D4F1E] text-center">الظهر</th>
                      <th className="p-2.5 border-b border-[#2D4F1E] text-center">العصر</th>
                      <th className="p-2.5 border-b border-[#2D4F1E] text-center">المغرب</th>
                      <th className="p-2.5 border-b border-[#2D4F1E] text-center">العشاء</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthData.map((d, i) => {
                      const isToday = new Date().getDate() === parseInt(d.date.gregorian.day, 10) && 
                                      (new Date().getMonth() + 1) === selectedMonth && 
                                      new Date().getFullYear() === selectedYear;

                      return (
                        <tr 
                          key={i} 
                          className={`border-b border-[#E5E2D9] transition-all ${
                            isToday ? 'bg-amber-100/60 font-bold' : i % 2 === 0 ? 'bg-white' : 'bg-[#FDFBF7]'
                          } hover:bg-[#2D4F1E]/5`}
                        >
                          <td className="p-2.5 text-center font-bold">
                            {d.date.hijri.day} {d.date.hijri.weekday.ar || ''}
                            {isToday && <span className="mr-1 text-[10px] text-[#2D4F1E]">(اليوم)</span>}
                          </td>
                          <td className="p-2.5 text-center text-gray-600 font-sans text-[11px]">{d.date.gregorian.date}</td>
                          <td className="p-2.5 text-center font-bold text-[#2D4F1E]">{formatTime(d.timings.Fajr)}</td>
                          <td className="p-2.5 text-center text-gray-500">{formatTime(d.timings.Sunrise)}</td>
                          <td className="p-2.5 text-center font-bold text-[#2D4F1E]">{formatTime(d.timings.Dhuhr)}</td>
                          <td className="p-2.5 text-center font-bold text-[#2D4F1E]">{formatTime(d.timings.Asr)}</td>
                          <td className="p-2.5 text-center font-bold text-[#2D4F1E]">{formatTime(d.timings.Maghrib)}</td>
                          <td className="p-2.5 text-center font-bold text-[#2D4F1E]">{formatTime(d.timings.Isha)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}

      {/* 4. CHANGE / ADD LOCATION MODAL */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4" dir="rtl">
          <div className="bg-white border border-[#E5E2D9] max-w-xl w-full p-6 text-right space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-center border-b border-[#E5E2D9] pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#2D4F1E]" />
                <h3 className="text-base font-bold font-serif text-[#2D4F1E]">
                  تغيير أو إضافة موقع جديد
                </h3>
              </div>
              <button 
                type="button"
                onClick={() => {
                  setIsLocationModalOpen(false);
                  setStagedLocation(null);
                  setAssociationSearchQuery('');
                }}
                className="p-1 text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Saved Locations List */}
            {savedLocations.length > 0 && !stagedLocation && (
              <div className="space-y-2">
                <label className="block text-[11px] font-bold font-serif text-gray-700">مواقعك المحفوظة مؤخراً:</label>
                <div className="flex flex-wrap gap-2">
                  {savedLocations.map((loc, i) => {
                    const isCur = currentLocation?.city.toLowerCase() === loc.city.toLowerCase() && 
                                  currentLocation?.country.toLowerCase() === loc.country.toLowerCase();
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setCurrentLocation(loc);
                          setIsLocationModalOpen(false);
                        }}
                        className={`px-3 py-1.5 text-xs font-serif border flex items-center gap-1.5 transition-all cursor-pointer ${
                          isCur
                            ? 'bg-[#2D4F1E] text-white border-[#2D4F1E] font-bold'
                            : 'bg-[#FDFBF7] text-gray-800 border-[#E5E2D9] hover:border-[#2D4F1E]'
                        }`}
                      >
                        <MapPin className="w-3 h-3" />
                        <span>{loc.arabicCity || loc.city} ({loc.arabicCountry || loc.country})</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Render the clean search + association selection flow */}
            {renderLocationSetupFlow()}

          </div>
        </div>
      )}

    </div>
  );
}
