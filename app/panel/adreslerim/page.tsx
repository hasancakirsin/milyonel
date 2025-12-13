'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';

interface Address {
  id: string;
  title: string;
  fullAddress: string;
  city: string;
  district: string;
  phone: string;
  isDefault: boolean;
}

export default function AddressesPage() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    fullAddress: '',
    city: '',
    district: '',
    phone: '',
    isDefault: false,
  });

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const response = await fetch('/api/user/addresses');
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/giris?redirect=/panel/adreslerim');
          return;
        }
        throw new Error('Adresler yüklenirken hata oluştu');
      }

      const data = await response.json();
      setAddresses(data.addresses);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const url = editingId ? `/api/user/addresses/${editingId}` : '/api/user/addresses';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Adres kaydedilirken hata oluştu');
      }

      setSuccess(editingId ? 'Adres güncellendi' : 'Adres eklendi');
      setShowForm(false);
      setEditingId(null);
      setFormData({
        title: '',
        fullAddress: '',
        city: '',
        district: '',
        phone: '',
        isDefault: false,
      });
      fetchAddresses();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEdit = (address: Address) => {
    setFormData({
      title: address.title,
      fullAddress: address.fullAddress,
      city: address.city,
      district: address.district,
      phone: address.phone,
      isDefault: address.isDefault,
    });
    setEditingId(address.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu adresi silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`/api/user/addresses/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Adres silinirken hata oluştu');
      }

      setSuccess('Adres silindi');
      fetchAddresses();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      title: '',
      fullAddress: '',
      city: '',
      district: '',
      phone: '',
      isDefault: false,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500">Yükleniyor...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/panel" className="text-primary-600 hover:text-primary-700 text-sm mb-2 inline-block">
            ← Panel'e Dön
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Adreslerim</h1>
              <p className="text-gray-600">
                Teslimat adreslerinizi buradan yönetebilirsiniz
              </p>
            </div>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold"
              >
                + Yeni Adres Ekle
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-800 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-green-800 text-sm">
            {success}
          </div>
        )}

        <div className="max-w-4xl">
          {/* Address Form */}
          {showForm && (
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">
                {editingId ? 'Adresi Düzenle' : 'Yeni Adres Ekle'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Adres Başlığı
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="Örn: Ev, İş, Ofis"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                      İl
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      placeholder="İstanbul"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                    />
                  </div>

                  <div>
                    <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-1">
                      İlçe
                    </label>
                    <input
                      type="text"
                      id="district"
                      name="district"
                      value={formData.district}
                      onChange={handleChange}
                      required
                      placeholder="Kadıköy"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="fullAddress" className="block text-sm font-medium text-gray-700 mb-1">
                    Tam Adres
                  </label>
                  <textarea
                    id="fullAddress"
                    name="fullAddress"
                    value={formData.fullAddress}
                    onChange={handleChange}
                    required
                    rows={3}
                    placeholder="Sokak, mahalle, bina no, daire no vb."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    placeholder="5XX XXX XX XX"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isDefault"
                    name="isDefault"
                    checked={formData.isDefault}
                    onChange={handleChange}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-600"
                  />
                  <label htmlFor="isDefault" className="ml-2 text-sm text-gray-700">
                    Varsayılan adres olarak ayarla
                  </label>
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold"
                  >
                    {editingId ? 'Güncelle' : 'Kaydet'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    İptal
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Addresses List */}
          {addresses.length > 0 ? (
            <div className="space-y-4">
              {addresses.map((address) => (
                <div
                  key={address.id}
                  className="bg-white rounded-xl shadow-sm p-6 relative"
                >
                  {address.isDefault && (
                    <span className="absolute top-4 right-4 px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                      Varsayılan
                    </span>
                  )}

                  <h3 className="text-lg font-bold mb-2">{address.title}</h3>
                  <p className="text-gray-600 mb-1">
                    {address.fullAddress}
                  </p>
                  <p className="text-gray-600 mb-1">
                    {address.district}, {address.city}
                  </p>
                  <p className="text-gray-600 mb-4">
                    Tel: {address.phone}
                  </p>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleEdit(address)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm"
                    >
                      Düzenle
                    </button>
                    <button
                      onClick={() => handleDelete(address.id)}
                      className="px-4 py-2 text-red-600 hover:text-red-700 transition text-sm"
                    >
                      Sil
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            !showForm && (
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
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Henüz Adres Eklemediniz</h3>
                <p className="text-gray-600 mb-6">
                  Sipariş verebilmek için en az bir teslimat adresi eklemelisiniz
                </p>
                <button
                  onClick={() => setShowForm(true)}
                  className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                >
                  İlk Adresi Ekle
                </button>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
