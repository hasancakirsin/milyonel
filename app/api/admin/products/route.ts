import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { checkAdmin } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';

const productSchema = z.object({
  name: z.string().min(1, 'Ürün adı gereklidir'),
  brand: z.string().min(1, 'Marka gereklidir'),
  category: z.enum(['BEYAZ_ESYA', 'ELEKTRONIK', 'MOBILYA', 'TEKSTIL', 'DIGER']),
  normalPrice: z.number().positive('Normal fiyat pozitif olmalıdır'),
  description: z.string().min(1, 'Açıklama gereklidir'),
  imageUrl: z.string().url('Geçerli bir URL giriniz'),
  specs: z.record(z.any()).optional().nullable(),
});

export async function GET(request: NextRequest) {
  try {
    const admin = await checkAdmin();

    if (!admin) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Get products error:', error);
    return NextResponse.json(
      { error: 'Ürünler yüklenirken hata oluştu' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await checkAdmin();

    if (!admin) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = productSchema.parse(body);

    const product = await prisma.product.create({
      data: {
        name: validatedData.name,
        brand: validatedData.brand,
        category: validatedData.category,
        normalPrice: validatedData.normalPrice.toString(),
        description: validatedData.description,
        imageUrl: validatedData.imageUrl,
        specs: validatedData.specs ? JSON.stringify(validatedData.specs) : null,
      },
    });

    return NextResponse.json({
      success: true,
      product,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Create product error:', error);
    return NextResponse.json(
      { error: 'Ürün oluşturulurken hata oluştu' },
      { status: 500 }
    );
  }
}
