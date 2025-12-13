import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';
import ExportEmailsButton from './ExportEmailsButton';

async function getAllEmailSubscriptions() {
  const subscriptions = await prisma.emailSubscription.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return subscriptions;
}

export default async function AdminEmailsPage() {
  await requireAdmin();
  const subscriptions = await getAllEmailSubscriptions();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">E-posta Aboneleri</h1>
          <p className="text-gray-600 mt-1">Bülten abonelerini görüntüleyin ve dışa aktarın</p>
        </div>
        {subscriptions.length > 0 && <ExportEmailsButton />}
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                  E-posta
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                  Kaynak
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                  Durum
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                  Kayıt Tarihi
                </th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((subscription) => (
                <tr key={subscription.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">{subscription.email}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600">
                    {subscription.source || 'home_page'}
                  </td>
                  <td className="py-4 px-6">
                    <StatusBadge isActive={subscription.isActive} />
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-500">
                    {new Date(subscription.createdAt).toLocaleDateString('tr-TR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {subscriptions.length === 0 && (
            <div className="text-center py-12 text-gray-500">Henüz abone yok</div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm text-gray-600 mb-1">Toplam Abone</p>
          <p className="text-3xl font-bold text-gray-900">{subscriptions.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm text-gray-600 mb-1">Aktif Abone</p>
          <p className="text-3xl font-bold text-green-600">
            {subscriptions.filter((s) => s.isActive).length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm text-gray-600 mb-1">Pasif Abone</p>
          <p className="text-3xl font-bold text-gray-400">
            {subscriptions.filter((s) => !s.isActive).length}
          </p>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${
        isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
      }`}
    >
      {isActive ? 'Aktif' : 'Pasif'}
    </span>
  );
}
