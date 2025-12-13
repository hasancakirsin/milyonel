'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  brand: string;
}

export default function NewCampaignPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    productId: '',
    normalPrice: '',
    groupPrice: '',
    currency: 'TL',
    minParticipants: '',
    maxParticipants: '',
    startAt: '',
    endAt: '',
    sellerName: '',
    location: '',
    shippingRules: '',
    description: '',
    isFeatured: false,
    status: 'DRAFT',
  });

  useEffect(() => {
    // Fetch products
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/admin/products');
        if (response.ok) {
          const data = await response.json();
          setProducts(data.products);
        }
      } catch (err) {
        console.error('Failed to fetch products:', err);
      }
    };

    fetchProducts();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent, publishImmediately: boolean = false) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          normalPrice: parseFloat(formData.normalPrice),
          groupPrice: parseFloat(formData.groupPrice),
          minParticipants: parseInt(formData.minParticipants),
          maxParticipants: formData.maxParticipants
            ? parseInt(formData.maxParticipants)
            : null,
          startAt: new Date(formData.startAt),
          endAt: new Date(formData.endAt),
          status: publishImmediately ? 'COLLECTING_USERS' : formData.status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Kampanya oluşturulurken hata oluştu');
      }

      router.push(`/admin/kampanyalar/${data.campaign.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <Link
          href="/admin/kampanyalar"
          className="text-primary-600 hover:text-primary-700 text-sm mb-2 inline-block"
        >
          ← Kampanyalara Dön
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Yeni Kampanya Oluştur</h1>
        <p className="text-gray-600 mt-1">Yeni bir toplu alışveriş kampanyası oluşturun</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-800 text-sm">
          {error}
        </div>
      )}

      <form className="space-y-6">
        {/* Product Selection */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4">Ürün Bilgileri</h2>

          <div className="space-y-4">
            <div>
              <label htmlFor="productId" className="block text-sm font-medium text-gray-700 mb-1">
                Ürün Seçimi *
              </label>
              <select
                id="productId"
                name="productId"
                value={formData.productId}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
              >
                <option value="">Ürün seçin...</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.brand} - {product.name}
                  </option>
                ))}
              </select>
              {products.length === 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  Ürün bulunamadı.{' '}
                  <Link href="/admin/urunler/yeni" className="text-primary-600 hover:underline">
                    Önce ürün ekleyin →
                  </Link>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4">Fiyatlandırma</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="normalPrice" className="block text-sm font-medium text-gray-700 mb-1">
                Normal Fiyat *
              </label>
              <input
                type="number"
                step="0.01"
                id="normalPrice"
                name="normalPrice"
                value={formData.normalPrice}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                placeholder="9999.99"
              />
            </div>

            <div>
              <label htmlFor="groupPrice" className="block text-sm font-medium text-gray-700 mb-1">
                MilyonEl Grup Fiyatı *
              </label>
              <input
                type="number"
                step="0.01"
                id="groupPrice"
                name="groupPrice"
                value={formData.groupPrice}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                placeholder="7999.99"
              />
            </div>

            <div>
              <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
                Para Birimi *
              </label>
              <select
                id="currency"
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
              >
                <option value="TL">TL</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </div>

          {formData.normalPrice && formData.groupPrice && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-800">
                İndirim Oranı:{' '}
                <span className="font-bold">
                  %
                  {Math.round(
                    ((parseFloat(formData.normalPrice) - parseFloat(formData.groupPrice)) /
                      parseFloat(formData.normalPrice)) *
                      100
                  )}
                </span>
              </p>
              <p className="text-sm text-green-800 mt-1">
                Tasarruf:{' '}
                <span className="font-bold">
                  {(parseFloat(formData.normalPrice) - parseFloat(formData.groupPrice)).toFixed(
                    2
                  )}{' '}
                  {formData.currency}
                </span>
              </p>
            </div>
          )}
        </div>

        {/* Participants */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4">Katılımcı Ayarları</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="minParticipants"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Minimum Katılımcı *
              </label>
              <input
                type="number"
                id="minParticipants"
                name="minParticipants"
                value={formData.minParticipants}
                onChange={handleChange}
                required
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                placeholder="50"
              />
              <p className="text-xs text-gray-500 mt-1">
                Bu sayıya ulaşılmazsa kampanya başarısız olur
              </p>
            </div>

            <div>
              <label
                htmlFor="maxParticipants"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Maksimum Katılımcı (Opsiyonel)
              </label>
              <input
                type="number"
                id="maxParticipants"
                name="maxParticipants"
                value={formData.maxParticipants}
                onChange={handleChange}
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                placeholder="Sınırsız"
              />
              <p className="text-xs text-gray-500 mt-1">Boş bırakılırsa sınırsız olur</p>
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4">Tarih Ayarları</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startAt" className="block text-sm font-medium text-gray-700 mb-1">
                Başlangıç Tarihi/Saati *
              </label>
              <input
                type="datetime-local"
                id="startAt"
                name="startAt"
                value={formData.startAt}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
              />
            </div>

            <div>
              <label htmlFor="endAt" className="block text-sm font-medium text-gray-700 mb-1">
                Bitiş Tarihi/Saati *
              </label>
              <input
                type="datetime-local"
                id="endAt"
                name="endAt"
                value={formData.endAt}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
              />
            </div>
          </div>
        </div>

        {/* Seller Info */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4">Satıcı Bilgileri</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="sellerName" className="block text-sm font-medium text-gray-700 mb-1">
                Satıcı Adı *
              </label>
              <input
                type="text"
                id="sellerName"
                name="sellerName"
                value={formData.sellerName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                placeholder="Arçelik Bayi - İstanbul"
              />
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Konum (Opsiyonel)
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                placeholder="İstanbul, Kadıköy"
              />
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4">Ek Bilgiler</h2>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="shippingRules"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Kargo / Teslimat Kuralları *
              </label>
              <textarea
                id="shippingRules"
                name="shippingRules"
                value={formData.shippingRules}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                placeholder="Örn: Kargo ücretsiz, 15 gün içinde teslim edilir..."
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Kampanya Açıklaması (Opsiyonel)
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                placeholder="Kampanya hakkında ek bilgiler..."
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isFeatured"
                name="isFeatured"
                checked={formData.isFeatured}
                onChange={handleChange}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-600"
              />
              <label htmlFor="isFeatured" className="ml-2 text-sm text-gray-700">
                Anasayfada öne çıkar
              </label>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <Link
              href="/admin/kampanyalar"
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              İptal
            </Link>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={(e) => handleSubmit(e, false)}
                disabled={isLoading}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
              >
                Taslak Olarak Kaydet
              </button>
              <button
                type="button"
                onClick={(e) => handleSubmit(e, true)}
                disabled={isLoading}
                className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 font-semibold"
              >
                {isLoading ? 'Kaydediliyor...' : 'Kaydet ve Yayına Al'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
