import { NextRequest, NextResponse } from 'next/server';
import { checkAdmin } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const admin = await checkAdmin();

    if (!admin) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const subscriptions = await prisma.emailSubscription.findMany({
      orderBy: { createdAt: 'desc' },
    });

    // Generate CSV
    const headers = ['E-posta', 'Kaynak', 'Durum', 'Kayıt Tarihi'];

    const rows = subscriptions.map((subscription) => [
      subscription.email,
      subscription.source || 'home_page',
      subscription.isActive ? 'Aktif' : 'Pasif',
      new Date(subscription.createdAt).toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
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
        'Content-Disposition': 'attachment; filename="email_aboneleri.csv"',
      },
    });
  } catch (error) {
    console.error('Export emails error:', error);
    return NextResponse.json(
      { error: 'CSV oluşturulurken hata oluştu' },
      { status: 500 }
    );
  }
}
