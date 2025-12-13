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

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Giriş yapmalısınız' }, { status: 401 });
    }

    const addresses = await prisma.address.findMany({
      where: { userId: session.userId },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json({ addresses });
  } catch (error) {
    console.error('Get addresses error:', error);
    return NextResponse.json({ error: 'Adresler yüklenirken hata oluştu' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Giriş yapmalısınız' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = addressSchema.parse(body);

    // If this is set as default, unset other defaults
    if (validatedData.isDefault) {
      await prisma.address.updateMany({
        where: {
          userId: session.userId,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    const address = await prisma.address.create({
      data: {
        userId: session.userId,
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

    console.error('Create address error:', error);
    return NextResponse.json({ error: 'Adres eklenirken hata oluştu' }, { status: 500 });
  }
}
