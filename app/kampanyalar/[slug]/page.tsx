import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import CountdownTimer from '@/components/CountdownTimer';
import ProgressBar from '@/components/ProgressBar';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import CampaignActions from './CampaignActions';

async function getCampaign(slug: string) {
  const campaign = await prisma.campaign.findUnique({
    where: { slug },
    include: {
      product: true,
      _count: {
        select: {
          participations: true,
          orders: true,
        },
      },
    },
  });

  return campaign;
}

async function getUserParticipation(campaignId: string, userId?: string) {
  if (!userId) return null;

  const participation = await prisma.campaignParticipation.findUnique({
    where: {
      campaignId_userId: {
        campaignId,
        userId,
      },
    },
  });

  return participation;
}

async function getUserOrder(campaignId: string, userId?: string) {
  if (!userId) return null;

  const order = await prisma.order.findFirst({
    where: {
      campaignId,
      userId,
    },
  });

  return order;
}

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const campaign = await getCampaign(slug);

  if (!campaign) {
    notFound();
  }

  const session = await getSession();
  const participation = await getUserParticipation(campaign.id, session?.userId);
  const order = await getUserOrder(campaign.id, session?.userId);

  const discount = Math.round(
    ((Number(campaign.normalPrice) - Number(campaign.groupPrice)) /
      Number(campaign.normalPrice)) *
      100
  );

  const getStatusInfo = (status: string) => {
    const statuses: Record<string, { text: string; color: string; description: string }> = {
      COLLECTING_USERS: {
        text: 'Katılımcı Toplanıyor',
        color: 'bg-blue-100 text-blue-800',
        description: 'Bu kampanya için hala katılımcı toplanıyor. Hemen katıl!',
      },
      COLLECTING_PAYMENTS: {
        text: 'Ödeme Aşamasında',
        color: 'bg-yellow-100 text-yellow-800',
        description: 'Hedef kişi sayısına ulaşıldı! Katılanlar ödeme yapabilir.',
      },
      SUCCESSFUL: {
        text: 'Başarıyla Tamamlandı',
        color: 'bg-green-100 text-green-800',
        description: 'Bu kampanya başarıyla tamamlandı. Siparişler satıcıya iletildi.',
      },
      FAILED: {
        text: 'Başarısız',
        color: 'bg-red-100 text-red-800',
        description: 'Bu kampanya yeterli katılımcıya ulaşamadı.',
      },
    };

    return statuses[status] || statuses.COLLECTING_USERS;
  };

  const statusInfo = getStatusInfo(campaign.status);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Product Image */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
              <div className="relative h-96 bg-gray-200">
                <img
                  src={campaign.product.imageUrl}
                  alt={campaign.product.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4">
                  <span className="bg-red-500 text-white px-4 py-2 rounded-full text-lg font-bold">
                    %{discount} İndirim
                  </span>
                </div>
              </div>
            </div>

            {/* Product Details */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h2 className="text-2xl font-bold mb-4">Ürün Detayları</h2>
              <div className="prose max-w-none">
                <p className="text-gray-600 whitespace-pre-line">
                  {campaign.product.description}
                </p>

                {campaign.product.specs && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-3">Teknik Özellikler</h3>
                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {Object.entries(campaign.product.specs as Record<string, any>).map(
                        ([key, value]) => (
                          <div key={key} className="flex flex-col">
                            <dt className="text-sm text-gray-500">{key}</dt>
                            <dd className="text-sm font-medium">{String(value)}</dd>
                          </div>
                        )
                      )}
                    </dl>
                  </div>
                )}
              </div>
            </div>

            {/* Campaign Rules */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-2xl font-bold mb-4">Kampanya Şartları</h2>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">•</span>
                  <span>Minimum {campaign.minParticipants} kişi katılımı gereklidir</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">•</span>
                  <span>
                    Kampanya bitiş tarihi:{' '}
                    {new Date(campaign.endAt).toLocaleDateString('tr-TR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">•</span>
                  <span>Satıcı: {campaign.sellerName}</span>
                </li>
                {campaign.location && (
                  <li className="flex items-start">
                    <span className="text-primary-600 mr-2">•</span>
                    <span>Konum: {campaign.location}</span>
                  </li>
                )}
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">•</span>
                  <span className="whitespace-pre-line">{campaign.shippingRules}</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">•</span>
                  <span>
                    Kampanya başarısız olursa ödeme yapılmaz veya iade edilir
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-20">
              {/* Brand & Status */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-500">{campaign.product.brand}</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                  {statusInfo.text}
                </span>
              </div>

              {/* Product Name */}
              <h1 className="text-2xl font-bold mb-4">{campaign.product.name}</h1>

              {/* Status Description */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-blue-800">{statusInfo.description}</p>
              </div>

              {/* Prices */}
              <div className="mb-6">
                <div className="text-sm text-gray-500 mb-1">Normal Fiyat</div>
                <div className="text-gray-400 line-through text-lg mb-3">
                  {Number(campaign.normalPrice).toLocaleString('tr-TR')} {campaign.currency}
                </div>

                <div className="text-sm text-gray-500 mb-1">MilyonEl Grup Fiyatı</div>
                <div className="text-4xl font-bold text-primary-600 mb-1">
                  {Number(campaign.groupPrice).toLocaleString('tr-TR')} {campaign.currency}
                </div>
                <div className="text-sm text-green-600 font-medium">
                  {(Number(campaign.normalPrice) - Number(campaign.groupPrice)).toLocaleString('tr-TR')}{' '}
                  {campaign.currency} tasarruf
                </div>
              </div>

              {/* Progress */}
              <div className="mb-6">
                <ProgressBar
                  current={campaign._count.participations}
                  target={campaign.minParticipants}
                />
              </div>

              {/* Countdown */}
              {(campaign.status === 'COLLECTING_USERS' || campaign.status === 'COLLECTING_PAYMENTS') && (
                <div className="mb-6">
                  <div className="text-sm font-medium text-gray-700 mb-3">
                    {campaign.status === 'COLLECTING_USERS' ? 'Kampanya Bitiş Süresi' : 'Ödeme İçin Kalan Süre'}
                  </div>
                  <CountdownTimer
                    targetDate={
                      campaign.status === 'COLLECTING_PAYMENTS' && campaign.paymentDeadlineAt
                        ? campaign.paymentDeadlineAt
                        : campaign.endAt
                    }
                  />
                </div>
              )}

              {/* Action Buttons */}
              <CampaignActions
                campaign={{
                  id: campaign.id,
                  slug: campaign.slug,
                  status: campaign.status,
                }}
                session={session}
                hasParticipated={!!participation}
                hasPaid={!!order && order.paymentStatus === 'PAID'}
              />

              {/* Stats */}
              <div className="mt-6 pt-6 border-t">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary-600">
                      {campaign._count.participations}
                    </div>
                    <div className="text-sm text-gray-500">Katılımcı</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {campaign._count.orders}
                    </div>
                    <div className="text-sm text-gray-500">Ödeme Yapan</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
