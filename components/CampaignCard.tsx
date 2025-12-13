import Link from 'next/link';
import Image from 'next/image';
import ProgressBar from './ProgressBar';
import CountdownTimer from './CountdownTimer';

interface CampaignCardProps {
  campaign: {
    id: string;
    slug: string;
    product: {
      name: string;
      brand: string;
      imageUrl: string;
    };
    normalPrice: string;
    groupPrice: string;
    currency: string;
    minParticipants: number;
    currentParticipants: number;
    endAt: string;
    status: string;
  };
}

export default function CampaignCard({ campaign }: CampaignCardProps) {
  const discount = Math.round(
    ((parseFloat(campaign.normalPrice) - parseFloat(campaign.groupPrice)) /
      parseFloat(campaign.normalPrice)) *
      100
  );

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { text: string; className: string }> = {
      COLLECTING_USERS: { text: 'Katılımcı Toplanıyor', className: 'bg-blue-100 text-blue-800' },
      COLLECTING_PAYMENTS: { text: 'Ödeme Aşamasında', className: 'bg-yellow-100 text-yellow-800' },
      SUCCESSFUL: { text: 'Tamamlandı', className: 'bg-green-100 text-green-800' },
      FAILED: { text: 'Başarısız', className: 'bg-red-100 text-red-800' },
      DRAFT: { text: 'Taslak', className: 'bg-gray-100 text-gray-800' },
    };

    const badge = badges[status] || badges.DRAFT;

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.className}`}>
        {badge.text}
      </span>
    );
  };

  return (
    <Link href={`/kampanyalar/${campaign.slug}`}>
      <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
        {/* Image */}
        <div className="relative h-48 bg-gray-200">
          <Image
            src={campaign.product.imageUrl}
            alt={campaign.product.name}
            fill
            className="object-cover"
          />
          <div className="absolute top-3 right-3">
            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
              %{discount} İndirim
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Brand & Status */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">{campaign.product.brand}</span>
            {getStatusBadge(campaign.status)}
          </div>

          {/* Product Name */}
          <h3 className="font-semibold text-lg mb-3 line-clamp-2">
            {campaign.product.name}
          </h3>

          {/* Prices */}
          <div className="mb-4">
            <div className="flex items-center gap-3">
              <span className="text-gray-400 line-through text-sm">
                {parseFloat(campaign.normalPrice).toLocaleString('tr-TR')} {campaign.currency}
              </span>
              <span className="text-2xl font-bold text-primary-600">
                {parseFloat(campaign.groupPrice).toLocaleString('tr-TR')} {campaign.currency}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <ProgressBar
              current={campaign.currentParticipants}
              target={campaign.minParticipants}
            />
          </div>

          {/* Countdown */}
          {campaign.status === 'COLLECTING_USERS' && (
            <div className="flex items-center justify-center border-t pt-3">
              <CountdownTimer targetDate={campaign.endAt} />
            </div>
          )}

          {/* CTA Button */}
          <button className="w-full mt-4 bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition">
            Detayları Gör
          </button>
        </div>
      </div>
    </Link>
  );
}
