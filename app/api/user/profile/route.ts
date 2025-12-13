import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession, hashPassword } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

const updateProfileSchema = z.object({
  name: z.string().min(1, 'İsim gereklidir'),
  phone: z.string().min(10, 'Geçerli bir telefon numarası girin'),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6, 'Şifre en az 6 karakter olmalıdır').optional(),
});

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Giriş yapmalısınız' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = updateProfileSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    // Prepare update data
    const updateData: any = {
      name: validatedData.name,
      phone: validatedData.phone,
    };

    // If trying to update password
    if (validatedData.newPassword && validatedData.currentPassword) {
      // Verify current password
      const isPasswordValid = await bcrypt.compare(
        validatedData.currentPassword,
        user.passwordHash
      );

      if (!isPasswordValid) {
        return NextResponse.json({ error: 'Mevcut şifre yanlış' }, { status: 400 });
      }

      // Hash new password
      updateData.passwordHash = await hashPassword(validatedData.newPassword);
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: session.userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Update profile error:', error);
    return NextResponse.json({ error: 'Profil güncellenirken hata oluştu' }, { status: 500 });
  }
}
