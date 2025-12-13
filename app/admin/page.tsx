import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';
import Link from 'next/link';

async function getAdminStats() {
  const [
    totalUsers,
    totalCampaigns,
    activeCampaigns,
    totalParticipations,
    totalOrders,
    totalRevenue,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.campaign.count(),
    prisma.campaign.count({
      where: {
        status: {
          in: ['COLLECTING_USERS', 'COLLECTING_PAYMENTS'],
        },
      },
    }),
    prisma.campaignParticipation.count(),
    prisma.order.count(),
    prisma.order.aggregate({
      where: {
        paymentStatus: 'PAID',
      },
      _sum: {
        totalAmount: true,
      },
    }),
  ]);

  const recentCampaigns = await prisma.campaign.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
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

  return {
    totalUsers,
    totalCampaigns,
    activeCampaigns,
    totalParticipations,
    totalOrders,
    totalRevenue: totalRevenue._sum.totalAmount || 0,
    recentCampaigns,
  };
}

export default async function AdminDashboard() {
  await requireAdmin();
  const stats = await getAdminStats();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Sistem genelindeki istatistiklere hızlı bakış</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Toplam Üye"
          value={stats.totalUsers.toString()}
          icon={<UserStatsIcon />}
          color="blue"
        />
        <StatCard
          title="Toplam Kampanya"
          value={stats.totalCampaigns.toString()}
          icon={<CampaignStatsIcon />}
          color="green"
        />
        <StatCard
          title="Aktif Kampanya"
          value={stats.activeCampaigns.toString()}
          icon={<ActiveIcon />}
          color="yellow"
        />
        <StatCard
          title="Toplam Katılım"
          value={stats.totalParticipations.toString()}
          icon={<ParticipationIcon />}
          color="purple"
        />
        <StatCard
          title="Toplam Sipariş"
          value={stats.totalOrders.toString()}
          icon={<OrderIcon />}
          color="indigo"
        />
        <StatCard
          title="Toplam Gelir"
          value={`${Number(stats.totalRevenue).toLocaleString('tr-TR')} TL`}
          icon={<RevenueIcon />}
          color="green"
        />
      </div>

      {/* Recent Campaigns */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Son Kampanyalar</h2>
          <Link
            href="/admin/kampanyalar"
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            Tümünü Gör →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Ürün
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Durum
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Katılımcı
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Sipariş
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Tarih
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                  İşlem
                </th>
              </tr>
            </thead>
            <tbody>
              {stats.recentCampaigns.map((campaign) => (
                <tr key={campaign.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={campaign.product.imageUrl}
                        alt={campaign.product.name}
                        className="w-10 h-10 object-cover rounded"
                      />
                      <div>
                        <div className="font-medium text-gray-900">
                          {campaign.product.name}
                        </div>
                        <div className="text-sm text-gray-500">{campaign.product.brand}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <StatusBadge status={campaign.status} />
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-900">
                    {campaign._count.participations} / {campaign.minParticipants}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-900">
                    {campaign._count.orders}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-500">
                    {new Date(campaign.createdAt).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <Link
                      href={`/admin/kampanyalar/${campaign.id}`}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      Detay →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    purple: 'bg-purple-100 text-purple-600',
    indigo: 'bg-indigo-100 text-indigo-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const badges: Record<string, { text: string; className: string }> = {
    DRAFT: { text: 'Taslak', className: 'bg-gray-100 text-gray-800' },
    COLLECTING_USERS: { text: 'Katılımcı Toplanıyor', className: 'bg-blue-100 text-blue-800' },
    COLLECTING_PAYMENTS: { text: 'Ödeme Aşamasında', className: 'bg-yellow-100 text-yellow-800' },
    SUCCESSFUL: { text: 'Tamamlandı', className: 'bg-green-100 text-green-800' },
    FAILED: { text: 'Başarısız', className: 'bg-red-100 text-red-800' },
  };

  const badge = badges[status] || badges.DRAFT;

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.className}`}>
      {badge.text}
    </span>
  );
}

// Icons for stats
function UserStatsIcon() {
  return (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
    </svg>
  );
}

function CampaignStatsIcon() {
  return (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
    </svg>
  );
}

function ActiveIcon() {
  return (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function ParticipationIcon() {
  return (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
    </svg>
  );
}

function OrderIcon() {
  return (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function RevenueIcon() {
  return (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
        clipRule="evenodd"
      />
    </svg>
  );
}
