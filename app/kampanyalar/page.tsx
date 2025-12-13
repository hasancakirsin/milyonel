'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import CampaignCard from '@/components/CampaignCard';

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCampaigns();
  }, [category]);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (category) params.append('category', category);

      const response = await fetch(`/api/campaigns?${params}`);
      const data = await response.json();
      setCampaigns(data.campaigns || []);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCampaigns = campaigns.filter((campaign) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      campaign.product.name.toLowerCase().includes(query) ||
      campaign.product.brand.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Tüm Kampanyalar</h1>
          <p className="text-gray-600">
            Toplu alışveriş fırsatlarını keşfet, en uygununu seç
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kategori
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
              >
                <option value="">Tüm Kategoriler</option>
                <option value="BEYAZ_ESYA">Beyaz Eşya</option>
                <option value="ELEKTRONIK">Elektronik</option>
                <option value="TEKSTIL">Tekstil</option>
                <option value="MOBILYA">Mobilya</option>
                <option value="KOZMETIK">Kozmetik</option>
                <option value="GIDA">Gıda</option>
                <option value="DIGER">Diğer</option>
              </select>
            </div>

            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ürün veya Marka Ara
              </label>
              <input
                type="text"
                placeholder="Örn: Arçelik, buzdolabı..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
              />
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Kampanyalar yükleniyor...</p>
          </div>
        ) : filteredCampaigns.length > 0 ? (
          <>
            <div className="mb-4 text-sm text-gray-600">
              {filteredCampaigns.length} kampanya bulundu
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCampaigns.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">
              {searchQuery || category
                ? 'Aradığınız kriterlere uygun kampanya bulunamadı.'
                : 'Şu anda aktif kampanya bulunmamaktadır.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
