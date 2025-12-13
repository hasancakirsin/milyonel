import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Giriş yapmalısınız' }, { status: 401 });
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id: params.id },
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Kampanya bulunamadı' }, { status: 404 });
    }

    // Check if campaign is in payment collection phase
    if (campaign.status !== 'COLLECTING_PAYMENTS') {
      return NextResponse.json(
        { error: 'Bu kampanya ödeme aşamasında değil' },
        { status: 400 }
      );
    }

    // Check if user participated
    const participation = await prisma.campaignParticipation.findUnique({
      where: {
        campaignId_userId: {
          campaignId: params.id,
          userId: session.userId,
        },
      },
    });

    if (!participation) {
      return NextResponse.json(
        { error: 'Bu kampanyaya katılmadınız' },
        { status: 400 }
      );
    }

    // Check if user already paid
    const existingOrder = await prisma.order.findFirst({
      where: {
        campaignId: params.id,
        userId: session.userId,
      },
    });

    if (existingOrder) {
      return NextResponse.json(
        { error: 'Bu kampanya için zaten ödeme yaptınız' },
        { status: 400 }
      );
    }

    // Get user's default address
    const defaultAddress = await prisma.address.findFirst({
      where: {
        userId: session.userId,
        isDefault: true,
      },
    });

    // Create order
    const order = await prisma.order.create({
      data: {
        campaignId: params.id,
        userId: session.userId,
        quantity: 1,
        unitPrice: campaign.groupPrice,
        totalAmount: campaign.groupPrice,
        paymentStatus: 'PAID', // In production, this would be PENDING until payment is confirmed
        paymentDate: new Date(),
        shippingAddressId: defaultAddress?.id,
      },
    });

    // In production, you would integrate with a payment gateway here
    // For now, we'll mark the order as paid immediately

    // Check if we should mark campaign as successful
    const orderCount = await prisma.order.count({
      where: {
        campaignId: params.id,
        paymentStatus: 'PAID',
      },
    });

    const participationCount = await prisma.campaignParticipation.count({
      where: { campaignId: params.id },
    });

    // If all participants paid or payment deadline passed
    if (orderCount >= campaign.minParticipants) {
      await prisma.campaign.update({
        where: { id: params.id },
        data: {
          status: 'SUCCESSFUL',
        },
      });
    }

    return NextResponse.json({
      success: true,
      order,
      message: 'Ödeme başarıyla alındı',
    });
  } catch (error) {
    console.error('Payment error:', error);
    return NextResponse.json({ error: 'Ödeme sırasında hata oluştu' }, { status: 500 });
  }
}
