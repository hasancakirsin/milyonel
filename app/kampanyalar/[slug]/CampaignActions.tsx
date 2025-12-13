'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface CampaignActionsProps {
  campaign: {
    id: string;
    slug: string;
    status: string;
  };
  session: {
    userId: string;
    email: string;
    name: string;
    role: string;
  } | null;
  hasParticipated: boolean;
  hasPaid: boolean;
}

export default function CampaignActions({
  campaign,
  session,
  hasParticipated,
  hasPaid,
}: CampaignActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleJoinCampaign = async () => {
    if (!session) {
      router.push(`/giris?redirect=/kampanyalar/${campaign.slug}`);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/campaigns/${campaign.id}/join`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Katılım sırasında bir hata oluştu');
      }

      setSuccess('Kampanyaya başarıyla katıldınız!');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!session) {
      router.push(`/giris?redirect=/kampanyalar/${campaign.slug}`);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/campaigns/${campaign.id}/pay`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ödeme sırasında bir hata oluştu');
      }

      // In production, redirect to payment gateway
      // For now, just show success and refresh
      setSuccess('Ödeme işlemi başlatıldı!');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Show login prompt if not logged in
  if (!session) {
    return (
      <div className="space-y-3">
        <button
          onClick={() => router.push(`/giris?redirect=/kampanyalar/${campaign.slug}`)}
          className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50"
        >
          Giriş Yapın
        </button>
        <p className="text-sm text-center text-gray-600">
          Kampanyaya katılmak için giriş yapmanız gerekmektedir
        </p>
      </div>
    );
  }

  // Campaign is still collecting users
  if (campaign.status === 'COLLECTING_USERS') {
    if (hasParticipated) {
      return (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-center text-green-800">
            <svg
              className="w-5 h-5 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-medium">Kampanyaya katıldınız! ✓</span>
          </div>
          <p className="text-sm text-green-700 text-center mt-2">
            Hedef kişi sayısına ulaşıldığında bilgilendirilecesiniz
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-800 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-green-800 text-sm">
            {success}
          </div>
        )}
        <button
          onClick={handleJoinCampaign}
          disabled={isLoading}
          className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50"
        >
          {isLoading ? 'İşleniyor...' : 'Bu Fiyattan Katıl (Ön Kayıt)'}
        </button>
        <p className="text-xs text-center text-gray-500">
          Ön kayıt ücretsizdir. Hedef kişi sayısına ulaşıldığında ödeme yapabilirsiniz.
        </p>
      </div>
    );
  }

  // Campaign is collecting payments
  if (campaign.status === 'COLLECTING_PAYMENTS') {
    if (!hasParticipated) {
      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800 text-center">
            Bu kampanya ödeme aşamasında. Yeni katılımcı kabul edilmiyor.
          </p>
        </div>
      );
    }

    if (hasPaid) {
      return (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-center text-green-800">
            <svg
              className="w-5 h-5 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-medium">Ödemeniz alındı ✓</span>
          </div>
          <p className="text-sm text-green-700 text-center mt-2">
            Siparişiniz satıcıya iletildi. Teslimat bilgileri e-posta ile gönderilecektir.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-800 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-green-800 text-sm">
            {success}
          </div>
        )}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
          <p className="text-sm text-yellow-800 text-center font-medium">
            ⏰ Kampanya hedefine ulaştı! Ödeme yapma zamanı.
          </p>
        </div>
        <button
          onClick={handlePayment}
          disabled={isLoading}
          className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
        >
          {isLoading ? 'İşleniyor...' : 'Ödemeyi Tamamla'}
        </button>
        <p className="text-xs text-center text-gray-500">
          Ödeme süreniz dolmadan işlemi tamamlayınız
        </p>
      </div>
    );
  }

  // Campaign is successful
  if (campaign.status === 'SUCCESSFUL') {
    if (hasPaid) {
      return (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-center text-green-800">
            <svg
              className="w-5 h-5 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-medium">Kampanya başarıyla tamamlandı! ✓</span>
          </div>
          <p className="text-sm text-green-700 text-center mt-2">
            Siparişiniz işleme alındı
          </p>
        </div>
      );
    }

    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-sm text-gray-600 text-center">
          Bu kampanya tamamlandı
        </p>
      </div>
    );
  }

  // Campaign failed
  if (campaign.status === 'FAILED') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-sm text-red-800 text-center">
          Bu kampanya yeterli katılımcıya ulaşamadı
        </p>
      </div>
    );
  }

  // Draft or unknown status
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <p className="text-sm text-gray-600 text-center">
        Bu kampanya henüz aktif değil
      </p>
    </div>
  );
}
