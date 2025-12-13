import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { checkAdmin } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';

const statusSchema = z.object({
  status: z.enum(['DRAFT', 'COLLECTING_USERS', 'COLLECTING_PAYMENTS', 'SUCCESSFUL', 'FAILED']),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await checkAdmin();

    if (!admin) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const body = await request.json();
    const { status } = statusSchema.parse(body);

    const campaign = await prisma.campaign.findUnique({
      where: { id: params.id },
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Kampanya bulunamadı' }, { status: 404 });
    }

    const updateData: any = { status };

    // If changing to COLLECTING_PAYMENTS, set payment deadline
    if (status === 'COLLECTING_PAYMENTS' && !campaign.paymentDeadlineAt) {
      updateData.paymentDeadlineAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    }

    const updatedCampaign = await prisma.campaign.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      campaign: updatedCampaign,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Update campaign status error:', error);
    return NextResponse.json(
      { error: 'Durum güncellenirken hata oluştu' },
      { status: 500 }
    );
  }
}
