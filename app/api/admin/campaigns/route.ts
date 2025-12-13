import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { checkAdmin } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';

const campaignSchema = z.object({
  productId: z.string().min(1, 'Ürün seçilmelidir'),
  normalPrice: z.number().positive('Normal fiyat pozitif olmalıdır'),
  groupPrice: z.number().positive('Grup fiyatı pozitif olmalıdır'),
  currency: z.string().default('TL'),
  minParticipants: z.number().int().positive('Minimum katılımcı en az 1 olmalıdır'),
  maxParticipants: z.number().int().positive().optional().nullable(),
  startAt: z.string().transform((str) => new Date(str)),
  endAt: z.string().transform((str) => new Date(str)),
  sellerName: z.string().min(1, 'Satıcı adı gereklidir'),
  location: z.string().optional().nullable(),
  shippingRules: z.string().min(1, 'Kargo kuralları gereklidir'),
  description: z.string().optional().nullable(),
  isFeatured: z.boolean().default(false),
  status: z.enum(['DRAFT', 'COLLECTING_USERS', 'COLLECTING_PAYMENTS', 'SUCCESSFUL', 'FAILED']).default('DRAFT'),
});

export async function POST(request: NextRequest) {
  try {
    const admin = await checkAdmin();

    if (!admin) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = campaignSchema.parse(body);

    // Get product to generate slug
    const product = await prisma.product.findUnique({
      where: { id: validatedData.productId },
    });

    if (!product) {
      return NextResponse.json({ error: 'Ürün bulunamadı' }, { status: 404 });
    }

    // Generate slug from product name
    const baseSlug = product.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Ensure slug is unique
    let slug = baseSlug;
    let counter = 1;
    while (await prisma.campaign.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Create campaign
    const campaign = await prisma.campaign.create({
      data: {
        productId: validatedData.productId,
        slug,
        normalPrice: validatedData.normalPrice.toString(),
        groupPrice: validatedData.groupPrice.toString(),
        currency: validatedData.currency,
        minParticipants: validatedData.minParticipants,
        maxParticipants: validatedData.maxParticipants,
        startAt: validatedData.startAt,
        endAt: validatedData.endAt,
        sellerName: validatedData.sellerName,
        location: validatedData.location,
        shippingRules: validatedData.shippingRules,
        description: validatedData.description,
        isFeatured: validatedData.isFeatured,
        status: validatedData.status,
      },
      include: {
        product: true,
      },
    });

    return NextResponse.json({
      success: true,
      campaign,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Create campaign error:', error);
    return NextResponse.json(
      { error: 'Kampanya oluşturulurken hata oluştu' },
      { status: 500 }
    );
  }
}
