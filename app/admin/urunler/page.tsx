import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin-auth';
import Link from 'next/link';

async function getAllProducts() {
  const products = await prisma.product.findMany({
    include: {
      _count: {
        select: {
          campaigns: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return products;
}

export default async function AdminProductsPage() {
  await requireAdmin();
  const products = await getAllProducts();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ürünler</h1>
          <p className="text-gray-600 mt-1">Tüm ürünleri yönetin</p>
        </div>
        <Link
          href="/admin/urunler/yeni"
          className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold"
        >
          + Yeni Ürün Ekle
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                  Ürün
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                  Marka
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                  Kategori
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                  Normal Fiyat
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                  Kampanya Sayısı
                </th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div>
                        <div className="font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500 font-mono">
                          {product.id.substring(0, 8)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-900">{product.brand}</td>
                  <td className="py-4 px-6">
                    <CategoryBadge category={product.category} />
                  </td>
                  <td className="py-4 px-6 text-sm font-semibold text-gray-900">
                    {Number(product.normalPrice).toLocaleString('tr-TR')} TL
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-900">
                    {product._count.campaigns} kampanya
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-end space-x-2">
                      <Link
                        href={`/admin/urunler/${product.id}/duzenle`}
                        className="px-3 py-1.5 text-sm text-primary-600 hover:text-primary-700 font-medium"
                      >
                        Düzenle
                      </Link>
                      {product._count.campaigns === 0 && (
                        <button className="px-3 py-1.5 text-sm text-red-600 hover:text-red-700 font-medium">
                          Sil
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {products.length === 0 && (
            <div className="text-center py-12 text-gray-500">Henüz ürün eklenmedi</div>
          )}
        </div>
      </div>
    </div>
  );
}

function CategoryBadge({ category }: { category: string }) {
  const categories: Record<string, { text: string; className: string }> = {
    BEYAZ_ESYA: { text: 'Beyaz Eşya', className: 'bg-blue-100 text-blue-800' },
    ELEKTRONIK: { text: 'Elektronik', className: 'bg-purple-100 text-purple-800' },
    MOBILYA: { text: 'Mobilya', className: 'bg-yellow-100 text-yellow-800' },
    TEKSTIL: { text: 'Tekstil', className: 'bg-pink-100 text-pink-800' },
    DIGER: { text: 'Diğer', className: 'bg-gray-100 text-gray-800' },
  };

  const badge = categories[category] || categories.DIGER;

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.className}`}>
      {badge.text}
    </span>
  );
}
