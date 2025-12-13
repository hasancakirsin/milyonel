import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const addressSchema = z.object({
  title: z.string().min(1, 'Başlık gereklidir'),
  fullAddress: z.string().min(1, 'Adres gereklidir'),
  city: z.string().min(1, 'İl gereklidir'),
  district: z.string().min(1, 'İlçe gereklidir'),
  phone: z.string().min(10, 'Geçerli bir telefon numarası girin'),
  isDefault: z.boolean().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Giriş yapmalısınız' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = addressSchema.parse(body);

    // Check if address belongs to user
    const existingAddress = await prisma.address.findUnique({
      where: { id: params.id },
    });

    if (!existingAddress || existingAddress.userId !== session.userId) {
      return NextResponse.json({ error: 'Adres bulunamadı' }, { status: 404 });
    }

    // If this is set as default, unset other defaults
    if (validatedData.isDefault) {
      await prisma.address.updateMany({
        where: {
          userId: session.userId,
          isDefault: true,
          id: { not: params.id },
        },
        data: {
          isDefault: false,
        },
      });
    }

    const address = await prisma.address.update({
      where: { id: params.id },
      data: {
        title: validatedData.title,
        fullAddress: validatedData.fullAddress,
        city: validatedData.city,
        district: validatedData.district,
        phone: validatedData.phone,
        isDefault: validatedData.isDefault || false,
      },
    });

    return NextResponse.json({
      success: true,
      address,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Update address error:', error);
    return NextResponse.json({ error: 'Adres güncellenirken hata oluştu' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Giriş yapmalısınız' }, { status: 401 });
    }

    // Check if address belongs to user
    const existingAddress = await prisma.address.findUnique({
      where: { id: params.id },
    });

    if (!existingAddress || existingAddress.userId !== session.userId) {
      return NextResponse.json({ error: 'Adres bulunamadı' }, { status: 404 });
    }

    await prisma.address.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Adres silindi',
    });
  } catch (error) {
    console.error('Delete address error:', error);
    return NextResponse.json({ error: 'Adres silinirken hata oluştu' }, { status: 500 });
  }
}
