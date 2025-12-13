import { NextRequest, NextResponse } from 'next/server';
import { checkAdmin } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await checkAdmin();

    if (!admin) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id: params.id },
      include: {
        product: true,
        orders: {
          where: {
            paymentStatus: 'PAID',
          },
          include: {
            user: {
              select: {
                name: true,
                email: true,
                phone: true,
              },
            },
            shippingAddress: true,
          },
        },
      },
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Kampanya bulunamadı' }, { status: 404 });
    }

    // Generate CSV
    const headers = [
      'Sipariş ID',
      'Müşteri Adı',
      'E-posta',
      'Telefon',
      'Miktar',
      'Tutar',
      'Para Birimi',
      'Adres Başlığı',
      'Adres',
      'İlçe',
      'İl',
      'Adres Telefon',
      'Ödeme Tarihi',
    ];

    const rows = campaign.orders.map((order) => [
      order.id,
      order.user.name,
      order.user.email,
      order.user.phone,
      order.quantity.toString(),
      order.totalAmount.toString(),
      campaign.currency,
      order.shippingAddress?.title || '',
      order.shippingAddress?.fullAddress || '',
      order.shippingAddress?.district || '',
      order.shippingAddress?.city || '',
      order.shippingAddress?.phone || '',
      order.paymentDate ? new Date(order.paymentDate).toLocaleDateString('tr-TR') : '',
    ]);

    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        row.map((cell) => `"${cell.toString().replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n');

    // Add BOM for UTF-8 Excel compatibility
    const bom = '\uFEFF';
    const csvWithBom = bom + csvContent;

    return new NextResponse(csvWithBom, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${campaign.slug}_orders.csv"`,
      },
    });
  } catch (error) {
    console.error('Export orders error:', error);
    return NextResponse.json(
      { error: 'CSV oluşturulurken hata oluştu' },
      { status: 500 }
    );
  }
}
