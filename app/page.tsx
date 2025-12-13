import Link from 'next/link';
import Header from '@/components/Header';
import CampaignCard from '@/components/CampaignCard';

async function getFeaturedCampaigns() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/campaigns?featured=true`, {
      cache: 'no-store',
    });

    if (!response.ok) return { campaigns: [] };

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return { campaigns: [] };
  }
}

export default async function HomePage() {
  const { campaigns } = await getFeaturedCampaigns();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold mb-6">
              Birlikte Al, Daha Ucuza Al
            </h1>
            <p className="text-xl mb-8 text-primary-50">
              MilyonEl ile toplu alışveriş kampanyalarına katıl, ürünleri çok daha uygun fiyata satın al.
              Binlerce kişiyle birlikte alışveriş yap, büyük indirimlerden faydalan!
            </p>
            <div className="flex gap-4">
              <Link
                href="/kampanyalar"
                className="px-8 py-3 bg-white text-primary-600 rounded-lg font-semibold hover:bg-gray-100 transition"
              >
                Kampanyaları Gör
              </Link>
              <Link
                href="https://wa.me/905XXXXXXXXX"
                target="_blank"
                className="px-8 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition"
              >
                WhatsApp Kulübüne Katıl
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Campaigns */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Öne Çıkan Kampanyalar</h2>
          <p className="text-gray-600">
            En popüler toplu alışveriş fırsatlarını kaçırma
          </p>
        </div>

        {campaigns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.slice(0, 6).map((campaign: any) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-12">
            Şu anda öne çıkan kampanya bulunmamaktadır.
          </div>
        )}

        <div className="text-center mt-8">
          <Link
            href="/kampanyalar"
            className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            Tüm Kampanyaları Gör
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section id="nasil-calisir" className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Nasıl Çalışır?</h2>
            <p className="text-gray-600">
              Sadece 4 basit adımda toplu alışverişin avantajlarından yararlan
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <StepCard
              number="1"
              title="Kampanyayı Seç"
              description="İstediğin ürün için aktif kampanyaları incele ve en uygununu seç"
            />
            <StepCard
              number="2"
              title="Kampanyaya Katıl"
              description="Ücretsiz ön kayıt ol, kampanya hedefine ulaşmasını bekle"
            />
            <StepCard
              number="3"
              title="Ödeme Yap"
              description="Hedef kişi sayısına ulaşıldığında haberdar ol ve ödeme yap"
            />
            <StepCard
              number="4"
              title="Ürünü Al"
              description="Satıcı ürünü hazırlayıp adresine teslim etsin, keyfini çıkar!"
            />
          </div>
        </div>
      </section>

      {/* Email Subscription */}
      <EmailSubscriptionSection />

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">
            © 2024 MilyonEl. Tüm hakları saklıdır.
          </p>
        </div>
      </footer>
    </div>
  );
}

function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
        {number}
      </div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}

function EmailSubscriptionSection() {
  return (
    <section className="bg-gray-100 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">
            Yeni Kampanyalardan Haberdar Ol
          </h2>
          <p className="text-gray-600 mb-6">
            E-posta adresini bırak, en iyi fırsatları kaçırma!
          </p>

          <form
            action="/api/email-subscriptions"
            method="POST"
            className="flex gap-3 max-w-md mx-auto"
          >
            <input
              type="email"
              name="email"
              placeholder="E-posta adresin"
              required
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-600"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold"
            >
              Beni Haberdar Et
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
