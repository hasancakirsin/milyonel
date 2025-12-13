'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewProductPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category: 'ELEKTRONIK',
    normalPrice: '',
    description: '',
    imageUrl: '',
    specs: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Parse specs if provided
      let specsObject = null;
      if (formData.specs.trim()) {
        try {
          specsObject = JSON.parse(formData.specs);
        } catch {
          throw new Error('Teknik özellikler geçerli bir JSON formatında olmalıdır');
        }
      }

      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          brand: formData.brand,
          category: formData.category,
          normalPrice: parseFloat(formData.normalPrice),
          description: formData.description,
          imageUrl: formData.imageUrl,
          specs: specsObject,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ürün oluşturulurken hata oluştu');
      }

      router.push('/admin/urunler');
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
          href="/admin/urunler"
          className="text-primary-600 hover:text-primary-700 text-sm mb-2 inline-block"
        >
          ← Ürünlere Dön
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Yeni Ürün Ekle</h1>
        <p className="text-gray-600 mt-1">Yeni bir ürün tanımı oluşturun</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-800 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4">Temel Bilgiler</h2>

          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Ürün Adı *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                placeholder="Örn: Çamaşır Makinesi X500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">
                  Marka *
                </label>
                <input
                  type="text"
                  id="brand"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                  placeholder="Örn: Arçelik"
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Kategori *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                >
                  <option value="BEYAZ_ESYA">Beyaz Eşya</option>
                  <option value="ELEKTRONIK">Elektronik</option>
                  <option value="MOBILYA">Mobilya</option>
                  <option value="TEKSTIL">Tekstil</option>
                  <option value="DIGER">Diğer</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="normalPrice" className="block text-sm font-medium text-gray-700 mb-1">
                Normal Fiyat (TL) *
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
              <p className="text-xs text-gray-500 mt-1">
                Piyasa fiyatı (kampanya oluştururken farklı fiyat belirleyebilirsiniz)
              </p>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Açıklama *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                placeholder="Ürün hakkında detaylı açıklama..."
              />
            </div>

            <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
                Görsel URL *
              </label>
              <input
                type="url"
                id="imageUrl"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                placeholder="https://example.com/product-image.jpg"
              />
              <p className="text-xs text-gray-500 mt-1">
                Ürün görseli için tam URL adresi girin
              </p>
            </div>
          </div>
        </div>

        {/* Technical Specs */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4">Teknik Özellikler</h2>

          <div>
            <label htmlFor="specs" className="block text-sm font-medium text-gray-700 mb-1">
              Özellikler (JSON formatında)
            </label>
            <textarea
              id="specs"
              name="specs"
              value={formData.specs}
              onChange={handleChange}
              rows={8}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600 font-mono text-sm"
              placeholder={`{\n  "Kapasite": "9 kg",\n  "Enerji Sınıfı": "A+++",\n  "Devir": "1400 RPM",\n  "Renk": "Beyaz"\n}`}
            />
            <p className="text-xs text-gray-500 mt-1">
              JSON formatında teknik özellikler girin (opsiyonel)
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <Link
              href="/admin/urunler"
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              İptal
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 font-semibold"
            >
              {isLoading ? 'Kaydediliyor...' : 'Ürünü Kaydet'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
