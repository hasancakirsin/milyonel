import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import CampaignStatusActions from './CampaignStatusActions';
import ExportOrdersButton from './ExportOrdersButton';

async function getCampaignDetails(id: string) {
  const campaign = await prisma.campaign.findUnique({
    where: { id },
    include: {
      product: true,
      participations: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
      orders: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          shippingAddress: true,
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  return campaign;
}

export default async function AdminCampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const campaign = await getCampaignDetails(id);

  if (!campaign) {
    notFound();
  }

  const paidOrders = campaign.orders.filter((order) => order.paymentStatus === 'PAID');
  const progressPercentage = Math.round(
    (campaign.participations.length / campaign.minParticipants) * 100
  );

  return (
    <div>
      <div className="mb-8">
        <Link
          href="/admin/kampanyalar"
          className="text-primary-600 hover:text-primary-700 text-sm mb-2 inline-block"
        >
          ← Kampanyalara Dön
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{campaign.product.name}</h1>
            <p className="text-gray-600 mt-1">{campaign.product.brand}</p>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              href={`/admin/kampanyalar/${campaign.id}/duzenle`}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Düzenle
            </Link>
            <Link
              href={`/kampanyalar/${campaign.slug}`}
              target="_blank"
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Önizle →
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm text-gray-600 mb-1">Durum</p>
          <StatusBadge status={campaign.status} />
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm text-gray-600 mb-1">Katılımcı</p>
          <p className="text-3xl font-bold text-gray-900">
            {campaign.participations.length}
            <span className="text-lg text-gray-500"> / {campaign.minParticipants}</span>
          </p>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full"
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm text-gray-600 mb-1">Ödeme Yapan</p>
          <p className="text-3xl font-bold text-green-600">{paidOrders.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm text-gray-600 mb-1">Toplam Gelir</p>
          <p className="text-2xl font-bold text-gray-900">
            {paidOrders
              .reduce((sum, order) => sum + Number(order.totalAmount), 0)
              .toLocaleString('tr-TR')}{' '}
            {campaign.currency}
          </p>
        </div>
      </div>

      {/* Campaign Info */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Kampanya Bilgileri</h2>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">Kampanya ID</p>
            <p className="font-mono text-sm">{campaign.id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Slug</p>
            <p className="font-mono text-sm">{campaign.slug}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Normal Fiyat</p>
            <p className="font-semibold">
              {Number(campaign.normalPrice).toLocaleString('tr-TR')} {campaign.currency}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">MilyonEl Grup Fiyatı</p>
            <p className="font-semibold text-primary-600">
              {Number(campaign.groupPrice).toLocaleString('tr-TR')} {campaign.currency}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Başlangıç Tarihi</p>
            <p className="font-semibold">
              {new Date(campaign.startAt).toLocaleDateString('tr-TR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Bitiş Tarihi</p>
            <p className="font-semibold">
              {new Date(campaign.endAt).toLocaleDateString('tr-TR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Satıcı</p>
            <p className="font-semibold">{campaign.sellerName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Konum</p>
            <p className="font-semibold">{campaign.location || '-'}</p>
          </div>
          <div className="col-span-2">
            <p className="text-sm text-gray-600 mb-1">Anasayfada Öne Çıkar</p>
            <p className="font-semibold">{campaign.isFeatured ? 'Evet' : 'Hayır'}</p>
          </div>
        </div>
      </div>

      {/* Status Actions */}
      <CampaignStatusActions
        campaignId={campaign.id}
        currentStatus={campaign.status}
        participationCount={campaign.participations.length}
        minParticipants={campaign.minParticipants}
        orderCount={paidOrders.length}
      />

      {/* Participations Table */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Katılımcılar</h2>
          <span className="text-sm text-gray-600">
            Toplam: {campaign.participations.length}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Kullanıcı
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  E-posta
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Telefon
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Kayıt Tarihi
                </th>
              </tr>
            </thead>
            <tbody>
              {campaign.participations.map((participation) => (
                <tr key={participation.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm">{participation.user.name}</td>
                  <td className="py-3 px-4 text-sm">{participation.user.email}</td>
                  <td className="py-3 px-4 text-sm">{participation.user.phone}</td>
                  <td className="py-3 px-4 text-sm">
                    {new Date(participation.createdAt).toLocaleDateString('tr-TR', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {campaign.participations.length === 0 && (
            <div className="text-center py-8 text-gray-500">Henüz katılımcı yok</div>
          )}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Ödenmiş Siparişler</h2>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600">Toplam: {paidOrders.length}</span>
            {paidOrders.length > 0 && (
              <ExportOrdersButton campaignId={campaign.id} campaignName={campaign.product.name} />
            )}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Kullanıcı
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  İletişim
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Miktar
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Tutar
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Adres
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Ödeme Tarihi
                </th>
              </tr>
            </thead>
            <tbody>
              {paidOrders.map((order) => (
                <tr key={order.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm font-medium">{order.user.name}</td>
                  <td className="py-3 px-4 text-sm">
                    <div>{order.user.email}</div>
                    <div className="text-gray-500">{order.user.phone}</div>
                  </td>
                  <td className="py-3 px-4 text-sm">{order.quantity} adet</td>
                  <td className="py-3 px-4 text-sm font-semibold">
                    {Number(order.totalAmount).toLocaleString('tr-TR')} {campaign.currency}
                  </td>
                  <td className="py-3 px-4 text-sm">
                    {order.shippingAddress ? (
                      <div className="max-w-xs">
                        <div className="font-medium">{order.shippingAddress.title}</div>
                        <div className="text-gray-600 text-xs mt-1">
                          {order.shippingAddress.fullAddress}
                        </div>
                        <div className="text-gray-600 text-xs">
                          {order.shippingAddress.district}, {order.shippingAddress.city}
                        </div>
                        <div className="text-gray-600 text-xs">
                          Tel: {order.shippingAddress.phone}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400">Adres yok</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm">
                    {order.paymentDate
                      ? new Date(order.paymentDate).toLocaleDateString('tr-TR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })
                      : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {paidOrders.length === 0 && (
            <div className="text-center py-8 text-gray-500">Henüz ödeme yapılmadı</div>
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
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${badge.className}`}>
      {badge.text}
    </span>
  );
}
