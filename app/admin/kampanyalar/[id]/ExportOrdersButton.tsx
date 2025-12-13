'use client';

import { useState } from 'react';

interface ExportOrdersButtonProps {
  campaignId: string;
  campaignName: string;
}

export default function ExportOrdersButton({
  campaignId,
  campaignName,
}: ExportOrdersButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleExport = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/admin/campaigns/${campaignId}/export-orders`);

      if (!response.ok) {
        throw new Error('CSV oluşturulurken hata oluştu');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${campaignName.replace(/[^a-zA-Z0-9]/g, '_')}_siparisler.csv`;
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
      className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition disabled:opacity-50"
    >
      {isLoading ? 'İndiriliyor...' : 'CSV Olarak Dışa Aktar'}
    </button>
  );
}
