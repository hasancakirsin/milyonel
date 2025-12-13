import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Giriş yapmalısınız' }, { status: 401 });
    }

    const { id } = await params;

    const campaign = await prisma.campaign.findUnique({
      where: { id },
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Kampanya bulunamadı' }, { status: 404 });
    }

    // Check if campaign is in collecting users phase
    if (campaign.status !== 'COLLECTING_USERS') {
      return NextResponse.json(
        { error: 'Bu kampanya katılıma açık değil' },
        { status: 400 }
      );
    }

    // Check if user already participated
    const existingParticipation = await prisma.campaignParticipation.findUnique({
      where: {
        campaignId_userId: {
          campaignId: id,
          userId: session.userId,
        },
      },
    });

    if (existingParticipation) {
      return NextResponse.json(
        { error: 'Bu kampanyaya zaten katıldınız' },
        { status: 400 }
      );
    }

    // Create participation
    const participation = await prisma.campaignParticipation.create({
      data: {
        campaignId: id,
        userId: session.userId,
      },
    });

    // Check if minimum participants reached
    const participationCount = await prisma.campaignParticipation.count({
      where: { campaignId: id },
    });

    if (participationCount >= campaign.minParticipants) {
      // Update campaign status to COLLECTING_PAYMENTS
      await prisma.campaign.update({
        where: { id },
        data: {
          status: 'COLLECTING_PAYMENTS',
          paymentDeadlineAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        },
      });
    }

    return NextResponse.json({
      success: true,
      participation,
    });
  } catch (error) {
    console.error('Join campaign error:', error);
    return NextResponse.json({ error: 'Katılım sırasında hata oluştu' }, { status: 500 });
  }
}
