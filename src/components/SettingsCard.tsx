/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import { DailyLog } from '../types';
import { Download, Upload, Trash2, Heart, RefreshCw, AlertTriangle } from 'lucide-react';

interface SettingsCardProps {
  onClearAll: () => void;
  onImportLogs: (imported: Record<string, DailyLog>) => void;
  logs: Record<string, DailyLog>;
}

export default function SettingsCard({
  onClearAll,
  onImportLogs,
  logs
}: SettingsCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);

  // Export current tracking logs as JSON file
  const handleExport = () => {
    try {
      const dataStr = JSON.stringify(logs, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `salaat_tracker_backup_${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      setSuccessMsg('تم تصدير نسخ الاحتياطي بنجاح!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (e) {
      setErrorMsg('فشل تصدير البيانات احتياطياً.');
      setTimeout(() => setErrorMsg(''), 4000);
    }
  };

  // Trigger file selection for import
  const triggerImportFile = () => {
    fileInputRef.current?.click();
  };

  // Import JSON file and validation checks
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        
        // Basic structural checklist
        if (typeof parsed !== 'object' || parsed === null) {
          throw new Error('صيغة ملف غير صحيحة');
        }

        // Check if there are keys containing logs
        const keys = Object.keys(parsed);
        if (keys.length > 0) {
          const sampleKey = keys[0];
          if (!parsed[sampleKey].prayers || !parsed[sampleKey].date) {
            throw new Error('بنية البيانات المرفوعة لا تتناسب مع التطبيق');
          }
        }

        onImportLogs(parsed as Record<string, DailyLog>);
        setSuccessMsg('تم استيراد النسخة الاحتياطية وتحديث السجلات بنجاح!');
        setTimeout(() => setSuccessMsg(''), 5000);
      } catch (err) {
        setErrorMsg('فشل الاستشعار أو استيراد الملف. تأكد من صحة الملف وصيغة الـ JSON.');
        setTimeout(() => setErrorMsg(''), 5000);
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    onClearAll();
    setConfirmReset(false);
    setSuccessMsg('تم حذف جميع سجلات تتبع الصلاة بنجاح وإعداد قائمة جديدة.');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <div className="bg-white rounded-none border border-[#E5E2D9] p-5 shadow-sm space-y-5 text-[#1A1A1A]">
      <h3 className="text-sm font-bold text-center sm:text-right text-[#2D4F1E] flex flex-row-reverse items-center gap-1.5 justify-center sm:justify-start font-serif">
        <Heart className="w-4 h-4 text-[#2D4F1E]" />
        إعدادات ونسخ احتياطي للبيانات
      </h3>

      <div className="space-y-4">
        <p className="text-xs text-gray-500 leading-relaxed text-center sm:text-right font-sans">
          يتم تخزين جميع بيانات الصلاة والسنن والقرآن الخاصة بك محلياً وبشكل خاص بالكامل داخل المتصفح. يمكنك في أي وقت تصدير نسخة احتياطية لحفظها على جهازك أو استيرادها لاحقاً.
        </p>

        {/* Action feedback notifications */}
        {successMsg && (
          <div className="p-3 bg-[#2D4F1E]/5 text-[#2D4F1E] text-xs font-bold text-center border border-[#2D4F1E]/20">
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="p-3 bg-rose-50 text-rose-800 text-xs font-bold text-center border border-rose-200">
            {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2">
          {/* File input for import */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImport}
            accept=".json"
            className="hidden"
          />
          
          {/* Export Button */}
          <button
            onClick={handleExport}
            id="export-backup-btn"
            className="p-3 rounded-none border border-[#E5E2D9] bg-white hover:bg-[#FDFBF7] text-[#2D4F1E] hover:border-[#2D4F1E] font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
          >
            <Download className="w-4 h-4 text-[#2D4F1E]" />
            <span>تصدير نسخة احتياطية (.json)</span>
          </button>

          {/* Import Button */}
          <button
            onClick={triggerImportFile}
            id="import-backup-btn"
            className="p-3 rounded-none border border-[#E5E2D9] bg-white hover:bg-[#FDFBF7] text-gray-700 hover:border-gray-500 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer id-action active:scale-95"
          >
            <Upload className="w-4 h-4 text-gray-500" />
            <span>استيراد واستعادة السجلات</span>
          </button>
        </div>

        {/* Reset System Button */}
        <div className="pt-4 border-t border-[#E5E2D9] flex flex-col sm:flex-row-reverse sm:items-center sm:justify-between gap-3">
          <div className="text-right">
            <p className="text-xs font-bold text-gray-800 font-serif">حذف البيانات / إعادة التصفير</p>
            <p className="text-[10px] text-gray-400 mt-1 font-sans">سيؤدي هذا إلى تصفير كافة السجلات الحالية نهائياً</p>
          </div>
          
          <button
            onClick={handleReset}
            id="reset-data-btn"
            className={`p-2.5 rounded-none text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-92 ${
              confirmReset 
                ? 'bg-rose-600 text-white border-rose-600 shadow-sm animate-bounce'
                : 'bg-rose-50 border border-rose-200 hover:bg-rose-100/50 text-rose-700'
            }`}
          >
            {confirmReset ? <AlertTriangle className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
            <span>{confirmReset ? 'نعم، كبّر واحذف نهائياً' : 'تصفير كافة السجلات'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
