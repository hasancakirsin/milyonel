import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';

async function getAllUsers() {
  const users = await prisma.user.findMany({
    include: {
      _count: {
        select: {
          campaignParticipations: true,
          orders: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return users;
}

export default async function AdminUsersPage() {
  await requireAdmin();
  const users = await getAllUsers();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Kullanıcılar</h1>
        <p className="text-gray-600 mt-1">Tüm kullanıcıları görüntüleyin</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                  Kullanıcı
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                  İletişim
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                  Rol
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                  Katıldığı Kampanya
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                  Sipariş Sayısı
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                  Kayıt Tarihi
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <div>
                      <div className="font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500 font-mono">
                        {user.id.substring(0, 8)}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm">
                      <div className="text-gray-900">{user.email}</div>
                      <div className="text-gray-500">{user.phone}</div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <RoleBadge role={user.role} />
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-900">
                    {user._count.campaignParticipations}
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-900">{user._count.orders}</td>
                  <td className="py-4 px-6 text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString('tr-TR', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {users.length === 0 && (
            <div className="text-center py-12 text-gray-500">Henüz kullanıcı yok</div>
          )}
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm text-gray-600 mb-1">Toplam Kullanıcı</p>
          <p className="text-3xl font-bold text-gray-900">{users.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm text-gray-600 mb-1">Admin Kullanıcı</p>
          <p className="text-3xl font-bold text-gray-900">
            {users.filter((u) => u.role === 'ADMIN').length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm text-gray-600 mb-1">Normal Kullanıcı</p>
          <p className="text-3xl font-bold text-gray-900">
            {users.filter((u) => u.role === 'USER').length}
          </p>
        </div>
      </div>
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  const roles: Record<string, { text: string; className: string }> = {
    ADMIN: { text: 'Admin', className: 'bg-purple-100 text-purple-800' },
    USER: { text: 'Üye', className: 'bg-blue-100 text-blue-800' },
  };

  const badge = roles[role] || roles.USER;

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.className}`}>
      {badge.text}
    </span>
  );
}
