import { redirect } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function getUserOrders(userId: string) {
  const orders = await prisma.order.findMany({
    where: { userId },
    include: {
      campaign: {
        include: {
          product: true,
        },
      },
      shippingAddress: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return orders;
}

export default async function MyOrdersPage() {
  const session = await getSession();

  if (!session) {
    redirect('/giris?redirect=/panel/siparislerim');
  }

  const orders = await getUserOrders(session.userId);

  const getPaymentStatusBadge = (status: string) => {
    const badges: Record<string, { text: string; className: string }> = {
      PENDING: { text: 'Ödeme Bekleniyor', className: 'bg-yellow-100 text-yellow-800' },
      PAID: { text: 'Ödendi', className: 'bg-green-100 text-green-800' },
      FAILED: { text: 'Başarısız', className: 'bg-red-100 text-red-800' },
      REFUNDED: { text: 'İade Edildi', className: 'bg-blue-100 text-blue-800' },
    };

    const badge = badges[status] || badges.PENDING;

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
          <h1 className="text-3xl font-bold mb-2">Siparişlerim</h1>
          <p className="text-gray-600">
            Ödeme yaptığınız tüm siparişlerinizi burada görebilirsiniz
          </p>
        </div>

        {/* Orders List */}
        {orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => {
              const campaign = order.campaign;

              return (
                <div key={order.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Image */}
                      <div className="w-full md:w-40 h-40 flex-shrink-0">
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
                            <p className="text-sm text-gray-500 mb-1">
                              Sipariş No: <span className="font-mono font-medium">{order.id.substring(0, 8)}</span>
                            </p>
                            <h3 className="text-xl font-bold mb-1">{campaign.product.name}</h3>
                            <p className="text-sm text-gray-600">{campaign.product.brand}</p>
                          </div>
                          {getPaymentStatusBadge(order.paymentStatus)}
                        </div>

                        {/* Order Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-gray-500">Miktar</p>
                            <p className="font-medium">{order.quantity} adet</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Toplam Tutar</p>
                            <p className="font-medium text-lg text-primary-600">
                              {Number(order.totalAmount).toLocaleString('tr-TR')} {campaign.currency}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Sipariş Tarihi</p>
                            <p className="font-medium">
                              {new Date(order.createdAt).toLocaleDateString('tr-TR', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                              })}
                            </p>
                          </div>
                          {order.paymentDate && (
                            <div>
                              <p className="text-sm text-gray-500">Ödeme Tarihi</p>
                              <p className="font-medium">
                                {new Date(order.paymentDate).toLocaleDateString('tr-TR', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric',
                                })}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Shipping Address */}
                        {order.shippingAddress && (
                          <div className="bg-gray-50 rounded-lg p-4 mb-4">
                            <p className="text-sm font-semibold text-gray-700 mb-2">Teslimat Adresi</p>
                            <p className="text-sm text-gray-600">
                              {order.shippingAddress.fullAddress}
                              <br />
                              {order.shippingAddress.district}, {order.shippingAddress.city}
                              <br />
                              Tel: {order.shippingAddress.phone}
                            </p>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-3">
                          <Link
                            href={`/kampanyalar/${campaign.slug}`}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
                          >
                            Kampanya Detayı
                          </Link>
                          {order.paymentStatus === 'PAID' && (
                            <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm font-medium">
                              Kargo Takibi
                            </button>
                          )}
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
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Henüz Siparişiniz Yok</h3>
            <p className="text-gray-600 mb-6">
              Kampanyalara katılıp ödeme yaptığınızda siparişleriniz burada görünecektir
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
