import { redirect } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function getDashboardData(userId: string) {
  const [participations, orders, user] = await Promise.all([
    prisma.campaignParticipation.count({
      where: { userId },
    }),
    prisma.order.count({
      where: { userId },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        email: true,
      },
    }),
  ]);

  const recentParticipations = await prisma.campaignParticipation.findMany({
    where: { userId },
    include: {
      campaign: {
        include: {
          product: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  return {
    participations,
    orders,
    user,
    recentParticipations,
  };
}

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect('/giris?redirect=/panel');
  }

  const data = await getDashboardData(session.userId);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h1 className="text-3xl font-bold mb-2">Hoş Geldiniz, {data.user?.name}!</h1>
          <p className="text-gray-600">Kampanyalarınızı ve siparişlerinizi buradan takip edebilirsiniz</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link href="/panel/kampanyalarim">
            <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Katıldığım Kampanyalar</p>
                  <p className="text-3xl font-bold text-primary-600">{data.participations}</p>
                </div>
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-primary-600"
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
              </div>
            </div>
          </Link>

          <Link href="/panel/siparislerim">
            <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Siparişlerim</p>
                  <p className="text-3xl font-bold text-green-600">{data.orders}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/panel/profil">
            <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Hesap</p>
                  <p className="text-lg font-semibold text-gray-800">Profilim</p>
                </div>
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Participations */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Son Katıldığım Kampanyalar</h2>
            <Link
              href="/panel/kampanyalarim"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              Tümünü Gör →
            </Link>
          </div>

          {data.recentParticipations.length > 0 ? (
            <div className="space-y-4">
              {data.recentParticipations.map((participation) => (
                <Link
                  key={participation.id}
                  href={`/kampanyalar/${participation.campaign.slug}`}
                  className="block border border-gray-200 rounded-lg p-4 hover:border-primary-600 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <img
                        src={participation.campaign.product.imageUrl}
                        alt={participation.campaign.product.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div>
                        <h3 className="font-semibold mb-1">
                          {participation.campaign.product.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {participation.campaign.product.brand}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary-600">
                        {Number(participation.campaign.groupPrice).toLocaleString('tr-TR')}{' '}
                        {participation.campaign.currency}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(participation.createdAt).toLocaleDateString('tr-TR')}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">Henüz hiçbir kampanyaya katılmadınız</p>
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
    </div>
  );
}
