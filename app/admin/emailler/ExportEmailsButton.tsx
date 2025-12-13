'use client';

import { useState } from 'react';

export default function ExportEmailsButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleExport = async () => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/email-subscriptions/export');

      if (!response.ok) {
        throw new Error('CSV oluşturulurken hata oluştu');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `email_aboneleri_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      alert('CSV dışa aktarılırken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isLoading}
      className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 font-semibold"
    >
      {isLoading ? 'İndiriliyor...' : 'CSV Olarak Dışa Aktar'}
    </button>
  );
}
