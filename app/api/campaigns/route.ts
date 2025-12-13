import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const isFeatured = searchParams.get('featured');

    // Build where clause
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (isFeatured === 'true') {
      where.isFeatured = true;
    }

    if (category) {
      where.product = {
        category,
      };
    }

    // Fetch campaigns
    const campaigns = await prisma.campaign.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            brand: true,
            category: true,
            imageUrl: true,
          },
        },
        _count: {
          select: {
            participations: true,
            orders: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Format response
    const formattedCampaigns = campaigns.map((campaign) => ({
      id: campaign.id,
      slug: campaign.slug,
      product: campaign.product,
      normalPrice: campaign.normalPrice.toString(),
      groupPrice: campaign.groupPrice.toString(),
      currency: campaign.currency,
      minParticipants: campaign.minParticipants,
      maxParticipants: campaign.maxParticipants,
      currentParticipants: campaign._count.participations,
      paidOrders: campaign._count.orders,
      startAt: campaign.startAt.toISOString(),
      endAt: campaign.endAt.toISOString(),
      paymentDeadlineAt: campaign.paymentDeadlineAt?.toISOString(),
      status: campaign.status,
      sellerName: campaign.sellerName,
      location: campaign.location,
      isFeatured: campaign.isFeatured,
      description: campaign.description,
      shippingRules: campaign.shippingRules,
      createdAt: campaign.createdAt.toISOString(),
    }));

    return NextResponse.json({
      campaigns: formattedCampaigns,
      total: formattedCampaigns.length,
    });

  } catch (error) {
    console.error('Get campaigns error:', error);
    return NextResponse.json(
      { error: 'Kampanyalar yüklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
