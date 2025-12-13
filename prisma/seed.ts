import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Admin kullanıcısı oluştur
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@milyonel.com' },
    update: {},
    create: {
      email: 'admin@milyonel.com',
      name: 'Admin',
      passwordHash: adminPassword,
      role: 'ADMIN',
      phone: '5551234567',
    },
  })

  console.log('✅ Admin kullanıcısı oluşturuldu:', admin.email)

  // Test kullanıcısı
  const userPassword = await bcrypt.hash('user123', 10)
  const user = await prisma.user.upsert({
    where: { email: 'user@test.com' },
    update: {},
    create: {
      email: 'user@test.com',
      name: 'Test Kullanıcı',
      passwordHash: userPassword,
      role: 'USER',
      phone: '5559876543',
    },
  })

  console.log('✅ Test kullanıcısı oluşturuldu:', user.email)

  // Örnek ürünler
  const product1 = await prisma.product.upsert({
    where: { id: 'prod1' },
    update: {},
    create: {
      id: 'prod1',
      name: 'iPhone 15 Pro',
      brand: 'Apple',
      category: 'Elektronik',
      description: '128GB, Titanyum Mavi',
      normalPrice: '54999',
      imageUrl: 'https://images.unsplash.com/photo-1696446702782-8538a33568f7?w=800',
      specs: JSON.stringify({
        storage: '128GB',
        color: 'Titanyum Mavi',
        display: '6.1 inç Super Retina XDR'
      }),
    },
  })

  const product2 = await prisma.product.upsert({
    where: { id: 'prod2' },
    update: {},
    create: {
      id: 'prod2',
      name: 'Samsung Galaxy S24 Ultra',
      brand: 'Samsung',
      category: 'Elektronik',
      description: '256GB, Titanium Gray',
      normalPrice: '49999',
      imageUrl: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800',
      specs: JSON.stringify({
        storage: '256GB',
        color: 'Titanium Gray',
        display: '6.8 inç Dynamic AMOLED 2X'
      }),
    },
  })

  const product3 = await prisma.product.upsert({
    where: { id: 'prod3' },
    update: {},
    create: {
      id: 'prod3',
      name: 'No Frost Buzdolabı',
      brand: 'Bosch',
      category: 'Beyaz Eşya',
      description: '640 Lt, Inox',
      normalPrice: '90000',
      imageUrl: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=800',
      specs: JSON.stringify({
        capacity: '640 Litre',
        color: 'Inox',
        features: 'No Frost, Multi Air Flow'
      }),
    },
  })

  const product4 = await prisma.product.upsert({
    where: { id: 'prod4' },
    update: {},
    create: {
      id: 'prod4',
      name: 'Çamaşır Makinesi',
      brand: 'LG',
      category: 'Beyaz Eşya',
      description: '9 Kg, 1400 Devir',
      normalPrice: '49000',
      imageUrl: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=800',
      specs: JSON.stringify({
        capacity: '9 Kg',
        speed: '1400 Devir',
        features: 'Buhar Teknolojisi, Sessiz Motor'
      }),
    },
  })

  const product5 = await prisma.product.upsert({
    where: { id: 'prod5' },
    update: {},
    create: {
      id: 'prod5',
      name: 'Smart TV 55"',
      brand: 'Asus',
      category: 'Elektronik',
      description: '55 inç 4K UHD Smart TV',
      normalPrice: '50000',
      imageUrl: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800',
      specs: JSON.stringify({
        size: '55 inç',
        resolution: '4K UHD',
        features: 'Smart TV, HDR10, Android TV'
      }),
    },
  })

  const product6 = await prisma.product.upsert({
    where: { id: 'prod6' },
    update: {},
    create: {
      id: 'prod6',
      name: 'Buharlı Ütü',
      brand: 'Philips',
      category: 'Ev Aletleri',
      description: '2400W, Seramik Taban',
      normalPrice: '5000',
      imageUrl: 'https://images.unsplash.com/photo-1580657018950-c7f7d6a6d990?w=800',
      specs: JSON.stringify({
        power: '2400W',
        base: 'Seramik Taban',
        features: 'Buhar Fonksiyonu, Damla Önleme'
      }),
    },
  })

  console.log('✅ Ürünler oluşturuldu')

  // Örnek kampanya
  const campaign = await prisma.campaign.upsert({
    where: { slug: 'iphone-15-pro-kampanya' },
    update: {},
    create: {
      productId: product1.id,
      normalPrice: '54999',
      groupPrice: '49999',
      currency: 'TL',
      minParticipants: 10,
      maxParticipants: 50,
      startAt: new Date(),
      endAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 gün sonra
      status: 'COLLECTING_USERS',
      sellerName: 'TeknoMağaza',
      location: 'İstanbul',
      shippingRules: 'Kargo ücretsiz. 3-5 iş günü içinde teslimat.',
      description: 'iPhone 15 Pro için özel grup alım kampanyası! 10 kişi bir araya geldiğimizde 5000 TL indirim kazanıyoruz.',
      isFeatured: true,
      slug: 'iphone-15-pro-kampanya',
    },
  })

  // Buzdolabı kampanyası
  const campaign2 = await prisma.campaign.upsert({
    where: { slug: 'bosch-buzdolabi-kampanya' },
    update: {},
    create: {
      productId: product3.id,
      normalPrice: '90000',
      groupPrice: '60000',
      currency: 'TL',
      minParticipants: 15,
      maxParticipants: 40,
      startAt: new Date(),
      endAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      status: 'COLLECTING_USERS',
      sellerName: 'Beyaz Eşya Dünyası',
      location: 'Ankara',
      shippingRules: 'Ücretsiz kargo ve kurulum. 5-7 iş günü içinde teslimat.',
      description: 'Bosch No Frost Buzdolabı için muhteşem grup alım fırsatı! 15 kişi bir araya gelip 30.000 TL tasarruf edelim.',
      isFeatured: true,
      slug: 'bosch-buzdolabi-kampanya',
    },
  })

  // Çamaşır makinesi kampanyası
  const campaign3 = await prisma.campaign.upsert({
    where: { slug: 'lg-camasir-makinesi-kampanya' },
    update: {},
    create: {
      productId: product4.id,
      normalPrice: '49000',
      groupPrice: '29000',
      currency: 'TL',
      minParticipants: 12,
      maxParticipants: 35,
      startAt: new Date(),
      endAt: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
      status: 'COLLECTING_USERS',
      sellerName: 'Elektro Market',
      location: 'İzmir',
      shippingRules: 'Kargo ve kurulum ücretsiz. 4-6 iş günü teslimat.',
      description: 'LG Çamaşır Makinesi kampanyası! 12 kişi toplanıp 20.000 TL indirimden faydalanalım.',
      isFeatured: true,
      slug: 'lg-camasir-makinesi-kampanya',
    },
  })

  // TV kampanyası
  const campaign4 = await prisma.campaign.upsert({
    where: { slug: 'asus-smart-tv-kampanya' },
    update: {},
    create: {
      productId: product5.id,
      normalPrice: '50000',
      groupPrice: '30000',
      currency: 'TL',
      minParticipants: 10,
      maxParticipants: 30,
      startAt: new Date(),
      endAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
      status: 'COLLECTING_USERS',
      sellerName: 'Teknoloji Deposu',
      location: 'Bursa',
      shippingRules: 'Ücretsiz kargo. 3-5 iş günü teslimat.',
      description: 'Asus 55" Smart TV için özel grup alım kampanyası! 10 kişi birlikte 20.000 TL kazanalım.',
      isFeatured: true,
      slug: 'asus-smart-tv-kampanya',
    },
  })

  // Ütü kampanyası
  const campaign5 = await prisma.campaign.upsert({
    where: { slug: 'philips-buharli-utu-kampanya' },
    update: {},
    create: {
      productId: product6.id,
      normalPrice: '5000',
      groupPrice: '3000',
      currency: 'TL',
      minParticipants: 20,
      maxParticipants: 100,
      startAt: new Date(),
      endAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      status: 'COLLECTING_USERS',
      sellerName: 'Ev Aletleri Pro',
      location: 'İstanbul',
      shippingRules: 'Kargo ücretsiz. 2-3 iş günü teslimat.',
      description: 'Philips Buharlı Ütü kampanyası! 20 kişi toplanıp 2.000 TL indirimden yararlanalım.',
      isFeatured: true,
      slug: 'philips-buharli-utu-kampanya',
    },
  })

  console.log('✅ Kampanyalar oluşturuldu')

  // E-posta abonesi
  await prisma.emailSubscription.upsert({
    where: { email: 'subscriber@test.com' },
    update: {},
    create: {
      email: 'subscriber@test.com',
      source: 'home_page',
      isActive: true,
    },
  })

  console.log('✅ E-posta abonesi eklendi')
  console.log('\n🎉 Tüm test verileri başarıyla oluşturuldu!')
  console.log('\n📋 Giriş Bilgileri:')
  console.log('Admin: admin@milyonel.com / admin123')
  console.log('Kullanıcı: user@test.com / user123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
