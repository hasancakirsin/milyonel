import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';
import Link from 'next/link';

async function getAllCampaigns() {
  const campaigns = await prisma.campaign.findMany({
    include: {
      product: true,
      _count: {
        select: {
          participations: true,
          orders: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return campaigns;
}

export default async function AdminCampaignsPage() {
  await requireAdmin();
  const campaigns = await getAllCampaigns();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kampanyalar</h1>
          <p className="text-gray-600 mt-1">Tüm kampanyaları yönetin</p>
        </div>
        <Link
          href="/admin/kampanyalar/yeni"
          className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold"
        >
          + Yeni Kampanya Oluştur
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                  Kampanya ID
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                  Ürün
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                  Durum
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                  Katılımcı
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                  Sipariş
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                  Fiyat
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                  Tarihler
                </th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((campaign) => (
                <tr key={campaign.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <span className="font-mono text-sm text-gray-600">
                      {campaign.id.substring(0, 8)}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <img
                        src={campaign.product.imageUrl}
                        alt={campaign.product.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div>
                        <div className="font-medium text-gray-900">
                          {campaign.product.name}
                        </div>
                        <div className="text-sm text-gray-500">{campaign.product.brand}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <StatusBadge status={campaign.status} />
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm">
                      <span className="font-semibold text-gray-900">
                        {campaign._count.participations}
                      </span>
                      <span className="text-gray-500"> / {campaign.minParticipants}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {Math.round(
                        (campaign._count.participations / campaign.minParticipants) * 100
                      )}
                      % tamamlandı
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-semibold text-gray-900">
                      {campaign._count.orders}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm">
                      <div className="text-gray-400 line-through">
                        {Number(campaign.normalPrice).toLocaleString('tr-TR')} {campaign.currency}
                      </div>
                      <div className="font-semibold text-primary-600">
                        {Number(campaign.groupPrice).toLocaleString('tr-TR')} {campaign.currency}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm text-gray-600">
                      <div>
                        Başlangıç:{' '}
                        {new Date(campaign.startAt).toLocaleDateString('tr-TR', {
                          day: '2-digit',
                          month: '2-digit',
                        })}
                      </div>
                      <div>
                        Bitiş:{' '}
                        {new Date(campaign.endAt).toLocaleDateString('tr-TR', {
                          day: '2-digit',
                          month: '2-digit',
                        })}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-end space-x-2">
                      <Link
                        href={`/admin/kampanyalar/${campaign.id}`}
                        className="px-3 py-1.5 text-sm text-primary-600 hover:text-primary-700 font-medium"
                      >
                        Detay
                      </Link>
                      <Link
                        href={`/admin/kampanyalar/${campaign.id}/duzenle`}
                        className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-700 font-medium"
                      >
                        Düzenle
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {campaigns.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              Henüz kampanya oluşturulmadı
            </div>
          )}
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
