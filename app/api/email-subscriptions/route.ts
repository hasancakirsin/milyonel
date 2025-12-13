import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const emailSchema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi girin'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = emailSchema.parse(body);

    // Check if email already exists
    const existingSubscription = await prisma.emailSubscription.findUnique({
      where: { email: validatedData.email },
    });

    if (existingSubscription) {
      return NextResponse.json(
        { error: 'Bu e-posta adresi zaten kayıtlı' },
        { status: 400 }
      );
    }

    // Create subscription
    const subscription = await prisma.emailSubscription.create({
      data: {
        email: validatedData.email,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'E-posta listemize başarıyla eklendi',
      subscription,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Email subscription error:', error);
    return NextResponse.json(
      { error: 'Abonelik oluşturulurken hata oluştu' },
      { status: 500 }
    );
  }
}
