import { redirect } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function getUserCampaigns(userId: string) {
  const participations = await prisma.campaignParticipation.findMany({
    where: { userId },
    include: {
      campaign: {
        include: {
          product: true,
          _count: {
            select: {
              participations: true,
              orders: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return participations;
}

export default async function MyCampaignsPage() {
  const session = await getSession();

  if (!session) {
    redirect('/giris?redirect=/panel/kampanyalarim');
  }

  const participations = await getUserCampaigns(session.userId);

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
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.className}`}>
        {badge.text}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/panel" className="text-primary-600 hover:text-primary-700 text-sm mb-2 inline-block">
            ← Panel'e Dön
          </Link>
          <h1 className="text-3xl font-bold mb-2">Katıldığım Kampanyalar</h1>
          <p className="text-gray-600">
            Katıldığınız tüm kampanyaları burada görebilir ve takip edebilirsiniz
          </p>
        </div>

        {/* Campaigns List */}
        {participations.length > 0 ? (
          <div className="space-y-4">
            {participations.map((participation) => {
              const campaign = participation.campaign;
              const discount = Math.round(
                ((Number(campaign.normalPrice) - Number(campaign.groupPrice)) /
                  Number(campaign.normalPrice)) *
                  100
              );
              const progress = Math.min(
                (campaign._count.participations / campaign.minParticipants) * 100,
                100
              );

              return (
                <div key={participation.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Image */}
                      <div className="w-full md:w-48 h-48 flex-shrink-0">
                        <img
                          src={campaign.product.imageUrl}
                          alt={campaign.product.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="text-sm text-gray-500 mb-1">{campaign.product.brand}</p>
                            <h3 className="text-xl font-bold mb-2">{campaign.product.name}</h3>
                          </div>
                          {getStatusBadge(campaign.status)}
                        </div>

                        {/* Prices */}
                        <div className="mb-4">
                          <div className="flex items-center gap-3">
                            <span className="text-gray-400 line-through">
                              {Number(campaign.normalPrice).toLocaleString('tr-TR')} {campaign.currency}
                            </span>
                            <span className="text-2xl font-bold text-primary-600">
                              {Number(campaign.groupPrice).toLocaleString('tr-TR')} {campaign.currency}
                            </span>
                            <span className="bg-red-500 text-white px-2 py-1 rounded text-sm font-bold">
                              %{discount} İndirim
                            </span>
                          </div>
                        </div>

                        {/* Progress */}
                        <div className="mb-4">
                          <div className="flex justify-between text-sm text-gray-600 mb-2">
                            <span>{campaign._count.participations} kişi katıldı</span>
                            <span>Hedef: {campaign.minParticipants} kişi</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-full rounded-full transition-all ${
                                progress >= 100 ? 'bg-green-500' : 'bg-primary-600'
                              }`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>

                        {/* Meta Info */}
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-500">
                            <span>Katılım tarihi: </span>
                            <span className="font-medium">
                              {new Date(participation.createdAt).toLocaleDateString('tr-TR')}
                            </span>
                          </div>
                          <Link
                            href={`/kampanyalar/${campaign.slug}`}
                            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm font-medium"
                          >
                            Detayları Gör
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-10 h-10 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Henüz Kampanyaya Katılmadınız</h3>
            <p className="text-gray-600 mb-6">
              Aktif kampanyalara katılarak büyük indirimlerden faydalanabilirsiniz
            </p>
            <Link
              href="/kampanyalar"
              className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
            >
              Kampanyaları İncele
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
