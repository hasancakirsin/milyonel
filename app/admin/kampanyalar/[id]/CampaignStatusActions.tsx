'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface CampaignStatusActionsProps {
  campaignId: string;
  currentStatus: string;
  participationCount: number;
  minParticipants: number;
  orderCount: number;
}

export default function CampaignStatusActions({
  campaignId,
  currentStatus,
  participationCount,
  minParticipants,
  orderCount,
}: CampaignStatusActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStatusChange = async (newStatus: string) => {
    if (
      !confirm(
        `Kampanya durumunu "${getStatusText(newStatus)}" olarak değiştirmek istediğinizden emin misiniz?`
      )
    ) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/campaigns/${campaignId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Durum değiştirilirken hata oluştu');
      }

      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      DRAFT: 'Taslak',
      COLLECTING_USERS: 'Katılımcı Toplanıyor',
      COLLECTING_PAYMENTS: 'Ödeme Aşamasında',
      SUCCESSFUL: 'Başarılı',
      FAILED: 'Başarısız',
    };
    return statusMap[status] || status;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <h2 className="text-xl font-bold mb-4">Durum Yönetimi</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-red-800 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {/* DRAFT -> COLLECTING_USERS */}
        {currentStatus === 'DRAFT' && (
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Kampanyayı Başlat</p>
              <p className="text-sm text-gray-600 mt-1">
                Kampanya yayına alınacak ve kullanıcılar katılım yapabilecek
              </p>
            </div>
            <button
              onClick={() => handleStatusChange('COLLECTING_USERS')}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              Yayına Al
            </button>
          </div>
        )}

        {/* COLLECTING_USERS -> COLLECTING_PAYMENTS */}
        {currentStatus === 'COLLECTING_USERS' && (
          <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Ödeme Aşamasına Geçir</p>
              <p className="text-sm text-gray-600 mt-1">
                Katılımcılar: {participationCount} / {minParticipants}
                {participationCount < minParticipants && (
                  <span className="text-orange-600 ml-2">
                    (Minimum katılımcı sayısına ulaşılmadı!)
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={() => handleStatusChange('COLLECTING_PAYMENTS')}
              disabled={isLoading}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition disabled:opacity-50"
            >
              Ödeme Aşamasına Geçir
            </button>
          </div>
        )}

        {/* COLLECTING_PAYMENTS -> SUCCESSFUL or FAILED */}
        {currentStatus === 'COLLECTING_PAYMENTS' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Kampanyayı Başarılı Olarak İşaretle</p>
                <p className="text-sm text-gray-600 mt-1">
                  Ödeme yapan: {orderCount} / {participationCount} katılımcı
                </p>
              </div>
              <button
                onClick={() => handleStatusChange('SUCCESSFUL')}
                disabled={isLoading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
              >
                Başarılı
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Kampanyayı Başarısız Olarak İşaretle</p>
                <p className="text-sm text-gray-600 mt-1">
                  Kampanya yeterli ödemeye ulaşamadı
                </p>
              </div>
              <button
                onClick={() => handleStatusChange('FAILED')}
                disabled={isLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
              >
                Başarısız
              </button>
            </div>
          </div>
        )}

        {/* SUCCESSFUL or FAILED - No actions */}
        {(currentStatus === 'SUCCESSFUL' || currentStatus === 'FAILED') && (
          <div className="p-4 bg-gray-50 rounded-lg text-center text-gray-600">
            Bu kampanya tamamlandı. Durum değişikliği yapılamaz.
          </div>
        )}
      </div>
    </div>
  );
}
